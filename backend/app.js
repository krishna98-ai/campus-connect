import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust the deployment proxy
app.set("trust proxy", 1);

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Limit requests
// app.use(
//   "/api/",
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 200,
//   }),
// );

// app.use(
//   "/api/auth/login",
//   rateLimit({
//     windowMs: 60 * 60 * 1000,
//     max: 20,
//   }),
// );

// app.use(
//   "/api/auth/signup",
//   rateLimit({
//     windowMs: 60 * 60 * 1000,
//     max: 20,
//   }),
// );

// Read request data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// Request logs
app.use(morgan("dev"));

// Uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Campus Connect API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Handle unknown routes and errors
app.use(notFound);
app.use(errorHandler);

export default app;
