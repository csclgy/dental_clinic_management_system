import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import path from "path";
dotenv.config();
const app = express();
const __dirname = path.resolve(); // if using ES modules

// serve /uploads/appointments
app.use(
  "/uploads/appointments",
  express.static(path.join(__dirname, "uploads/appointments"))
);
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use('/auth', authRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
