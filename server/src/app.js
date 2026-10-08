import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import sessionRouter from "./routes/session.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === env.clientUrl) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed");
      error.statusCode = 403;
      error.code = "CORS_ORIGIN_DENIED";
      callback(error);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json({ limit: "32kb" }));

app.get("/api", (_request, response) => {
  response.json({ success: true, name: "VoiceOrder API" });
});

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    message: "VoiceOrder API is running",
  });
});

app.use("/api/session", sessionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
