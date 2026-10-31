import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import redis from "../shared/redis/redis.js";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import proxy from "express-http-proxy";
import { proxyWithUser } from "./utils/proxyWithHeaders.js";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import cookieParser from "cookie-parser"
import axios from "axios";
dotenv.config();
const app = express();
const port=process.env.PORT || 5000
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(
  "/uploads",
  express.static("uploads")
);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'none'"], // Disallow all scripts in API responses / uploads
      styleSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});

const agentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 agent invocations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI generations from this IP, please try again after an hour." }
});

app.use(generalLimiter);
app.use("/api/auth",proxy(process.env.AUTH_SERVICE, { limit: '50mb' }))
app.use("/api/me",protect,getCurrentUser)
app.use("/api/chat",protect,proxyWithUser(process.env.CHAT_SERVICE))
app.use("/api/agent", protect, agentLimiter, proxyWithUser(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,proxyWithUser(process.env.BILLING_SERVICE))


app.get("/", (req, res) => {
  res.status(200).json({
    service: "gateway",
    status: "ok"
  });
});

app.get("/api/download", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("No URL provided");
    
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream"
    });
    
    // Attempt to guess extension from content-type or default to png
    const contentType = response.headers["content-type"] || "image/png";
    const ext = contentType.split("/")[1] || "png";
    
    res.setHeader("Content-Disposition", `attachment; filename="adtAI-image-${Date.now()}.${ext}"`);
    res.setHeader("Content-Type", contentType);
    
    response.data.pipe(res);
  } catch (error) {
    console.error("Download proxy error:", error.message);
    res.status(500).send("Download failed");
  }
});


app.listen(port, () => {
  console.log(
    `Gateway running on ${port}`
  );
});
