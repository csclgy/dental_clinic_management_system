import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import path from "path";
import orRangeRoutes from "./routes/orRangeRoutes.js";
import "./services/appointmentReminder.js";

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://dental-clinic-management-system-frontend-wipu.onrender.com" // deployed frontend
];

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads/gcash", express.static(path.join(process.cwd(), "uploads/gcash")));

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use('/auth', authRouter);
app.use("/api/or-range", orRangeRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
