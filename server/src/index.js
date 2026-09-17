import "dotenv/config";

import express from "express";
import cors from "cors";
import tutorRoutes from "./routes/tutor.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple health check, handy for confirming the server is up before wiring the frontend to it.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tutor", tutorRoutes);

app.listen(PORT, () => {
  console.log(`PastQuestion API server running on http://localhost:${PORT}`);
});
