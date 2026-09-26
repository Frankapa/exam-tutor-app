import "dotenv/config";

import express from "express";
import cors from "cors";
import tutorRoutes from "./routes/tutor.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());


app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tutor", tutorRoutes);

app.listen(PORT, () => {
  console.log(`PastQuestion API server running on http://localhost:${PORT}`);
});
