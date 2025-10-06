import express from "express";
import { sendSms } from "../services/semaphoreService.js";

const router = express.Router();

router.post("/send-sms", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({ error: "Missing number or message" });
    }

    const result = await sendSms(number, message);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
