import express from "express";
import { chat, generateTitle } from "../controllers/agent.controller.js";
import multer from "../config/multer.js";

const router = express.Router();

router.post(
 "/chat",
 multer.array("files", 10),
 chat
);

router.post("/title", generateTitle);

export default router;