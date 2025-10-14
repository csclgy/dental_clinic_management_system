import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import path from "path";
import { connectToDatabase } from './lib/db.js';

dotenv.config();
const app = express();

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads/gcash", express.static(path.join(process.cwd(), "uploads/gcash")));

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://dental-clinic-management-system-frontend-wipu.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use('/auth', authRouter);

// Test DB connection before starting server
connectToDatabase()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to database. Server not started.", err);
  });
