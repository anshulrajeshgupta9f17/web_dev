import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/itineraries", itineraryRoutes);

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error("[err]", err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
connectDB()
  .then(() => app.listen(port, () => console.log(`[server] listening on :${port}`)))
  .catch((e) => { console.error(e); process.exit(1); });
