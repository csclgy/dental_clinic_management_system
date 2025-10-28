import cron from "node-cron";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { sendEmail } from "./emailService.js";

dotenv.config();

// ✅ MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ✅ Function to format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// ✅ DAILY JOB: runs at 8:00 AM every day
cron.schedule("0 8 * * *", async () => {
  console.log("📅 Checking appointments for reminders...");

  const today = new Date();
  const todayStr = formatDate(today);

  // 📅 Compute tomorrow’s date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);

  try {
    // 🩵 1️⃣ SAME-DAY REMINDERS (appointments today)
    const [todayAppointments] = await pool.query(
      `SELECT p_email, p_fname, p_lname, pref_date, pref_time, procedure_type 
       FROM appointments 
       WHERE DATE(pref_date) = ? AND appointment_status = 'pending'`,
      [todayStr]
    );

    for (const appt of todayAppointments) {
      const htmlMessage = `
        <h2>Appointment Reminder (Today)</h2>
        <p>Dear ${appt.p_fname} ${appt.p_lname},</p>
        <p>This is a friendly reminder that your dental appointment is <strong>today (${appt.pref_date})</strong> at <strong>${appt.pref_time}</strong>.</p>
        <p>Please arrive at least 10–15 minutes before your scheduled time.</p>
        <p>Procedure: <strong>${appt.procedure_type}</strong></p>
        <br>
        <p>Thank you,<br>The Dental Clinic Team</p>
      `;
      await sendEmail(appt.p_email, "Appointment Reminder - Today", htmlMessage);
    }

    if (todayAppointments.length > 0)
      console.log(`✅ Sent ${todayAppointments.length} same-day reminders.`);
    else
      console.log("No same-day appointments today.");

    // 💙 2️⃣ DAY-BEFORE REMINDERS (appointments tomorrow)
    const [tomorrowAppointments] = await pool.query(
      `SELECT p_email, p_fname, p_lname, pref_date, pref_time, procedure_type 
       FROM appointments 
       WHERE DATE(pref_date) = ? AND appointment_status = 'pending'`,
      [tomorrowStr]
    );

    for (const appt of tomorrowAppointments) {
      const htmlMessage = `
        <h2>Appointment Reminder (Tomorrow)</h2>
        <p>Dear ${appt.p_fname} ${appt.p_lname},</p>
        <p>This is a reminder that you have a dental appointment <strong>tomorrow (${appt.pref_date})</strong> at <strong>${appt.pref_time}</strong>.</p>
        <p>Please make sure to arrive early and bring any necessary documents if required.</p>
        <p>Procedure: <strong>${appt.procedure_type}</strong></p>
        <br>
        <p>Thank you,<br>The Dental Clinic Team</p>
      `;
      await sendEmail(appt.p_email, "Appointment Reminder - Tomorrow", htmlMessage);
    }

    if (tomorrowAppointments.length > 0)
      console.log(`✅ Sent ${tomorrowAppointments.length} day-before reminders.`);
    else
      console.log("No appointments scheduled for tomorrow.");

  } catch (error) {
    console.error("❌ Error sending reminders:", error);
  }
});
