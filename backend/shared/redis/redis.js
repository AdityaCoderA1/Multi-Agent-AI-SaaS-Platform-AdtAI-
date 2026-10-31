import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6179");

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});




export default redis;