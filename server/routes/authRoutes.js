import express from 'express';
import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateToken } from "../middleware/authMiddleware.js";
import AWS from "aws-sdk";
import { sendEmail } from "../services/emailService.js";
import { uploadRefund, uploadAppointment, uploadHMO, uploadBilling } from "../services/s3Uploads.js";
import fs from "fs";

dotenv.config({ path: './.env' }); // explicit path

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const router = express.Router();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

console.log("✅ AWS Bucket:", process.env.AWS_BUCKET_NAME);
console.log("AWS_BUCKET_NAME=", process.env.AWS_BUCKET_NAME);

// for register.jsx (REGISTRATION)
router.post('/register', async (req, res) => {
  const {
    user_name,
    user_password,
    email,
    contact_no,
    fname,
    mname,
    lname,
    date_birth,
    gender,
    age,
    religion,
    nationality,
    home_address,
    city,
    province,
    occupation,
    gcash_num,
    blood_type
  } = req.body;

  // 🛑 Validate required fields
  if (!user_name || !email || !user_password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    const db = await connectToDatabase();

    // 🔍 Check if username OR email already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE user_name = ? OR email = ?",
      [user_name, email]
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.user_name === user_name) {
        return res.status(409).json({ message: "Username is already taken" });
      } else if (existing.email === email) {
        return res.status(409).json({ message: "Email is already registered" });
      }
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // 💾 Insert new user
    await db.query(
      `INSERT INTO users 
      (user_name, user_password, role, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num, blood_type, user_status) 
      VALUES (?, ?, "patient", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")`,
      [
        user_name,
        hashedPassword,
        email,
        contact_no,
        fname,
        mname,
        lname,
        date_birth,
        gender,
        age,
        religion,
        nationality,
        home_address,
        city,
        province,
        occupation,
        gcash_num,
        blood_type
      ]
    );
    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for login.jsx (LOGIN)
router.post('/login', async (req, res) => {
  const { user_name, user_password } = req.body;

  if (!user_name || !user_password) return res.status(400).json({ message: "Username and password are required" });

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM users WHERE user_name = ?', [user_name]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ user_id: user.user_id, user_name: user.user_name, role: user.role, fname: user.fname }, JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      token,
      user: { user_id: user.user_id, user_name: user.user_name, email: user.email, role: user.role, fname: user.fname }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//=============================================== PATIENT BACKEND ROUTES =============================================== 
// for profile (DISPLAY)
router.get('/me', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT user_id, user_name, role, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num FROM users WHERE user_id = ?", [decoded.user_id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("ME route error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// for profilelogin.jsx (UPDATE LOGIN INFO)
router.put("/update", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { user_name, email, contact_no, gcash_num } = req.body;

    const db = await connectToDatabase();

    // ✅ 1️⃣ Update user info
    await db.query(
      "UPDATE users SET user_name = ?, email = ?, contact_no = ?, gcash_num = ? WHERE user_id = ?",
      [user_name, email, contact_no, gcash_num, decoded.user_id]
    );

    // ✅ 2️⃣ Insert Audit Trail Entry
    const action = "Update Profile";
    const description = `Updated profile information for ${user_name}`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    // ✅ 3️⃣ Send response
    return res.json({ message: "Profile updated successfully and audit logged." });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for profileinfo.jsx (UPDATE PERSONAL INFO)
router.put("/updateinfo", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const {
      fname,
      mname,
      lname,
      date_birth,
      gender,
      age,
      religion,
      nationality,
      home_address,
      city,
      province,
      occupation
    } = req.body;

    const db = await connectToDatabase();

    // ✅ 1️⃣ Update user's personal info
    await db.query(
      `UPDATE users 
       SET fname = ?, mname = ?, lname = ?, date_birth = ?, gender = ?, age = ?, 
           religion = ?, nationality = ?, home_address = ?, city = ?, province = ?, occupation = ?
       WHERE user_id = ?`,
      [fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, decoded.user_id]
    );

    // ✅ 2️⃣ Insert into audit trail
    const action = "Update Personal Info";
    const description = `Updated personal details for ${fname} ${lname}`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    // ✅ 3️⃣ Send response
    return res.json({ message: "Personal info updated successfully and audit logged." });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for profilechange.jsx (UPDATE USER PASSWORD)
router.put("/change-password", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();

    // ✅ 1️⃣ Verify user exists
    const [rows] = await db.query("SELECT user_password FROM users WHERE user_id = ?", [decoded.user_id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    // ✅ 2️⃣ Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].user_password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    // ✅ 3️⃣ Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET user_password = ? WHERE user_id = ?", [hashedNewPassword, decoded.user_id]);

    // ✅ 4️⃣ Insert into audit trail
    const action = "Change Password";
    const description = `User ${decoded.user_name} changed their account password.`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    // ✅ 5️⃣ Return success response
    return res.json({ message: "Password changed successfully and audit logged." });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Fields configuration: downpayment + multiple photos
const cpUpload = uploadAppointment.fields([
  { name: "downpayment_proof", maxCount: 1 },
  { name: "photos", maxCount: 10 },
]);

router.post(
  "/appointments/upload",
  uploadAppointment.fields([
    { name: "downpayment_proof", maxCount: 1 },
    { name: "photos", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const downpaymentProof = req.files["downpayment_proof"]?.[0]?.location; // ✅ AWS S3 URL
      const photos = req.files["photos"]?.map((file) => file.location); // ✅ AWS S3 URLs

      res.json({
        message: "Files uploaded successfully!",
        downpaymentProof,
        photos,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// Create Appointment
router.post("/appointments", authenticateToken, cpUpload, async (req, res) => {
  try {
    const db = await connectToDatabase();

    let {
      procedure_type,
      pref_date,
      pref_time,
      payment_method,
      attending_dentist,
      or_num,
      payment_status,
      total_service_charged,
      total_charged,
      appointment_status,
      p_fname,
      p_mname,
      p_lname,
      p_gender,
      p_age,
      p_date_birth,
      p_home_address,
      p_email,
      p_contact_no,
      p_blood_type,
    } = req.body;

    // ✅ Handle downpayment proof URL (from S3)
    let downpaymentProofFile = null;
    if (procedure_type === "Dentures" && req.files["downpayment_proof"]) {
      downpaymentProofFile = req.files["downpayment_proof"][0].location; // AWS S3 URL
    }

    // ✅ Required fields
    if (!procedure_type || !pref_date || !pref_time || !payment_method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert appointment
    const [appointmentResult] = await db.query(
      `INSERT INTO appointment
      (user_name, procedure_type, pref_date, pref_time, payment_method, downpayment_proof,
       attending_dentist, or_num, payment_status, total_service_charged, total_charged, appointment_status,
       p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
       p_home_address, p_email, p_contact_no, p_blood_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_name,
        procedure_type,
        pref_date,
        pref_time,
        payment_method,
        downpaymentProofFile,
        attending_dentist || "Unassigned",
        or_num || null,
        payment_status || "pending",
        total_service_charged || 0,
        total_charged || 0,
        appointment_status || "pending",
        p_fname,
        p_mname,
        p_lname,
        p_gender,
        p_age,
        p_date_birth,
        p_home_address,
        p_email,
        p_contact_no,
        p_blood_type,
      ]
    );

    const appoint_id = appointmentResult.insertId;

    // ✅ Insert multiple uploaded photos (if any)
    if (req.files["photos"]) {
      for (const file of req.files["photos"]) {
        await db.query(
          `INSERT INTO uploadedphotos (up_url, appoint_id) VALUES (?, ?)`,
          [file.location, appoint_id] // S3 URL
        );
      }
    }

    // --- NEW: Insert notification with expiry ---
    await db.query(
      `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'appointment')`,
      [
        req.user.user_id,
        "Appointment Submitted",
        `Your appointment for ${procedure_type} on ${pref_date} at ${pref_time} has been submitted and is under review.`,
      ]
    );

    const [staffRows] = await db.query(
      `SELECT user_id FROM users WHERE role IN ('admin', 'receptionist')`
    );

    for (const staff of staffRows) {
      await db.query(
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category)
        VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'appointment')`,
        [
          staff.user_id,
          "New Appointment Submitted",
          `Patient ${p_fname} ${p_lname} submitted an appointment for ${procedure_type} on ${pref_date} at ${pref_time}.`,
        ]
      );
    }

    // --- Send confirmation email to patient ---
    try {
      const emailSubject = "Your Dental Appointment Has Been Submitted!";
      const emailBody = `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
        
        <div style="background-color: #00458B; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
          <p style="color: #cce3f5; margin: 5px 0 0;">Appointment Confirmation</p>
        </div>

        <div style="padding: 25px; color: #333;">
          <p>Dear <strong>${p_fname} ${p_lname}</strong>,</p>
          <p>Your appointment has been successfully <strong>submitted</strong> with the following details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Procedure</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${procedure_type}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Date</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pref_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Time</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pref_time}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${payment_method}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Attending Dentist</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${attending_dentist || "Unassigned"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${appointment_status || "Pending"}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">We’ll notify you once your appointment has been reviewed and confirmed.</p>
          <p>Thank you for choosing <strong>Arciaga-Juntilla TMJ Ortho Dental Clinic</strong>!</p>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://dental-clinic-management-system-frontend-wipu.onrender.com/" 
              style="background-color: #01D5C4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
              View Your Appointment
            </a>
          </div>
        </div>

        <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
          <p>This is an automated message from Arciaga-Juntilla TMJ Ortho Dental Clinic.</p>
          <p>Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  `;

      await sendEmail(p_email, emailSubject, emailBody);
      console.log("Email sent to:", p_email);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return res.status(201).json({ message: "Appointment created successfully! A confirmation email has been sent." });
  } catch (err) {
    console.error("Create appointment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const userId = req.params.id;

    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// for transmed.js
router.get("/my-upcoming", authenticateToken, async (req, res) => {
  const db = await connectToDatabase();

  try {
    const patientUsername = req.user.user_name;
    const query = `
      SELECT *
      FROM appointment
      WHERE user_name = ?
        AND (appointment_status = 'pending' OR appointment_status = 'cancel with refund request')
      ORDER BY pref_date ASC
    `;
    const [rows] = await db.query(query, [patientUsername]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching upcoming appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/myappointmenthistory", authenticateToken, async (req, res) => {
  const db = await connectToDatabase();

  try {
    const patientUsername = req.user.user_name;
    const query = `
      SELECT *
      FROM appointment
      WHERE user_name = ?
        AND (appointment_status = 'done' OR appointment_status = 'cancelled')
      ORDER BY pref_date ASC
    `;
    const [rows] = await db.query(query, [patientUsername]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching appointment history:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DISPLAY CONSULTATION with charged items
router.get("/viewmyconsultation/:appointId", async (req, res) => {
  try {
    const { appointId } = req.params;
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT * FROM appointment WHERE appoint_id = ?",
      [appointId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Consultation not found" });

    const consultation = rows[0];

    const [chargedItems] = await db.query(
      "SELECT ci_id, inv_id, ci_item_name, ci_quantity, ci_amount FROM chargeditem WHERE appoint_id = ?",
      [appointId]
    );

    const [selectedTeeth] = await db.query(
      "SELECT st_id, appoint_id, st_number, st_name FROM selectedteeth WHERE appoint_id = ?",
      [appointId]
    );

    const [cancelInfo] = await db.query(
      "SELECT * FROM cancelled WHERE appoint_id = ?",
      [appointId]
    );

    const [photos] = await db.query(
      "SELECT * FROM uploadedphotos WHERE appoint_id = ?",
      [appointId]
    );

    res.json({ consultation, chargedItems, selectedTeeth, cancelInfo, photos });
  } catch (err) {
    console.error("Display consultation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//=============================================== ADMIN BACKEND ROUTES =============================================== 

//################################ USERS MANAGEMENT ################################
// for adminuseradd.jsx (ADD NEW USER)
router.post('/adduser', async (req, res) => {
  const { user_name, user_password, role, email, contact_no, fname, mname, lname, date_birth, gender, age } = req.body;

  if (!user_name || !email || !user_password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(user_password, 10);
    await db.query(
      `INSERT INTO users 
      (user_name, user_password, role, email, contact_no, fname, mname, lname, date_birth, gender, age, user_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")`,
      [user_name, hashedPassword, role, email, contact_no, fname, mname, lname, date_birth, gender, age]
    );

    // Insert into audit trail
    const action = "Add New User";
    const auditDescription = `Added new user account: ${user_name} (${email})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Add User error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for adminusersedit.jsx (UPDATE USERS INFO)
router.put("/updateuserinfo/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const {
      user_name,
      role,
      email,
      contact_no,
      fname,
      mname,
      lname,
      date_birth,
      gender,
      age,
      user_status,
      currentPassword,
      newPassword
    } = req.body;
    const userId = req.params.id;

    const db = await connectToDatabase();

    // First, fetch the existing user (to check current password if needed)
    const [existingUser] = await db.query("SELECT user_password FROM users WHERE user_id = ?", [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let hashedPassword = null;

    // If user wants to update password
    if (newPassword && newPassword.trim() !== "") {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, existingUser[0].user_password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Build query dynamically
    const query = `
      UPDATE users 
      SET user_name = ?, 
          ${hashedPassword ? "user_password = ?," : ""}
          role = ?, 
          email = ?, 
          contact_no = ?, 
          fname = ?, 
          mname = ?, 
          lname = ?,
          date_birth = ?,
          gender = ?,
          age = ?,
          user_status = ?
      WHERE user_id = ?
    `;

    const params = hashedPassword
      ? [user_name, hashedPassword, role, email, contact_no, fname, mname, lname, date_birth, gender, age, user_status, userId]
      : [user_name, role, email, contact_no, fname, mname, lname, date_birth, gender, age, user_status, userId];

    await db.query(query, params);

    // Insert into audit trail
    const action = "Update User Information";
    const auditDescription = `Updated user info for ${fname} ${lname} (${email}) — Role: ${role}, Status: ${user_status}`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );


    return res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for adminusersedit.jsx (DISPLAY USER INFO IN EDIT PAGE)
router.get('/displayuserinfo/:id', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = req.params.id;
    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT user_id, user_name, role, email, contact_no, fname, mname, lname, date_birth, gender, age, user_status FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("Display user error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

//for adminusers.jsx (DISPLAY ALL USERS IN TABLE)
router.get('/displayusers', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT * FROM users"
    );

    return res.json(rows); // returns an array of users
  } catch (err) {
    console.error("Display users error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Deactivate (not delete) user
router.delete("/deleteuserinfo/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params;
    const db = await connectToDatabase();

    // ✅ Instead of deleting, mark as inactive
    const [result] = await db.query(
      "UPDATE users SET user_status = 'inactive' WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Insert into audit trail
    const action = "Deactivate User";
    const auditDescription = `Deactivated user account with ID ${id}`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// ADD NEW PATIENT (with audit trail)
router.post('/addpatient', async (req, res) => {
  const {
    user_name,
    user_password,
    email,
    contact_no,
    gcash_num,
    fname,
    mname,
    lname,
    date_birth,
    gender,
    age,
    religion,
    nationality,
    home_address,
    province,
    city,
    occupation,
    blood_type
  } = req.body;

  if (!user_name || !email || !user_password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    const db = await connectToDatabase();

    // ✅ Step 1: Authenticate and verify role
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Step 2: Check if user already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // ✅ Step 3: Hash password and insert new patient
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const [result] = await db.query(
      `INSERT INTO users 
      (user_name, user_password, role, email, contact_no, gcash_num, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, province, city, occupation, blood_type, user_status) 
      VALUES (?, ?, "patient", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        user_name,
        hashedPassword,
        email,
        contact_no,
        gcash_num,
        fname,
        mname,
        lname,
        date_birth,
        gender,
        age,
        religion,
        nationality,
        home_address,
        province,
        city,
        occupation,
        blood_type
      ]
    );

    // ✅ Step 4: Insert into audit trail
    const action = "Add New Patient";
    const description = `Added new patient "${fname} ${lname}" with username "${user_name}" and email "${email}"`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    // ✅ Step 5: Return success
    return res.status(201).json({ message: "Patient created successfully" });

  } catch (err) {
    console.error("❌ Add Patient error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//for adminpatients.jsx (DISPLAY ALL PATIENTS IN TABLE)
router.get('/displaypatients', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Allow only admin, dentist, and receptionist
    if (
      decoded.role !== "admin" &&
      decoded.role !== "dentist" &&
      decoded.role !== "receptionist"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE role = 'patient'");

    return res.json(rows);
  } catch (err) {
    console.error("Display patients error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// (DISPLAY ALL PATIENTS CONSULTATIONS IN TABLE)
router.get('/displayconsultations', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.role !== "admin" &&
      decoded.role !== "dentist" &&
      decoded.role !== "receptionist"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method,
             downpayment_proof, attending_dentist, or_num, payment_status,
             total_charged, appointment_status,
             p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
             p_home_address, p_email, p_contact_no, p_blood_type
      FROM appointment
      WHERE appointment_status = 'pending' OR appointment_status = 'incomplete' OR appointment_status = 'cancel with refund request'
      ORDER BY pref_date ASC
    `);

    return res.json({ consultations: rows }); // wrap for frontend clarity
  } catch (err) {
    console.error("Display consultations error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// (DISPLAY SPECIFIC PATIENT BY ID + CONSULTATION HISTORY)
router.get('/displaypatient/:id', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.role !== "admin" &&
      decoded.role !== "dentist" &&
      decoded.role !== "receptionist"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const db = await connectToDatabase();

    // Fetch patient info
    const [userRows] = await db.query(
      `SELECT user_id, user_name, email, contact_no, fname, mname, lname, 
              date_birth, gender, age, religion, nationality, home_address, city, province, blood_type 
       FROM users WHERE user_id = ? AND role = 'patient'`,
      [id]
    );

    if (userRows.length === 0) return res.status(404).json({ message: "Patient not found" });

    const patient = userRows[0];

    // Fetch patient’s appointments using user_name
    const [appointmentRows] = await db.query(
      `SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method, 
              downpayment_proof, attending_dentist, or_num, payment_status, 
              total_charged, appointment_status 
       FROM appointment WHERE user_name = ? 
       ORDER BY pref_date DESC`,
      [patient.user_name]
    );

    return res.json({
      patient,
      consultations: appointmentRows
    });

  } catch (err) {
    console.error("Display patient error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DISPLAY CONSULTATION with charged items
router.get("/displayconsultation/:appointId", async (req, res) => {
  try {
    const { appointId } = req.params;
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT * FROM appointment WHERE appoint_id = ?",
      [appointId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Consultation not found" });

    const consultation = rows[0];

    const [chargedItems] = await db.query(
      "SELECT ci_id, inv_id, ci_item_name, ci_quantity, ci_amount FROM chargeditem WHERE appoint_id = ?",
      [appointId]
    );

    const [selectedTeeth] = await db.query(
      "SELECT st_id, appoint_id, st_number, st_name FROM selectedteeth WHERE appoint_id = ?",
      [appointId]
    );

    const [cancelInfo] = await db.query(
      "SELECT * FROM cancelled WHERE appoint_id = ?",
      [appointId]
    );

    const [photos] = await db.query(
      "SELECT * FROM uploadedphotos WHERE appoint_id = ?",
      [appointId]
    );

    res.json({ consultation, chargedItems, selectedTeeth, cancelInfo, photos });
  } catch (err) {
    console.error("Display consultation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// (DISPLAY ALL COMPLETED PATIENTS UNPAID)
router.get('/displayconsultations1', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.role !== "admin" &&
      decoded.role !== "receptionist"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method,
             downpayment_proof, attending_dentist, or_num, payment_status,
             total_charged, appointment_status,
             p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
             p_home_address, p_email, p_contact_no, p_blood_type
      FROM appointment
      WHERE appointment_status = 'done' and  payment_confirmation = 'incomplete'
      ORDER BY pref_date ASC
    `);

    return res.json({ consultations: rows }); // wrap for frontend clarity
  } catch (err) {
    console.error("Display consultations error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// (DISPLAY ALL COMPLETED PATIENTS PAID)
router.get('/displayconsultations2', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {

    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method,
             downpayment_proof, attending_dentist, or_num, payment_status,
             total_charged, appointment_status, payment_confirmation,
             p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
             p_home_address, p_email, p_contact_no, p_blood_type
      FROM appointment
      WHERE appointment_status = 'done' and  payment_confirmation = 'Complete' and hmo_number = 'N/A'
      ORDER BY pref_date ASC
    `);

    return res.json({ consultations: rows }); // wrap for frontend clarity
  } catch (err) {
    console.error("Display consultations error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// (DISPLAY ALL PARTIAL PAYMENTS)
router.get('/displayconsultations3', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method,
             downpayment_proof, attending_dentist, or_num, payment_status,
             total_charged, appointment_status, payment_confirmation,
             p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
             p_home_address, p_email, p_contact_no, p_blood_type
      FROM appointment
      WHERE appointment_status = 'done' and  payment_confirmation = 'incomplete' and payment_status = 'Partial' and  hmo_number = 'N/A'
      ORDER BY pref_date ASC
    `);

    return res.json({ consultations: rows }); // wrap for frontend clarity
  } catch (err) {
    console.error("Display consultations error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

//NEW
// (DISPLAY ALL HMO PAYMENTS)
router.get('/displayconsultations4', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
     SELECT 
    appoint_id, procedure_type, pref_date, pref_time, payment_method,
    downpayment_proof, attending_dentist, or_num, payment_status,
    total_charged, appointment_status, payment_confirmation,
    p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
    p_home_address, p_email, p_contact_no, p_blood_type
  FROM 
    appointment
  WHERE 
    appointment_status = 'done'
    AND payment_confirmation = 'complete'
    AND payment_status = 'Paid'
    AND (hmo_number IS NOT NULL AND hmo_number != 'N/A')
  ORDER BY 
    pref_date ASC;
    `);

    return res.json({ consultations: rows }); // wrap for frontend clarity
  } catch (err) {
    console.error("Display consultations error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create Appointment (Admin Side)
router.post("/createconsultation", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();

    const {
      user_name,
      procedure_type,
      pref_date,
      pref_time,
      attending_dentist,
      or_num,
      payment_method,
      payment_status,
      appointment_status,
      total_service_charged,
      total_charged,
      p_fname,
      p_mname,
      p_lname,
      p_gender,
      p_age,
      p_date_birth,
      p_home_address,
      p_email,
      p_contact_no,
      p_blood_type,
    } = req.body;

    // Basic validation for required fields
    if (!procedure_type || !pref_date || !pref_time || !p_fname || !p_lname) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert appointment
    const [appointmentResult] = await db.query(
      `INSERT INTO appointment
      (user_name, procedure_type, pref_date, pref_time, payment_method, attending_dentist,
      or_num, payment_status, appointment_status, total_service_charged, total_charged,
      p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
      p_home_address, p_email, p_contact_no, p_blood_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_name,
        procedure_type,
        pref_date,
        pref_time,
        payment_method || "cash",
        attending_dentist || "Unassigned",
        or_num || null,
        payment_status || "pending",
        appointment_status || "pending",
        total_service_charged || 0,
        total_charged || 0,
        p_fname,
        p_mname || null,
        p_lname,
        p_gender,
        p_age,
        p_date_birth,
        p_home_address,
        p_email,
        p_contact_no,
        p_blood_type,
      ]
    );

    const appoint_id = appointmentResult.insertId;

    // ✅ Insert into Audit Trail
    const action = "Create Consultation";
    const description = `Created a new consultation for patient ${p_fname} ${p_lname} (${procedure_type}) on ${pref_date} at ${pref_time}`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [req.user.user_name, req.user.role, action, description, created_at]
    );

    res.status(201).json({ message: "Consultation added successfully!", appoint_id });
  } catch (err) {
    console.error("Admin create appointment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get full billing details for an appointment
router.get("/billing/:appointId", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { appointId } = req.params;

    // 1) Get charged items
    const [items] = await db.query(
      `SELECT 
        ci_id,
        ci_item_name,
        ci_quantity, 
        ci_amount,
        ci_status 
      FROM chargeditem
      WHERE appoint_id = ?`,
      [appointId]
    );

    // 2) Get appointment billing info
    const [appointmentRows] = await db.query(
      `SELECT 
        appoint_id,
        payment_method,
        payment_status,
        total_service_charged,
        total_charged,
        p_fname,
        p_lname
      FROM appointment
      WHERE appoint_id = ?`,
      [appointId]
    );

    if (appointmentRows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = appointmentRows[0];

    // 3) Combine into one response
    res.json({
      appointment,   // ✅ contains payment info + totals
      chargedItems: items, // ✅ contains charged items list
    });

  } catch (err) {
    console.error("Error fetching billing:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update charged item
router.put("/updatebilling/:ci_id", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { ci_id } = req.params;
    const { inv_id, ci_item_name, ci_quantity, ci_amount } = req.body;

    // Update query
    // Update charged item (no inv_id)
    const [result] = await db.query(
      `UPDATE chargeditem 
      SET ci_item_name = ?, ci_quantity = ?, ci_amount = ? 
      WHERE ci_id = ?`,
      [ci_item_name, ci_quantity, ci_amount, ci_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Charged item not found" });
    }

    res.json({ message: "Charged item updated successfully" });
  } catch (err) {
    console.error("Error updating charged item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete charged item
router.delete("/deletebilling/:ci_id", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { ci_id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    const [result] = await db.query(
      `DELETE FROM chargeditem WHERE ci_id = ?`,
      [ci_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Charged item not found" });
    }

    res.json({ message: "Charged item deleted successfully" });
  } catch (err) {
    console.error("Error deleting charged item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single charged item by ci_id
router.get("/billing/item/:ci_id", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { ci_id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    const [rows] = await db.query(
      `SELECT ci_id, inv_id, ci_item_name, ci_quantity, ci_amount, appoint_id
       FROM chargeditem
       WHERE ci_id = ?`,
      [ci_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Charged item not found" });
    }

    res.json(rows[0]); // return single object instead of array
  } catch (err) {
    console.error("Error fetching charged item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/gcash/"); // folder where proofs will be stored
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

router.post("/billing/:appointId", authenticateToken, uploadBilling.single("gcash_proof"), async (req, res) => {
  let db;
  try {
    // 🔹 Get fresh connection and start transaction
    db = await connectToDatabase();
    await db.beginTransaction();

    const { appointId } = req.params;
    const {
      inv_id,
      ci_item_name,
      ci_quantity,
      ci_amount,
      ci_type,
      payment_method,
      payment_status,
      total_service_charged,
      hmo_number,
      hmo_provider,
      coverage,
      billing_date,
      due_date
    } = req.body;
    const gcashProof = req.file ? req.file.location : null;
    let insertRes = null;

    // 🔹 Insert charged item/service if provided
    if (ci_item_name && ci_amount != null) {
      const qty = Number(ci_quantity ?? 1);
      const amt = Number(ci_amount);

      if (Number.isNaN(qty) || Number.isNaN(amt)) {
        await db.rollback();
        return res.status(400).json({ message: "Quantity and amount must be numbers" });
      }

      [insertRes] = await db.query(
        `INSERT INTO chargeditem (inv_id, ci_item_name, ci_quantity, ci_amount, appoint_id, ci_status, ci_type)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [inv_id || null, ci_item_name, qty, amt, appointId, ci_type || (inv_id ? "item" : "service")]
      );
    }

    // 🔹 Calculate totals
    const [sumRows] = await db.query(
      `SELECT COALESCE(SUM(ci_quantity * ci_amount), 0) AS items_total
       FROM chargeditem
       WHERE appoint_id = ?`,
      [appointId]
    );
    const itemsTotal = sumRows[0]?.items_total || 0;

    // 🔹 Lock appointment row
    const [appRows] = await db.query(
      `SELECT total_service_charged, or_num
       FROM appointment
       WHERE appoint_id = ? FOR UPDATE`,
      [appointId]
    );

    const svc = total_service_charged != null ? Number(total_service_charged) : appRows[0]?.total_service_charged || 0;
    const total_charged = Number(itemsTotal) + Number(svc);

    let newOr = appRows[0]?.or_num;

    // 🔹 Assign OR number if not already assigned (atomic increment approach)
    if (!newOr) {
      // Lock active OR range row
      const [rangeRows] = await db.query(
        "SELECT * FROM orrangesetup WHERE is_active = TRUE LIMIT 1 FOR UPDATE"
      );
      const range = rangeRows[0];
      if (!range) {
        await db.rollback();
        return res.status(400).json({ message: "No active OR range found" });
      }

      // Atomically increment current_or and read the new value in the same transaction
      // MySQL (8.0+) supports RETURNING, but if your version doesn't, we do UPDATE then SELECT.
      // Update to increment current_or by 1
      await db.query("UPDATE orrangesetup SET current_or = current_or + 1 WHERE id = ?", [range.id]);

      // Now select the new current_or (still within the same transaction)
      const [updatedRows] = await db.query("SELECT current_or FROM orrangesetup WHERE id = ? FOR UPDATE", [range.id]);
      const assignedOr = updatedRows[0].current_or;

      // sanity check bounds
      if (assignedOr > range.end_or) {
        await db.rollback();
        return res.status(400).json({ message: "All OR numbers are already used!" });
      }

      // final double-check: ensure no appointment already has this OR
      const [exists] = await db.query("SELECT 1 FROM appointment WHERE or_num = ? LIMIT 1", [assignedOr]);
      if (exists.length > 0) {
        // If this happens (very unlikely with the FOR UPDATE + atomic increment), try a quick retry:
        // decrement current_or back and retry once or just increment to next available.
        // Simpler approach: increment again and take that value (still under transaction)
        await db.query("UPDATE orrangesetup SET current_or = current_or + 1 WHERE id = ?", [range.id]);
        const [retryRows] = await db.query("SELECT current_or FROM orrangesetup WHERE id = ? FOR UPDATE", [range.id]);
        const retryOr = retryRows[0].current_or;
        if (retryOr > range.end_or) {
          await db.rollback();
          return res.status(400).json({ message: "All OR numbers are already used!" });
        }
        newOr = retryOr;
      } else {
        newOr = assignedOr;
      }
    }

    // 🔹 Update appointment with OR number and billing info
    const updateFields = [
      "total_charged = ?",
      "total_service_charged = ?",
      "appointment_status = 'incomplete'",
      "or_num = ?"
    ];
    const updateParams = [total_charged, svc, newOr];

    if (payment_method != null) { updateFields.push("payment_method = ?"); updateParams.push(payment_method); }
    if (payment_status != null) { updateFields.push("payment_status = ?"); updateParams.push(payment_status); }
    if (gcashProof) { updateFields.push("downpayment_proof = ?"); updateParams.push(gcashProof); }
    if (billing_date != null) { updateFields.push("billing_date = ?"); updateParams.push(billing_date); }
    if (due_date != null) { updateFields.push("due_date = ?"); updateParams.push(due_date); }
    if (hmo_number != null) { updateFields.push("hmo_number = ?"); updateParams.push(hmo_number); }
    if (hmo_provider != null) {
      const [hmoRows] = await db.query("SELECT hmo_name FROM hmo WHERE hmo_id = ?", [hmo_provider]);
      if (hmoRows.length > 0) { updateFields.push("hmo_name = ?"); updateParams.push(hmoRows[0].hmo_name); }
    }
    if (coverage != null) { updateFields.push("coverage = ?"); updateParams.push(coverage); }

    updateParams.push(appointId);

    await db.query(
      `UPDATE appointment SET ${updateFields.join(", ")} WHERE appoint_id = ?`,
      updateParams
    );

    // 🔹 Insert audit trail
    const action = insertRes ? "Add Charge & Update Billing" : "Update Billing";
    const description = insertRes
      ? `Added ${ci_type || "item/service"} "${ci_item_name}" (Qty: ${ci_quantity || 1}, Amount: ₱${ci_amount || 0}) for appointment ID ${appointId}`
      : `Updated billing for appointment ID ${appointId}, Total Charged: ₱${total_charged}, Payment: ${payment_method || "N/A"}, Status: ${payment_status || "N/A"}`;

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [req.user.user_name, req.user.role, action, description, new Date()]
    );

    await db.commit();

    // 🔹 Return updated billing
    const [updatedAppRows] = await db.query(
      `SELECT payment_method, payment_status, total_service_charged, total_charged, 
              appointment_status, downpayment_proof, billing_date, due_date, hmo_number, hmo_name, coverage, or_num
       FROM appointment
       WHERE appoint_id = ?`,
      [appointId]
    );

    res.status(insertRes ? 201 : 200).json({
      message: insertRes ? "Charge added + billing updated" : "Billing updated",
      ci_id: insertRes?.insertId ?? null,
      appoint_id: appointId,
      items_total: itemsTotal,
      total_service_charged: updatedAppRows[0]?.total_service_charged ?? svc,
      total_charged: updatedAppRows[0]?.total_charged ?? total_charged,
      payment_method: updatedAppRows[0]?.payment_method ?? null,
      payment_status: updatedAppRows[0]?.payment_status ?? null,
      downpayment_proof: updatedAppRows[0]?.downpayment_proof ?? null,
      appointment_status: updatedAppRows[0]?.appointment_status ?? "done",
      hmo_number: updatedAppRows[0]?.hmo_number ?? null,
      hmo_name: updatedAppRows[0]?.hmo_name ?? null,
      coverage: updatedAppRows[0]?.coverage ?? null,
      billing_date: updatedAppRows[0]?.billing_date ?? null,
      due_date: updatedAppRows[0]?.due_date ?? due_date ?? null,
      or_num: updatedAppRows[0]?.or_num ?? newOr
    });

  } catch (err) {
    if (db) await db.rollback();
    console.error("Billing POST error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (db) await db.end();
  }
});

// UPDATE PATIENT INFO (with audit trail)
router.put("/updatepatientinfo/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params;
    const {
      email,
      contact_no,
      fname,
      mname,
      lname,
      date_birth,
      gender,
      age,
      home_address,
      city,
      province,
      user_name,
      user_password,
      user_status,
    } = req.body;

    const db = await connectToDatabase();

    // ✅ Build the fields dynamically so password update is optional
    let fields = [
      "email = ?",
      "contact_no = ?",
      "fname = ?",
      "mname = ?",
      "lname = ?",
      "date_birth = ?",
      "gender = ?",
      "age = ?",
      "home_address = ?",
      "city = ?",
      "province = ?",
      "user_name = ?",
      "user_status = ?",
    ];

    let values = [
      email,
      contact_no,
      fname,
      mname,
      lname,
      date_birth,
      gender,
      age,
      home_address,
      city,
      province,
      user_name,
      user_status,
    ];

    // ✅ If password is provided, hash and update it
    if (user_password && user_password.trim() !== "") {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(user_password, 10);
      fields.push("user_password = ?");
      values.push(hashedPassword);
    }

    values.push(id);

    const sql = `
      UPDATE users 
      SET ${fields.join(", ")} 
      WHERE user_id = ? AND role = 'patient'
    `;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found or not a patient role" });
    }

    // ✅ Insert into audit trail
    const action = "Update Patient Info";
    const description = `Updated patient "${fname} ${lname}" (User ID: ${id}) profile information`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    // ✅ Success response
    return res.json({ message: "Patient profile updated successfully" });

  } catch (err) {
    console.error("❌ Update patient error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Mark consultation as DONE or INCOMPLETE + save selected teeth
router.put("/completeconsultation/:appointId", authenticateToken, async (req, res) => {
  const { appointId } = req.params;
  const {
    attending_dentist,
    p_diagnosis,
    appointment_status,
    payment_confirmation,
    selected_teeth,
    procedure_type
  } = req.body;

  const userId = req.user?.user_id;
  const userRole = req.user?.role || "Unknown";
  const userName = req.user?.user_name;

  const db = await connectToDatabase();

  // Fetch appointment + patient details
  const [appointmentRows] = await db.query(
    `SELECT a.*, u.user_id, u.email, u.fname, u.lname 
     FROM appointment a 
     JOIN users u ON a.user_name = u.user_name 
     WHERE a.appoint_id = ?`,
    [appointId]
  );

  if (appointmentRows.length === 0) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  const appointment = appointmentRows[0];

  try {
    // 1) Update appointment
    const [result] = await db.query(
      `UPDATE appointment 
       SET attending_dentist = ?, 
           p_diagnosis = ?, 
           appointment_status = ?, 
           payment_confirmation = ?,
           p_date_completed = NOW()
       WHERE appoint_id = ?`,
      [attending_dentist, p_diagnosis, appointment_status, payment_confirmation, appointId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // 2) Handle completion
    if (appointment_status === "done") {
      // Mark charged items as charged
      await db.query(
        `UPDATE chargeditem 
         SET ci_status = 'charged' 
         WHERE appoint_id = ? AND ci_status = 'pending'`,
        [appointId]
      );

      // Deduct inventory
      await db.query(
        `UPDATE inventory i
         JOIN chargeditem c ON i.inv_id = c.inv_id
         SET i.inv_quantity = i.inv_quantity - c.ci_quantity
         WHERE c.appoint_id = ? AND c.ci_status = 'charged'`,
        [appointId]
      );

      // --- Notifications to patient + receptionists ---
      const [receptionistRows] = await db.query(
        `SELECT user_id FROM users WHERE role = 'receptionist'`
      );

      const now = new Date();
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      for (const recipient of [...receptionistRows, { user_id: appointment.user_id }]) {
        const isPatient = recipient.user_id === appointment.user_id;
        await db.query(
          `INSERT INTO notifications (
            user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            recipient.user_id,
            "Appointment Completed",
            isPatient
              ? `Your appointment (ID: ${appointId}) has been completed. Please check your records for details.`
              : `Appointment ID ${appointId} for patient ${appointment.fname} ${appointment.lname} has been completed.`,
            now,
            expires,
            "appointment"
          ]
        );
      }

      // --- Email to patient ---
      const patientSubject = "Your Dental Appointment is Completed!";
      const patientBody = `
<div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
    <div style="background-color: #00458B; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
      <p style="color: #cce3f5; margin: 5px 0 0;">Appointment Completed</p>
    </div>
    <div style="padding: 25px; color: #333;">
      <p>Dear <strong>${appointment.fname} ${appointment.lname}</strong>,</p>
      <p>Your appointment for <strong>${appointment.procedure_type}</strong> has been <strong>successfully completed</strong>.</p>
      <p><strong>Attending Dentist:</strong> ${attending_dentist || "Unassigned"}</p>
      <p><strong>Diagnosis:</strong> ${p_diagnosis || "Not provided"}</p>
      <p><strong>Status:</strong> ${appointment_status}</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://dental-clinic-management-system-frontend-wipu.onrender.com/" 
          style="background-color: #01D5C4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
          View Your Appointment
        </a>
      </div>
      <div style="margin-top: 20px; color: #00458B;">
        <strong>Thank you,</strong><br>Arciaga-Juntilla TMJ Ortho Dental Clinic
      </div>
    </div>
    <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
      <p>© ${new Date().getFullYear()} Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</div>
`;
      await sendEmail(appointment.email, patientSubject, patientBody);
      console.log(`✅ Email sent to patient: ${appointment.email}`);

      // --- Partial Payment / Accounting ---
      if (appointment.payment_status && appointment.payment_status.toLowerCase() === "partial") {
        const [existingSub] = await db.query(
          `SELECT * FROM sub_receivable WHERE appoint_id = ?`,
          [appointId]
        );

        if (existingSub.length === 0) {
          const particulars = `${appointment.procedure_type} - ${appointment.fname} ${appointment.lname}`;
          const date = appointment.billing_date || new Date();
          const invoiceNo = appointment.or_num || "N/A";
          const debit = appointment.total_charged || 0;
          const balance = debit;

          // Insert Sub Receivable
          await db.query(
            `INSERT INTO sub_receivable (date, particulars, invoice_no, debit, credit, balance, appoint_id, user_id, total_amount)
             VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)`,
            [date, particulars, invoiceNo, debit, balance, appointId, appointment.user_id, debit]
          );

          // Chart of Accounts
          const [accounts] = await db.query(`
            SELECT account_id, account_name FROM chartofaccounts
            WHERE account_name IN ('Account Receivable', 'Service Income')
          `);
          const arAccount = accounts.find(a => a.account_name.trim().toLowerCase() === "account receivable");
          const siAccount = accounts.find(a => a.account_name.trim().toLowerCase() === "service income");

          if (!arAccount || !siAccount) throw new Error("Missing 'Account Receivable' or 'Service Income'.");

          const comment = `Installment process for Appointment #${appointId}`;

          // Journal Entries
          const [debitEntry] = await db.query(
            `INSERT INTO journalentry (date, description, account_id, id, debit, credit, comment, total_amount)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
            [date, particulars, arAccount.account_id, '0', debit, comment, debit]
          );

          const [creditEntry] = await db.query(
            `INSERT INTO journalentry (date, description, account_id, id, debit, credit, comment, total_amount)
             VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
            [date, particulars, siAccount.account_id, '0', debit, comment, debit]
          );

          // General Ledger
          const getCurrentBalance = async (accountId) => {
            const [rows] = await db.query(
              `SELECT balance FROM general_ledger 
               WHERE account_id = ? ORDER BY entry_id DESC LIMIT 1`,
              [accountId]
            );
            return rows.length > 0 ? parseFloat(rows[0].balance) : 0;
          };
          const arCurrentBalance = await getCurrentBalance(arAccount.account_id);
          const siCurrentBalance = await getCurrentBalance(siAccount.account_id);

          const arNewBalance = arCurrentBalance + debit; // A/R debit increases
          const siNewBalance = siCurrentBalance + debit; // Revenue credit increases

await db.query(
  `INSERT INTO general_ledger (account_id, entry_id, date, debit, credit, balance, description, total_amount)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [arAccount.account_id, debitEntry.insertId, date, debit, 0, arNewBalance, particulars, debit]
);

await db.query(
  `INSERT INTO general_ledger (account_id, entry_id, date, debit, credit, balance, description, total_amount)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [siAccount.account_id, creditEntry.insertId, date, 0, debit, siNewBalance, particulars, debit]
);


          console.log(`✅ Partial payment accounting done for appointment ID ${appointId}`);
        }
      }

      // --- Insert Selected Teeth ---
      if (Array.isArray(selected_teeth) && selected_teeth.length > 0) {
        const insertQuery = `INSERT INTO selectedteeth (appoint_id, st_number, st_name) VALUES (?, ?, ?)`;
        for (const tooth of selected_teeth) {
          await db.query(insertQuery, [appointId, tooth.st_number, tooth.st_name]);
        }
      }
    }

    // 3) Insert Audit Trail
    const actionType = appointment_status === "done" ? "Complete Consultation" : "Incomplete Consultation";
    const description = appointment_status === "done"
      ? `Appointment ID ${appointId} marked as DONE by ${userRole} (Diagnosis: ${p_diagnosis || "N/A"}).`
      : `Appointment ID ${appointId} marked as INCOMPLETE by ${userRole}.`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [userName, userRole, actionType, description, created_at]
    );

    res.json({
      message: `Consultation marked as ${appointment_status}. Notifications sent and accounting processed if partial payment.`
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error while updating appointment." });
  }
});

router.get("/complete/:appointId", async (req, res) => {
  const { appointId } = req.params;
  const db = await connectToDatabase();

  try {
    const [rows] = await db.query(
      `SELECT * FROM sub_receivable WHERE appoint_id = ?`,
      [appointId]
    );
    res.json(rows);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/consultationpayments/:appointId", async (req, res) => {
  const { appointId } = req.params;
  const db = await connectToDatabase();

  try {
    const [rows] = await db.query(
      `SELECT * FROM sub_receivable WHERE appoint_id = ?`,
      [appointId]
    );
    res.json(rows);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//

//Complete payment
// ✅ Complete Payment Route (with fixed HMO computation and no previous balance logic)
//Complete payment
router.post("/complete/:appoint_id", async (req, res) => {
  const { appoint_id } = req.params;
  const connection = await connectToDatabase();

  try {
    await connection.beginTransaction();

    // appointment details 
    const [appoint] = await connection.query(
      `SELECT appoint_id, total_charged, total_service_charged, 
              p_fname, p_mname, p_lname, procedure_type, payment_method,
              hmo_number, coverage, or_num, user_name, billing_date, hmo_name
       FROM appointment 
       WHERE appoint_id = ?`,
      [appoint_id]
    );

    if (appoint.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Appointment not found." });
    }

    const {
      total_charged,
      total_service_charged,
      p_fname,
      p_mname,
      p_lname,
      procedure_type,
      payment_method,
      hmo_number,
      coverage,
      or_num,
      user_name,
      billing_date,
      hmo_name
    } = appoint[0];

    const patient_name = `${p_fname} ${p_mname ? p_mname + " " : ""}${p_lname}`;
    const date = billing_date;
    const subAccountId = 0;
    const description = `Payment received from ${patient_name} appointment no. ${appoint_id}`;
    const fullDescription = `${procedure_type} - ${patient_name}`;

    // Get Accounts
    const [accounts] = await connection.query(
      "SELECT account_id, account_name, account_type FROM chartofaccounts WHERE account_name IN ('Cash on Hand', 'Service Income', 'Account Receivable')"
    );

    const normalize = (name) => name.trim().toLowerCase();

    const cashAcc = accounts.find(a => normalize(a.account_name) === "cash on hand");
    const incomeAcc = accounts.find(a => normalize(a.account_name) === "service income");
    const arAcc = accounts.find(a => normalize(a.account_name) === "account receivable");

    if (!cashAcc || !incomeAcc) {
      console.error("Missing required accounts:", {
        cashAcc: !!cashAcc,
        incomeAcc: !!incomeAcc,
        arAcc: !!arAcc
      });
      await connection.rollback();
      return res.status(400).json({
        message: "Cash on Hand or Service Income account not found.",
      });
    }

    console.log(" Starting payment entry for", patient_name);

    // HMO COMPUTATION
    let additional_charge = 0;
    let hmo_charge = 0;
    let patient_bill = total_charged;

    if (payment_method === "HMO") {
      const totalSvc = parseFloat(total_service_charged || 0);
      const totalChg = parseFloat(total_charged || 0);
      const cov = parseFloat(coverage || 0);

      additional_charge = totalChg - totalSvc;
      hmo_charge = (totalSvc * cov) / 100;
      patient_bill = additional_charge + (totalSvc - hmo_charge);

      console.log(" HMO Payment Detected");
      console.log({
        totalSvc,
        totalChg,
        cov,
        additional_charge,
        hmo_charge,
        patient_bill,
      });
    } else {
      console.log(" Regular (Non-HMO) Payment");
    }

    // JOURNAL ENTRY & GENERAL LEDGER (PATIENT PAYMENT)
    const [debitEntry] = await connection.query(
      `INSERT INTO journalentry (date, description, account_id, id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, fullDescription, cashAcc.account_id, subAccountId, patient_bill, 0, description, patient_bill]
    );

    const [creditEntry] = await connection.query(
      `INSERT INTO journalentry (date, description, account_id, id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, fullDescription, incomeAcc.account_id, subAccountId, 0, patient_bill, description, patient_bill]
    );

    await connection.query(
      `INSERT INTO general_ledger (entry_id, account_id, debit, credit, description, date, total_amount)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
      [debitEntry.insertId, cashAcc.account_id, patient_bill, fullDescription, date, patient_bill]
    );

    await connection.query(
      `INSERT INTO general_ledger (entry_id, account_id, debit, credit, description, date, total_amount)
       VALUES (?, ?, 0, ?, ?, ?, ?)`,
      [creditEntry.insertId, incomeAcc.account_id, patient_bill, fullDescription, date, patient_bill]
    );

    // HMO SECTION
    if (payment_method && payment_method.toLowerCase() === "hmo") {
      console.log("📘 HMO path entered for appoint_id:", appoint_id);

      const totalSvc = parseFloat(total_service_charged || 0);
      const cov = parseFloat(coverage || 0);
      const additional_charge = parseFloat(total_charged) - totalSvc;
      const hmo_charge = parseFloat(((totalSvc * cov) / 100).toFixed(2));
      const patient_bill = parseFloat((additional_charge + (totalSvc - hmo_charge)).toFixed(2));

      console.log({ totalSvc, cov, additional_charge, hmo_charge, patient_bill });

      if (!arAcc) {
        console.warn("Accounts Receivable account not found; skipping sub_receivable/journal for HMO.");
      } else if (!hmo_charge || hmo_charge <= 0) {
        console.warn(" Computed hmo_charge is 0 or NaN; skipping sub_receivable/journal for HMO.");
      } else {
        const invoice_no = (or_num || "").toString().trim();
        if (!invoice_no) {
          console.warn("invoice_no (or_num) is empty — skipping sub_receivable/journal for HMO.");
        } else {
          let user_id = null;
          try {
            const [urows] = await connection.query(
              `SELECT user_id FROM users WHERE user_name = ? LIMIT 1`,
              [user_name]
            );
            if (urows && urows.length > 0) user_id = urows[0].user_id;
          } catch (e) {
            console.error("Error fetching user_id:", e.message);
          }

          const particulars = `${hmo_name}: ${procedure_type} - ${p_fname} ${p_lname}`;
          const entryDate = date;

          // Insert into sub_receivable (no previous balance)
          const [insSub] = await connection.query(
            `INSERT INTO sub_receivable (date, particulars, invoice_no, total_amount, debit, credit, balance, appoint_id, user_id)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
            [entryDate, particulars, invoice_no, hmo_charge, hmo_charge, hmo_charge, appoint_id, user_id]
          );
          console.log(" sub_receivable inserted, insertId:", insSub.insertId);

          // Journal Entries
          const [debitAR] = await connection.query(
            `INSERT INTO journalentry (date, description, account_id, id, debit, credit, comment, total_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [entryDate, `${hmo_name}: ${fullDescription}`, arAcc.account_id, subAccountId, hmo_charge, 0, "HMO charge receivable", hmo_charge]
          );

          const [creditHMO] = await connection.query(
            `INSERT INTO journalentry (date, description, account_id, id, debit, credit, comment, total_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [entryDate, `${hmo_name}: ${fullDescription}`, incomeAcc.account_id, subAccountId, 0, hmo_charge, "HMO income recognition", hmo_charge]
          );

          await connection.query(
            `INSERT INTO general_ledger (entry_id, account_id, debit, credit, description, date, total_amount)
             VALUES (?, ?, ?, 0, ?, ?, ?)`,
            [debitAR.insertId, arAcc.account_id, hmo_charge, `${hmo_name}: ${fullDescription} (Receivable)`, entryDate, hmo_charge]
          );

          await connection.query(
            `INSERT INTO general_ledger (entry_id, account_id, debit, credit, description, date, total_amount)
             VALUES (?, ?, 0, ?, ?, ?, ?)`,
            [creditHMO.insertId, incomeAcc.account_id, hmo_charge, `${hmo_name}: ${fullDescription} (HMO Income)`, entryDate, hmo_charge]
          );
        }
      }
    }

    // 🔁 Update Ledger Balances
    const updateBalanceForAccount = async (account_id) => {
      const [accountRows] = await connection.query(
        "SELECT account_type FROM chartofaccounts WHERE account_id = ?",
        [account_id]
      );
      if (accountRows.length === 0) return;
      const accountType = accountRows[0].account_type;

      const [entries] = await connection.query(
        "SELECT ledger_id, debit, credit FROM general_ledger WHERE account_id = ? ORDER BY ledger_id ASC",
        [account_id]
      );

      let balance = 0;
      for (const entry of entries) {
        if (accountType === "Asset" || accountType === "Expense") {
          balance += entry.debit - entry.credit;
        } else {
          balance += entry.credit - entry.debit;
        }
        await connection.query(
          "UPDATE general_ledger SET balance = ? WHERE ledger_id = ?",
          [balance, entry.ledger_id]
        );
      }
    };

    await updateBalanceForAccount(cashAcc.account_id);
    await updateBalanceForAccount(incomeAcc.account_id);
    if (payment_method === "HMO" && arAcc) await updateBalanceForAccount(arAcc.account_id);

    // ✅ Fixed: Update appointment with correct values
    await connection.query(
      `UPDATE appointment 
       SET additional_charge = ?, 
           payment_confirmation = 'Complete', 
           payment_status = 'Paid',
           hmo_charge = ?,
           patient_bill = ?
       WHERE appoint_id = ?`,
      [additional_charge, hmo_charge, patient_bill, appoint_id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Payment completed successfully.",
      appoint_id,
      patient_name,
      total_charged,
      hmo_applied: payment_method === "HMO",
      hmo_charge,
      additional_charge,
      patient_bill,
    });

  } catch (error) {
    await connection.rollback();
    console.error(" ERROR completing payment:", error.message);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});

// Patient's side Cancel Appointment
router.post(
  "/cancelappointment/:appointId",
  uploadRefund.single("refund_photo"),
  async (req, res) => {
    const db = await connectToDatabase();
    try {
      const { appointId } = req.params;
      const { cc_reason, cc_notes } = req.body;

      // Use uploaded file URL if available (S3 or local)
      const refundPhoto = req.file ? req.file.location || req.file.filename : null;

      // Determine appointment status
      let newStatus = "cancelled";
      if (cc_reason === "Refund request") newStatus = "cancel with refund request";

      // Update appointment status
      await db.query(
        `UPDATE appointment SET appointment_status = ? WHERE appoint_id = ?`,
        [newStatus, appointId]
      );

      // Insert into "cancelled" table (only if not refund request)
      if (cc_reason !== "Refund request") {
        await db.query(
          `INSERT INTO cancelled (appoint_id, cc_reason, cc_notes, cc_date, cc_label, refund_photo)
           VALUES (?, ?, ?, NOW(), ?, ?)`,
          [appointId, cc_reason, cc_notes || null, newStatus, refundPhoto]
        );
      }

      // Fetch patient + appointment details
      const [appointmentData] = await db.query(
        `SELECT a.procedure_type, a.pref_date, a.pref_time,
                u.email, u.fname, u.lname
         FROM appointment a
         JOIN users u ON a.user_name = u.user_name
         WHERE a.appoint_id = ?`,
        [appointId]
      );

      if (appointmentData.length > 0) {
        const { email, fname, lname, procedure_type, pref_date, pref_time } =
          appointmentData[0];

        const clinicEmail = process.env.CLINIC_EMAIL || "clinic@example.com";

        // --- PATIENT EMAIL ---
        const patientSubject =
          cc_reason === "Refund request"
            ? "Refund Request Submitted for Your Appointment"
            : "Appointment Cancellation Confirmation";

        const patientBody = `
<div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
    
    <div style="background-color: #00458B; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
      <p style="color: #cce3f5; margin: 5px 0 0;">${cc_reason === "Refund request" ? "Refund Request Received" : "Appointment Cancelled"}</p>
    </div>

    <div style="padding: 25px; color: #333;">
      <p>Dear <strong>${fname} ${lname}</strong>,</p>
      <p>
        ${cc_reason === "Refund request"
            ? `Your refund request for <strong>${procedure_type}</strong> on <strong>${pref_date}</strong> at <strong>${pref_time}</strong> has been submitted.`
            : `Your appointment for <strong>${procedure_type}</strong> on <strong>${pref_date}</strong> at <strong>${pref_time}</strong> has been <strong>cancelled</strong>.`
          }
      </p>
      ${cc_reason ? `<p><strong>Reason:</strong> ${cc_reason}</p>` : ""}
      ${cc_notes ? `<p><strong>Notes:</strong> ${cc_notes}</p>` : ""}
      ${refundPhoto ? `<p><a href="${refundPhoto}">View Uploaded Refund Photo</a></p>` : ""}
      <p>If you’d like to reschedule, please log in to your account or contact our clinic directly.</p>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://dental-clinic-management-system-frontend-wipu.onrender.com/" 
          style="background-color: #01D5C4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
          View Your Appointment
        </a>
      </div>

      <div style="margin-top: 20px; color: #00458B;">
        <strong>Thank you,</strong><br>Arciaga-Juntilla TMJ Ortho Dental Clinic
      </div>
    </div>

    <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
      <p>© ${new Date().getFullYear()} Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</div>
`;

        await sendEmail(email, patientSubject, patientBody);
        console.log(`✅ Email sent to patient: ${email}`);

        // --- CLINIC EMAIL ---
        const clinicSubject = `Patient ${cc_reason === "Refund request" ? "Refund Request" : "Cancellation"}: ${fname} ${lname}`;
        const clinicBody = `
<div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
    
    <div style="background-color: #00458B; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
      <p style="color: #cce3f5; margin: 5px 0 0;">Patient ${cc_reason === "Refund request" ? "Refund Request" : "Cancellation"} Notification</p>
    </div>

    <div style="padding: 25px; color: #333;">
      <p><strong>Patient:</strong> ${fname} ${lname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Procedure:</strong> ${procedure_type}</p>
      <p><strong>Appointment Date:</strong> ${pref_date}</p>
      <p><strong>Appointment Time:</strong> ${pref_time}</p>
      <p><strong>Reason:</strong> ${cc_reason}</p>
      ${cc_notes ? `<p><strong>Notes:</strong> ${cc_notes}</p>` : ""}
      ${refundPhoto ? `<p><a href="${refundPhoto}">View Uploaded Refund Photo</a></p>` : ""}
      <p>Please review this in the admin dashboard for appropriate follow-up.</p>

      <div style="margin-top: 20px; color: #01D5C4;">
        — Automated Notification from the Arciaga-Juntilla TMJ Ortho Dental Clinic System
      </div>
    </div>

    <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
      <p>© ${new Date().getFullYear()} Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</div>
`;

        await sendEmail(clinicEmail, clinicSubject, clinicBody);
        console.log(`📧 Email sent to clinic: ${clinicEmail}`);
      }

      // Insert notification record
      await db.query(
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category)
         SELECT u.user_id, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'appointment'
         FROM appointment a
         JOIN users u ON u.user_name = a.user_name
         WHERE a.appoint_id = ?`,
        [
          "Appointment Cancelled",
          `Your appointment (ID: ${appointId}) has been ${newStatus}. Reason: ${cc_reason}${cc_notes ? `, Note: ${cc_notes}` : ""}.`,
          appointId,
        ]
      );

      res.json({
        message:
          cc_reason === "Refund request"
            ? "Refund request sent successfully! A confirmation email has been sent."
            : "Appointment cancelled successfully! A confirmation email has been sent.",
        refund_photo: refundPhoto,
      });
    } catch (error) {
      console.error("Cancel error:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  }
);

// Admin/receptionist completes refund cancellation
router.post("/processRefund/:appointId", uploadRefund.single("refund_photo"), async (req, res) => {
  const db = await connectToDatabase();
  try {
    const { appointId } = req.params;
    const { refund_method, cc_notes } = req.body;

    const refund_photo = req.file ? req.file.location || req.file.filename : null; // S3 URL or local

    // Insert into cancelled table
    await db.query(
      `INSERT INTO cancelled 
        (appoint_id, cc_reason, cc_notes, cc_date, cc_label, refund_photo, refund_date, refund_method)
       VALUES (?, 'Refund', ?, NOW(), 'cancelled', ?, NOW(), ?)`,
      [appointId, cc_notes, refund_photo, refund_method]
    );

    // Update appointment status
    await db.query(
      `UPDATE appointment 
       SET payment_status = 'cancelled', appointment_status = 'cancelled'  
       WHERE appoint_id = ?`,
      [appointId]
    );

    // Insert notification for patient
    await db.query(
      `INSERT INTO notifications 
        (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category)
       SELECT 
         u.user_id,
         ?,
         ?,
         NOW(),
         DATE_ADD(NOW(), INTERVAL 30 DAY),
         'appointment'
       FROM appointment a
       JOIN users u ON u.user_name = a.user_name
       WHERE a.appoint_id = ?`,
      [
        "Appointment Cancelled by The Clinic",
        `Your appointment (ID: ${appointId}) has been cancelled by the clinic. Note: ${cc_notes || "No additional note."}`,
        appointId,
      ]
    );

    // Insert into Audit Trail
    const action = "Process Cancellation";
    const description = `Cancelled appointment ID: ${appointId}. Method: ${refund_method || "N/A"}. Notes: ${cc_notes || "None"}.`;
    const created_at = new Date();
    const user_name = req.user?.user_name || "System";
    const role = req.user?.role || "Admin";

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [user_name, role, action, description, created_at]
    );

    // --- Fetch patient details for email ---
    const [patientData] = await db.query(
      `SELECT u.email, u.fname, u.lname, a.procedure_type, a.pref_date, a.pref_time
       FROM appointment a
       JOIN users u ON a.user_name = u.user_name
       WHERE a.appoint_id = ?`,
      [appointId]
    );

    if (patientData.length > 0) {
      const { email, fname, lname, procedure_type, pref_date, pref_time } = patientData[0];
      const clinicEmail = process.env.CLINIC_EMAIL || "clinic@example.com";

      // --- Patient Email ---
      const patientSubject = "Appointment Cancellation & Refund Processed";
      const patientBody = `
<div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
    
    <div style="background-color: #00458B; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
      <p style="color: #cce3f5; margin: 5px 0 0;">Appointment Cancelled & Refund Processed</p>
    </div>

    <div style="padding: 25px; color: #333;">
      <p>Dear <strong>${fname} ${lname}</strong>,</p>
      <p>Your appointment for <strong>${procedure_type}</strong> on <strong>${pref_date}</strong> at <strong>${pref_time}</strong> has been <strong>cancelled</strong> by the clinic.</p>
      <p><strong>Refund Method:</strong> ${refund_method || "N/A"}</p>
      ${cc_notes ? `<p><strong>Notes:</strong> ${cc_notes}</p>` : ""}
      ${refund_photo ? `<p><a href="${refund_photo}">View Uploaded Refund Photo</a></p>` : ""}
      <p>If you wish to reschedule, please log in to your account or contact the clinic directly.</p>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://dental-clinic-management-system-frontend-wipu.onrender.com/" 
          style="background-color: #01D5C4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
          View Your Appointment
        </a>
      </div>

      <div style="margin-top: 20px; color: #00458B;">
        <strong>Thank you,</strong><br>Arciaga-Juntilla TMJ Ortho Dental Clinic
      </div>
    </div>

    <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
      <p>© ${new Date().getFullYear()} Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</div>
`;

      await sendEmail(email, patientSubject, patientBody);
      console.log(`✅ Email sent to patient: ${email}`);

      // --- Clinic Email ---
      const clinicSubject = `Patient Refund Processed: ${fname} ${lname}`;
      const clinicBody = `
<div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
    
    <div style="background-color: #00458B; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
      <p style="color: #cce3f5; margin: 5px 0 0;">Patient Refund Notification</p>
    </div>

    <div style="padding: 25px; color: #333;">
      <p><strong>Patient:</strong> ${fname} ${lname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Procedure:</strong> ${procedure_type}</p>
      <p><strong>Appointment Date:</strong> ${pref_date}</p>
      <p><strong>Appointment Time:</strong> ${pref_time}</p>
      <p><strong>Refund Method:</strong> ${refund_method || "N/A"}</p>
      ${cc_notes ? `<p><strong>Notes:</strong> ${cc_notes}</p>` : ""}
      ${refund_photo ? `<p><a href="${refund_photo}">View Uploaded Refund Photo</a></p>` : ""}
      <p>Please review this in the admin dashboard for appropriate follow-up.</p>

      <div style="margin-top: 20px; color: #01D5C4;">
        — Automated Notification from the Arciaga-Juntilla TMJ Ortho Dental Clinic System
      </div>
    </div>

    <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
      <p>© ${new Date().getFullYear()} Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</div>
`;

      await sendEmail(clinicEmail, clinicSubject, clinicBody);
      console.log(`📧 Email sent to clinic: ${clinicEmail}`);
    }

    res.json({ message: "Appointment cancelled and refund processed successfully. Emails have been sent." });
  } catch (error) {
    console.error("Refund process error:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
});

router.get("/dentists", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(
      "SELECT user_id, fname, lname FROM users WHERE role = 'dentist'"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching dentists:", err);
    res.status(500).json({ error: "Failed to fetch dentists" });
  }
});

//################################ INVENTORY MANAGEMENT ################################
// for admininventoryadd.jsx (ADD NEW ITEM)
router.post('/additem', async (req, res) => {
  const { inv_item_type, inv_item_name, inv_price_per_item, inv_quantity, inv_ml, inv_exp_date, supplier_id } = req.body;

  if (!inv_item_name || !inv_quantity || !inv_item_type) {
    return res.status(400).json({ message: "Item Name, Quantity, and Item Type are required" });
  }

  if (inv_item_type === "medicine" && (!inv_ml || !inv_exp_date)) {
    return res.status(400).json({ message: "Medicine requires Amount of ML and Expiration Date" });
  }

  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const db = await connectToDatabase();

    // Check if item already exists
    const [rows] = await db.query(
      'SELECT * FROM inventory WHERE inv_item_name = ?',
      [inv_item_name]
    );
    if (rows.length > 0) {
      return res.status(409).json({ message: "Item already exists" });
    }

    // Default inv_status: High if quantity > 50, Low otherwise
    let status = inv_quantity > 50 ? "High" : "Low";

    await db.query(
      `INSERT INTO inventory 
    (inv_item_type, inv_item_name, inv_price_per_item, inv_quantity, inv_ml, inv_exp_date, inv_status, inv_item_status, supplier_id, created_by) 
   VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        inv_item_type,
        inv_item_name,
        inv_price_per_item,
        inv_quantity || null,
        inv_ml || null,
        inv_exp_date || null,
        status,
        supplier_id,
        decoded.user_id // ← this is the key change
      ]
    );

    // --- Send notification to all admins ---
    const [adminRows] = await db.query(
      `SELECT user_id FROM users WHERE role = 'admin'`
    );

    for (const admin of adminRows) {
      await db.query(
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category)
        VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'inventory')`,
        [
          admin.user_id,
          "New Inventory Item Added",
          `A new inventory item "${inv_item_name}" has been added by staff and is pending approval.`,
          "inventory"
        ]
      );
    }

    // --- Notify the staff who added the item ---
    await db.query(
      `INSERT INTO notifications (
        user_id, 
        ntf_subject, 
        ntf_description, 
        ntf_created_at, 
        ntf_expires_at, 
        category
      )
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'inventory')`,
      [
        decoded.user_id,
        "Item Submitted for Approval",
        `You have successfully added "${inv_item_name}". It is now waiting for admin approval.`,
      ]
    );

    // Insert into audit trail
    const action = "Add New Inventory Item";
    const auditDescription = `Added new inventory item: ${inv_item_name} (${inv_item_type})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    return res.status(201).json({ message: "Item has been created successfully and is currently under review by the Admin." });
  } catch (err) {
    console.error("Add Item error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for admininventoryedit.jsx (EDIT ITEM)
router.put("/edititem/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      inv_item_name,
      inv_item_type,
      inv_quantity,
      inv_price_per_item,
      inv_ml,
      inv_exp_date,
      inv_item_status
    } = req.body;

    const { id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      `UPDATE inventory 
       SET inv_item_name = ?, 
           inv_item_type = ?, 
           inv_quantity = ?, 
           inv_price_per_item = ?, 
           inv_ml = ?, 
           inv_exp_date = ?,
           inv_item_status = ?
       WHERE inv_id = ?`,
      [inv_item_name, inv_item_type, inv_quantity, inv_price_per_item, inv_ml, inv_exp_date, inv_item_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Insert into audit trail
    const action = "Edit Inventory Item";
    const auditDescription = `Edited inventory item: ${inv_item_name} (ID: ${id})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    return res.json({ message: "Item updated successfully" });
  } catch (err) {
    console.error("Update item error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// (REJECT ITEM)
router.put("/rejectitem/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const db = await connectToDatabase();

    // Fetch item + creator info
    const [itemRows] = await db.query(
      `SELECT i.*, u.user_id AS creator_id, u.user_name AS creator_name
       FROM inventory i
       LEFT JOIN users u ON i.created_by = u.user_id
       WHERE i.inv_id = ?`,
      [id]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = itemRows[0];

    // Update status to rejected
    const [result] = await db.query(
      "UPDATE inventory SET inv_item_status = 'rejected' WHERE inv_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Notify the staff who added the item, if creator exists
    if (item.creator_id) {
      await db.query(
        `INSERT INTO notifications (
          user_id, 
          ntf_subject, 
          ntf_description, 
          ntf_created_at, 
          ntf_expires_at, 
          category
        ) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'inventory')`,
        [
          item.creator_id,
          "Inventory Item Rejected",
          `Your inventory item "${item.inv_item_name}" has been rejected by the Admin.`,
        ]
      );
    }

    // Insert into audit trail
    const action = "Reject Inventory Item";
    const auditDescription = `Rejected inventory item: ${item.inv_item_name} (ID: ${id})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    res.json({ message: "Item rejected successfully" });
  } catch (err) {
    console.error("Error rejecting item:", err);
    res.status(500).json({ error: "Failed to reject item" });
  }
});


// for admininventoryedit.jsx (DISPLAY ITEM IN EDIT PAGE)
router.get("/displayitem/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const itemId = req.params.id;
    const db = await connectToDatabase();
    const [rows] = await db.query(
      `SELECT inv_id, inv_item_name, inv_item_type, inv_quantity, inv_price_per_item, inv_ml, inv_exp_date 
      FROM inventory 
      WHERE inv_id = ?`,
      [itemId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Display Item error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

router.get("/viewitem/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT 
        i.inv_id,
        i.inv_item_name,
        i.inv_item_type,
        i.inv_quantity,
        i.inv_price_per_item,
        i.inv_ml,
        i.inv_exp_date,
        i.inv_status,
        i.inv_item_status,
        i.supplier_id,
        s.supplier_name,
        s.contact_person,
        s.contact_no,
        s.description AS supplier_description
      FROM inventory i
      LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
      WHERE i.inv_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Fetch display item error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// for admininventory.jsx (DISPLAY ALL ITEMS IN TABLE)
router.get('/inventory', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`SELECT * FROM inventory WHERE inv_item_status = 'active' OR inv_item_status = 'inactive'`);
    res.json(rows);
  } catch (err) {
    console.error("Fetch inventory error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get pending items with supplier name
router.get("/pendingitems", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT i.*, s.supplier_name
      FROM inventory i
      LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
      WHERE i.inv_item_status = 'pending'
    `);
    return res.json(rows);
  } catch (err) {
    console.error("Fetch pending items error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Approve item
router.put("/approveitem/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const db = await connectToDatabase();

    // Fetch item + creator info
    const [itemRows] = await db.query(
      `SELECT i.*, u.user_id AS creator_id, u.user_name AS creator_name
       FROM inventory i
       LEFT JOIN users u ON i.created_by = u.user_id
       WHERE i.inv_id = ?`,
      [id]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = itemRows[0];

    // Approve item
    const [result] = await db.query(
      `UPDATE inventory 
       SET inv_item_status = 'active' 
       WHERE inv_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Notify the staff who added the item, if creator exists
    if (item.creator_id) {
      await db.query(
        `INSERT INTO notifications (
          user_id, 
          ntf_subject, 
          ntf_description, 
          ntf_created_at, 
          ntf_expires_at, 
          category
        ) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'inventory')`,
        [
          item.creator_id,
          "Inventory Item Approved",
          `Your inventory item "${item.inv_item_name}" has been approved by the Admin and is now active.`,
        ]
      );
    }

    // Audit trail
    const action = "Approve Inventory Item";
    const auditDescription = `Approved inventory item: ${item.inv_item_name} (ID: ${id})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    return res.status(200).json({
      message: "Item has been approved successfully and is now active."
    });
  } catch (err) {
    console.error("Approve item error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Approve item
router.put("/inactiveitem/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      `UPDATE inventory 
       SET inv_item_status = 'inactive' 
       WHERE inv_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 🧾 Insert into audit trail
    const action = "Deactivate Inventory Item";
    const auditDescription = `Set inventory item with ID: ${id} to inactive`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    res.json({ message: "Item Inactive successfully" });
  } catch (err) {
    console.error("Inactive item error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get supplier
router.get("/suppliers", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM supplier ORDER BY supplier_name ASC");
    return res.json(rows); // Send back as JSON array
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//add new supplier
router.post("/newsupplier", async (req, res) => {
  const { supplier_name, contact_person, contact_no, description } = req.body;
  const db = await connectToDatabase();

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!supplier_name) {
    return res.status(400).json({ error: "Subaccount name is required" });
  }
  //if subacount already exists
  try {
    const [existing] = await db.query(
      "SELECT * FROM supplier WHERE supplier_name = ?",
      [supplier_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "This Supplier already exists" });
    }

    // insert
    const [result] = await db.query(
      "INSERT INTO supplier (supplier_name, contact_person, contact_no, description, supplier_status) VALUES (?, ?, ?, ?, 'active')",
      [supplier_name, contact_person, contact_no, description]
    );

    // 🧾 Insert into audit trail
    const action = "Add Supplier";
    const auditDescription = `Added new supplier: ${supplier_name}`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    return res.status(201).json({
      message: "Supplier added successfully",
      subaccountId: result.insertId,
    });
  } catch (err) {
    console.error("❌ MySQL Error inserting subaccount:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});

// Get supplier by ID
router.get("/supplier/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connectToDatabase();

  try {
    const [rows] = await db.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("❌ MySQL Error fetching supplier:", err);
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});

// Update supplier by ID
router.put("/supplier/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id } = req.params;
  const { supplier_name, contact_person, contact_no, description, supplier_status } = req.body;
  const db = await connectToDatabase();

  if (!supplier_name || !contact_person || !contact_no || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if supplier exists
    const [existing] = await db.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Update supplier
    await db.query(
      "UPDATE supplier SET supplier_name = ?, contact_person = ?, contact_no = ?, description = ?, supplier_status = ? WHERE supplier_id = ?",
      [supplier_name, contact_person, contact_no, description, supplier_status, id]
    );

    // 🧾 Insert into audit trail
    const action = "Update Supplier";
    const auditDescription = `Updated supplier "${supplier_name}" (ID: ${id})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    return res.json({ message: "Supplier updated successfully" });
  } catch (err) {
    console.error("❌ MySQL Error updating supplier:", err);
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});

// Deactivate supplier instead of deleting
router.delete("/suppliers/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;

    // ✅ Step 1: Authenticate user and verify role
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Step 2: Check if supplier exists
    const [existing] = await db.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const supplierName = existing[0].supplier_name;

    // ✅ Step 3: Deactivate supplier
    await db.query(
      "UPDATE supplier SET supplier_status = 'inactive' WHERE supplier_id = ?",
      [id]
    );

    // ✅ Step 4: Insert into audit trail
    const action = "Deactivate Supplier";
    const auditDescription = `Deactivated supplier "${supplierName}" (ID: ${id})`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    // ✅ Step 5: Return success response
    return res.json({ message: "Supplier marked as inactive successfully" });

  } catch (err) {
    console.error("Deactivate supplier error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//################################ LEDGER MANAGEMENT ################################


//********************* CHARTS OF ACCOUNT ********************* 
//get Chart of Accounts ->admincoa
router.get("/coa", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM chartofaccounts ORDER BY account_name ASC");
    return res.json(rows); // Send back as JSON array
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get accounts if active
router.get("/coa1", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM chartofaccounts  WHERE status = 'active' ORDER BY account_name ASC");
    return res.json(rows); // Send back as JSON array
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// Get a single account by ID
router.get("/coa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      "SELECT * FROM chartofaccounts WHERE account_id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new Chart of Account -> admincoaadd
router.post("/coa", authenticateToken, async (req, res) => {
  // ✅ Get COA data from request
  const { account_name, account_type, description } = req.body;

  if (!account_name || !account_type || !description) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const db = await connectToDatabase();

    // 1️⃣ Insert into chartofaccounts
    await db.query(
      "INSERT INTO chartofaccounts (account_name, account_type, status, description) VALUES (?, ?, ?, ?)",
      [account_name, account_type, "Active", description]
    );

    // 2️⃣ Get logged-in user info
    const user_name = req.user.user_name; // from auth middleware
    const role = req.user.role;

    // 3️⃣ Insert into audit_trail
    const action = "Add COA";
    const audit_description = `Added new COA: ${account_name} (${account_type})`;

    const created_at = new Date(); // current date and time
    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [user_name, role, action, audit_description, created_at]
    );

    return res.status(201).json({ message: "Account saved successfully!" });
  } catch (err) {
    console.error("COA insert error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Update Chart of Account by ID (with Audit Trail)
router.get("/coa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      "SELECT * FROM chartofaccounts WHERE account_id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Mark Chart of Account as inactive (instead of deleting)
router.delete("/coa/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id } = req.params;
    const db = await connectToDatabase();

    // ✅ Fetch existing account for audit trail details
    const [existing] = await db.query(
      "SELECT account_name FROM chartofaccounts WHERE account_id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    const accountName = existing[0].account_name;

    // ✅ Instead of DELETE, update the status
    const [result] = await db.query(
      "UPDATE chartofaccounts SET status = 'Inactive' WHERE account_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    // ✅ Insert audit trail record
    const at_action = "Update Chart of Account Status";
    const at_description = `User "${decoded.user_name}" marked the Chart of Account "${accountName}" as Inactive.`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    return res.json({ message: "Account marked as inactive successfully" });
  } catch (err) {
    console.error("Error updating COA status:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//========== SUB ACCOUNTS ==========

//get subaccount by sub id ->
router.get("/subacc/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();
    const [result] = await db.query
      ("SELECT * FROM subaccount WHERE id = ?",
        [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Add new subaccount -> admincoaviewadd (with audit trail)
router.post("/coa/:id/subaccounts", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { id } = req.params;
  const { account_name } = req.body;

  if (!account_name) {
    return res.status(400).json({ error: "Subaccount name is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();

    // ✅ Check if subaccount already exists
    const [existing] = await db.query(
      "SELECT * FROM subaccount WHERE account_id = ? AND account_name = ?",
      [id, account_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Subaccount name already exists" });
    }

    // ✅ Insert new subaccount
    const [result] = await db.query(
      "INSERT INTO subaccount (account_id, account_name, account_status) VALUES (?, ?, 'active')",
      [id, account_name]
    );

    // ✅ Insert audit trail record
    const at_action = "Add Subaccount";
    const at_description = `User "${decoded.user_name}" added a new subaccount "${account_name}" under COA ID: ${id}.`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    return res.status(201).json({
      message: "Subaccount added successfully",
      subaccountId: result.insertId,
    });
  } catch (err) {
    console.error("❌ MySQL Error inserting subaccount:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});

// get subaccounts by account_id -> admincoaview.jsx
router.get("/coa/:id/subaccounts", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT * FROM subaccount WHERE account_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No subaccounts found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error fetching subaccounts:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/sub/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  const { id } = req.params;
  const { account_name, account_status } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();

    const [existing] = await db.query(
      "SELECT * FROM subaccount WHERE account_name = ? AND id != ?",
      [account_name, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Account name already exists" });
    }

    const [oldRecord] = await db.query("SELECT account_name, account_status FROM subaccount WHERE id = ?", [id]);
    if (oldRecord.length === 0) {
      return res.status(404).json({ message: "Subaccount not found" });
    }

    const oldName = oldRecord[0].account_name;
    const oldStatus = oldRecord[0].account_status;

    await db.query(
      "UPDATE subaccount SET account_name = ?, account_status = ? WHERE id = ?",
      [account_name, account_status, id]
    );

    const at_action = "Edit Subaccount";
    const at_description = `User "${decoded.user_name}" updated subaccount "${oldName}" (${oldStatus}) to "${account_name}" (${account_status}).`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    res.json({ message: "Account updated successfully!" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get all subaccount based on account id -> adminjournaladd.jsx
router.get("/subaccs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT id, account_name FROM subaccount WHERE account_id = ? ORDER BY account_name ASC",
      [id]
    );

    if (rows.length === 0) {
      return res.json([]); // return empty array if no subaccounts
    }

    res.json(rows);
  } catch (err) {
    console.error("Fetch Subaccounts error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Inactivate a subaccount by ID (soft delete)
router.put("/coa/sub/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();

    // Update the account_status instead of deleting
    const sql = "UPDATE subaccount SET account_status = 'inactive' WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Subaccount not found" });
    }

    res.status(200).json({ message: "Subaccount set to inactive successfully!" });
  } catch (err) {
    console.error("Error inactivating subaccount:", err);
    res.status(500).json({ message: "Failed to inactivate subaccount." });
  }
});

//=================================== JOURNAL ENTRY & GENERAL LEDGER ====================================

// get journal entry (for adminjournal)
router.get("/journal1", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT 
        j.entry_id,
        j.date,
        j.description,
        COALESCE(CONCAT(ca.account_name, ' : ', sa.account_name), ca.account_name) AS Account,
        j.debit,
        j.credit,
        j.comment
      FROM journalentry j
      LEFT JOIN subaccount sa ON j.id = sa.id
      LEFT JOIN chartofaccounts ca ON j.account_id = ca.account_id
      GROUP BY j.entry_id
      ORDER BY j.entry_id ASC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("Fetch journal entries error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Add a new journal entry + insert general ledger (with audit trail)
router.post("/journal", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  const {
    date,
    description,
    account_id,
    subaccount_id,
    debit,
    credit,
    comment,
  } = req.body;

  const debitAmount = parseFloat(debit) || 0;
  const creditAmount = parseFloat(credit) || 0;
  const totalAmount = debitAmount > 0 ? debitAmount : creditAmount;

  if (!date || !description || !account_id || (!debit && !credit)) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();

    console.log("🧾 Starting journal entry...");
    console.log("📦 Request body:", req.body);

    //  Insert into journalentry (conditionally include subaccount_id)
    let journalQuery;
    let journalParams;

    if (subaccount_id) {
      journalQuery =
        "INSERT INTO journalentry (`date`, description, account_id, id, debit, credit, comment, total_amount) VALUES (?,?,?,?,?,?,?,?)";
      journalParams = [
        date,
        description,
        account_id,
        subaccount_id,
        debitAmount,
        creditAmount,
        comment || "n/a",
        totalAmount,
      ];
    } else {
      journalQuery =
        "INSERT INTO journalentry (`date`, description, account_id, debit, credit, comment, total_amount) VALUES (?,?,?,?,?,?,?)";
      journalParams = [
        date,
        description,
        account_id,
        debitAmount,
        creditAmount,
        comment || "n/a",
        totalAmount,
      ];
    }

    const [journalResult] = await db.query(journalQuery, journalParams);
    const entryId = journalResult.insertId;
    console.log("Journal entry inserted with ID:", entryId);

    // Get account type
    const [accountRows] = await db.query(
      "SELECT account_type, account_name FROM chartofaccounts WHERE account_id = ?",
      [account_id]
    );

    if (accountRows.length === 0) {
      console.warn("⚠️ Account not found for ID:", account_id);
      return res.status(400).json({ message: "Account not found" });
    }

    const accountType = accountRows[0].account_type;
    const accountName = accountRows[0].account_name;
    console.log("📘 Account type:", accountType, "| Account name:", accountName);

    // Get last balance for this account
    const [lastBalanceRows] = await db.query(
      "SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY ledger_id DESC LIMIT 1",
      [account_id]
    );

    let lastBalance = lastBalanceRows.length
      ? parseFloat(lastBalanceRows[0].balance)
      : 0;
    console.log("💰 Last balance for", accountName, "=", lastBalance);

    //  Compute new balance
    let newBalance;
    if (accountType === "Asset" || accountType === "Expense") {
      newBalance = lastBalance + debitAmount - creditAmount;
    } else {
      newBalance = lastBalance + creditAmount - debitAmount;
    }
    console.log("📊 Computed new balance:", newBalance);

    //  Insert into general_ledger
    await db.query(
      "INSERT INTO general_ledger (entry_id, account_id, description, debit, credit, balance, date, total_amount) VALUES (?,?,?,?,?,?,?,?)",
      [
        entryId,
        account_id,
        description,
        debitAmount,
        creditAmount,
        newBalance,
        date,
        totalAmount,
      ]
    );
    console.log("🧮 General ledger updated for", accountName);

    //   AUTO CASH OR REVOLVING FUND ENTRY (only if Expense is debited)
    if (accountType === "Expense" && debitAmount > 0 && comment !== "auto entry") {
      console.log(" Auto cash/revolving credit triggered for Expense:", accountName);

      // Determine which account to credit based on amount
      const creditAccountName = debitAmount <= 1000 ? "Revolving Fund" : "Cash on Bank";

      // Get the account_id of the chosen credit account
      const [creditRows] = await db.query(
        "SELECT account_id FROM chartofaccounts WHERE account_name = ? LIMIT 1",
        [creditAccountName]
      );

      if (creditRows.length > 0) {
        const creditId = creditRows[0].account_id;

        // Get latest balance for chosen credit account
        const [creditBalanceRows] = await db.query(
          "SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY ledger_id DESC LIMIT 1",
          [creditId]
        );

        let lastBalance = creditBalanceRows.length
          ? parseFloat(creditBalanceRows[0].balance)
          : 0;
        const newBalance = lastBalance - debitAmount;

        // Insert credit journal entry (auto)
        const [creditJournal] = await db.query(
          "INSERT INTO journalentry (`date`, description, account_id, debit, credit, comment, total_amount) VALUES (?,?,?,?,?,?,?)",
          [
            date,
            `${accountName}: ${description}`,
            creditId,
            0,
            debitAmount,
            "auto entry",
            debitAmount,
          ]
        );

        // Reflect in General Ledger
        await db.query(
          "INSERT INTO general_ledger (entry_id, account_id, description, debit, credit, balance, date, total_amount) VALUES (?,?,?,?,?,?,?,?)",
          [
            creditJournal.insertId,
            creditId,
            `Auto Credit (${creditAccountName}) for ${accountName}`,
            0,
            debitAmount,
            newBalance,
            date,
            debitAmount,
          ]
        );

        console.log(` Auto ${creditAccountName} credit entry added for`, accountName);
      } else {
        console.warn(` ${creditAccountName} account not found — skipping auto credit`);
      }
    }


    if (
      (accountName === "Cash on Hand" || accountName === "Cash on Bank") &&
      creditAmount > 0 &&
      comment !== "auto transfer"
    ) {
      console.log(`🏦 Auto transfer triggered: ${accountName} credited`);

      const transferFrom = accountName;
      let transferTo;

      //  New condition: if Cash on Bank is credited, transfer to Revolving Fund
      if (accountName === "Cash on Bank") {
        transferTo = "Revolving Fund";
      } else {
        // existing logic: Cash on Hand credited → transfer to Cash on Bank
        transferTo = "Cash on Bank";
      }

      // Fetch target account ID
      const [targetRows] = await db.query(
        "SELECT account_id FROM chartofaccounts WHERE account_name = ? LIMIT 1",
        [transferTo]
      );

      if (targetRows.length > 0) {
        const targetId = targetRows[0].account_id;

        // Get latest balance for the target account
        const [targetBalanceRows] = await db.query(
          "SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY ledger_id DESC LIMIT 1",
          [targetId]
        );

        let lastTargetBalance = targetBalanceRows.length
          ? parseFloat(targetBalanceRows[0].balance)
          : 0;

        const newTargetBalance = lastTargetBalance + creditAmount;

        // Insert journal entry for receiving account (Debit)
        const [transferJournal] = await db.query(
          "INSERT INTO journalentry (`date`, description, account_id, debit, credit, comment, total_amount) VALUES (?,?,?,?,?,?,?)",
          [
            date,
            `Transfer from ${transferFrom}`,
            targetId,
            creditAmount,
            0,
            comment,
            creditAmount,
          ]
        );

        // Reflect in General Ledger
        await db.query(
          "INSERT INTO general_ledger (entry_id, account_id, description, debit, credit, balance, date, total_amount) VALUES (?,?,?,?,?,?,?,?)",
          [
            transferJournal.insertId,
            targetId,
            `Auto Debit for ${transferFrom} transfer`,
            creditAmount,
            0,
            newTargetBalance,
            date,
            creditAmount,
          ]
        );

        console.log(` Auto debit entry added for ${transferTo}`);
      } else {
        console.warn(
          ` Target account (${transferTo}) not found — skipping auto transfer`
        );
      }
    }

    // 6️⃣ Insert audit trail
    const action = "Add Journal Entry";
    const auditDescription = `Added journal entry for ${accountName} (${accountType}) — Debit: ₱${debitAmount.toFixed(
      2
    )}, Credit: ₱${creditAmount.toFixed(2)}, Description: "${description}"`;
    const created_at = new Date();

    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [decoded.user_name, decoded.role, action, auditDescription, created_at]
    );

    console.log("🪶 Audit trail entry added for:", decoded.user_name);

    return res
      .status(201)
      .json({ message: "Journal entry and general ledger updated successfully!" });
  } catch (err) {
    console.error("❌ Journal insert error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get general ledger f
router.get("/auth/general_ledger", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT g.date, c.account_name AS account, g.description, g.debit, g.credit, g.balance
      FROM general_ledger g
      JOIN chartofaccounts c ON g.account_id = c.account_id
      ORDER BY g.date, g.ledger_id
    `);
    return res.json(rows);
  } catch (err) {
    console.error("Fetch General Ledger error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get general ledger filter
router.get("/general_ledger1", async (req, res) => {
  const { account_id } = req.query;
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      `
      SELECT g.date, c.account_name AS account, c.account_type, 
             g.description, g.debit, g.credit, g.balance
      FROM general_ledger g
      JOIN chartofaccounts c ON g.account_id = c.account_id
      WHERE g.account_id = ?
      ORDER BY g.date, g.ledger_id
      `,
      [account_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Fetch General Ledger error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Get only  Payable
router.get("/accountPayable", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT account_id, account_name
      FROM chartofaccounts
      WHERE  account_name = 'Account Payable'
    `);
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err); // 👈 full error object
    res.status(500).json({ error: err.message });
  }
});

// Get only Receivable
router.get("/accountReceivable", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT account_id, account_name
      FROM chartofaccounts
      WHERE account_name = 'Account Receivable'
    `);
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err); // 👈 full error object
    res.status(500).json({ error: err.message });
  }
});

//Get Inventory
router.get("/accountInventory", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT account_id, account_name
      FROM chartofaccounts
      WHERE account_name = 'Dental Supplies' or account_name = 'Dental Equipment' 
    `);
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err); // 👈 full error object
    res.status(500).json({ error: err.message });
  }
});

//NEW ROUTE
router.get("/accountExpense", async (req, res) => {
  try {
    const db = await connectToDatabase();

    // Combine expense accounts + Dental Supplies + their subaccounts
    const [rows] = await db.query(`
      SELECT account_id, account_name
      FROM chartofaccounts
      WHERE account_type = 'Expense' 
         OR account_name = 'Dental Supplies' 
    `);

    res.json(rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: err.message });
  }
});


// Search patients by  name
router.get('/patients/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Name query parameter is required' });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query(
      `SELECT user_id, fname, mname, lname,
                  CONCAT(fname, ' ', mname, ' ', lname) AS full_name
          FROM users 
          WHERE LOWER(role) = 'patient'
            AND CONCAT(fname, ' ', mname, ' ', lname) LIKE ?
          LIMIT 10`,
      [`%${name}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error searching patients:', err.message);
    res.status(500).json({ error: err.message });
  }
});

//get supplier
router.get('/supplier', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Name query parameter is required' });

  const db = await connectToDatabase();
  const [rows] = await db.query(
    `SELECT supplier_id, supplier_name
     FROM supplier
     WHERE supplier_name LIKE ?`,
    [`%${name}%`]
  );
  res.json(rows);
});



// /// Insert into subsidiary+general+journal for account receivable
// router.post("/subsidiary", async (req, res) => {
//   try {
//     const db = await connectToDatabase();
//     const {
//       date,
//       name,
//       invoice_no,
//       debit,
//       credit,
//       account_id,
//     } = req.body;

//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Validate required fields
//     if (!date || !name || !invoice_no || !account_id) {
//       return res.status(400).json({
//         error: "Missing required fields: date, name, invoice_no, account_id",
//       });
//     }

//     // Split name
//     const nameParts = name.trim().split(/\s+/);
//     if (nameParts.length < 2) {
//       return res.status(400).json({ error: "Please provide full name (first and last)" });
//     }

//     const fname = nameParts[0];
//     const lname = nameParts[nameParts.length - 1];

//     // Find the user_id from users table
//     const [userRows] = await db.query(
//       `SELECT user_id FROM users 
//        WHERE LOWER(fname) = LOWER(?) 
//          AND LOWER(lname) = LOWER(?) 
//          AND LOWER(role) = 'patient'
//        LIMIT 1`,
//       [fname, lname]
//     );

//     if (userRows.length === 0) {
//       return res.status(404).json({ error: "Patient not found with the given name" });
//     }

//     const patient_id = userRows[0].user_id;

//     // Parse debit/credit
//     const debitVal = parseFloat(debit) || 0;
//     const creditVal = parseFloat(credit) || 0;

//     if (debitVal > 0 && creditVal > 0) {
//       return res.status(400).json({
//         error: "Only one of debit or credit should be provided.",
//       });
//     }

//     // --- SUBSIDIARY LEDGER ---

//     // Get last balance for this patient + account in subsidiary ledger
//     const [subsidiaryRows] = await db.query(
//       `SELECT balance
//        FROM subsidiary
//        WHERE account_id = ? AND patient_id = ?
//        ORDER BY sub_id DESC
//        LIMIT 1`,
//       [account_id, patient_id]
//     );

//     const lastSubsidiaryBalance = subsidiaryRows.length > 0 ? parseFloat(subsidiaryRows[0].balance) || 0 : 0;
//     const newSubsidiaryBalance = lastSubsidiaryBalance + debitVal - creditVal;

//     // Insert into subsidiary ledger
//     const [subsidiaryResult] = await db.query(
//       `INSERT INTO subsidiary 
//        (date, name, invoice_no, debit, credit, balance, account_id, patient_id)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [date, name, invoice_no, debitVal, creditVal, newSubsidiaryBalance, account_id, patient_id]
//     );

//     // --- JOURNAL ENTRY ---

//     const description = name;

//     // Insert main journal entry (for the provided account)
//     const [journalResult] = await db.query(
//       `INSERT INTO journalentry (date, description, account_id, debit, credit, comment)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [date, description, account_id, debitVal, creditVal, 'n/a']
//     );

//     // --- GENERAL LEDGER ---

//     // Get last balance for this account in general ledger
//     const [ledgerRows] = await db.query(
//       `SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY date DESC, ledger_id DESC LIMIT 1`,
//       [account_id]
//     );

//     const lastLedgerBalance = ledgerRows.length > 0 ? parseFloat(ledgerRows[0].balance) || 0 : 0;
//     const newLedgerBalance = lastLedgerBalance + debitVal - creditVal;

//     // Insert into general ledger
//     const [ledgerResult] = await db.query(
//       `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [date, description, account_id, debitVal, creditVal, newLedgerBalance, journalResult.insertId]
//     );

//     // --- PARTNER ACCOUNT: Service Income ---
//     let partnerAccountName = null;

//     if (debitVal > 0) {
//       // AR is debited -> partner is Sales Revenue (credited)
//       partnerAccountName = 'Service Income';
//     } else if (creditVal > 0) {
//       // AR is credited -> partner is Cash (debited)
//       partnerAccountName = 'Cash';
//     }

//     if (!partnerAccountName) {
//       return res.status(400).json({ error: "Either debit or credit must be provided." });
//     }

//     // Find partner account_id dynamically
//     const [partnerRows] = await db.query(
//       `SELECT account_id FROM chartofaccounts 
//         WHERE LOWER(account_name) = LOWER(?) 
//         LIMIT 1`,
//       [partnerAccountName]
//     );

//     if (partnerRows.length === 0) {
//       return res.status(500).json({ error: `${partnerAccountName} account not found in chart of accounts` });
//     }

//     const partnerAccountId = partnerRows[0].account_id;

//     // Partner debit/credit is the reverse of AR entry
//     const partnerDebit = creditVal;
//     const partnerCredit = debitVal;

//     // Insert partner journal entry
//     const [partnerJournalResult] = await db.query(
//       `INSERT INTO journalentry (date, description, account_id, debit, credit, comment)
//         VALUES (?, ?, ?, ?, ?, ?)`,
//       [date, description, partnerAccountId, partnerDebit, partnerCredit, 'Partner entry']
//     );

//     // Get last balance for partner account in general ledger
//     const [partnerLedgerRows] = await db.query(
//       `SELECT balance FROM general_ledger 
//         WHERE account_id = ? 
//         ORDER BY date DESC, ledger_id DESC 
//         LIMIT 1`,
//       [partnerAccountId]
//     );

//     const lastPartnerLedgerBalance = partnerLedgerRows.length > 0 ? parseFloat(partnerLedgerRows[0].balance) || 0 : 0;
//     const newPartnerLedgerBalance = lastPartnerLedgerBalance + partnerDebit - partnerCredit;

//     // Insert partner entry into general ledger
//     await db.query(
//       `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [date, description, partnerAccountId, partnerDebit, partnerCredit, newPartnerLedgerBalance, partnerJournalResult.insertId]
//     );

//     // 6️⃣ Insert into audit trail
//     const action = "Add Subsidiary Entry";
//     const auditDescription = `Added subsidiary entry for ${name} (Invoice No: ${invoice_no}) — Account Receivable: ₱${debitVal.toFixed(2)} / ₱${creditVal.toFixed(2)} | Partner: ${partnerAccountName}`;
//     const created_at = new Date();

//     await db.query(
//       "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
//       [decoded.user_name, decoded.role, action, auditDescription, created_at]
//     );

//     res.status(201).json({
//       message: "Subsidiary, journal entry, general ledger, and partner entries inserted successfully.",
//       subsidiaryId: subsidiaryResult.insertId,
//       journalEntryId: journalResult.insertId,
//       generalLedgerId: ledgerResult.insertId,
//       partnerJournalEntryId: partnerJournalResult.insertId,
//       patient_id,
//       newSubsidiaryBalance,
//       newLedgerBalance,
//       newPartnerLedgerBalance,
//     });

//   } catch (err) {
//     console.error("❌ Error inserting records:", err);
//     res.status(500).json({ error: "Internal server error: " + err.message });
//   }
// });


/// Insert into subsidiary+general+journal for account payable
router.post("/subsidiary1", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const {
      date,
      name,
      invoice_no,
      debit,
      credit,
      account_id,
      expense_id,
      items,
      day_agreement,
      due_date,
      amount
    } = req.body;

    // 🔸 Validate required fields
    if (!date || !name || !invoice_no || !account_id || !items || !day_agreement || !due_date) {
      return res.status(400).json({
        error: "Missing required fields: date, name, invoice_no, account_id",
      });
    }

    if (parseFloat(credit) > 0) {
      const [existingInvoice] = await db.query(
        `SELECT 1 FROM sub_payable WHERE invoice_no = ? LIMIT 1`,
        [invoice_no]
      );
      if (existingInvoice.length > 0) {
        return res.status(400).json({
          error: "Invoice number already exists.",
        });
      }
    }
    //NEW LINE
    let supplier_id = 0;
    // 🔸 Get supplier_id from supplier table
    const [userRows] = await db.query(
      `SELECT supplier_id FROM supplier WHERE supplier_name = ? LIMIT 1`,
      [name]
    );
    if (userRows.length > 0) {
      supplier_id = userRows[0].supplier_id;
    }

    // 🔸 Get expense name (chart of accounts)
    const [expenseRows] = await db.query(
      `SELECT account_name FROM chartofaccounts WHERE account_id = ? LIMIT 1`,
      [expense_id]
    );
    if (expenseRows.length === 0) {
      return res.status(404).json({ error: "Account not found with the given ID" });
    }
    const expensename = expenseRows[0].account_name;

    // 🔸 Parse debit/credit values
    const debitVal = parseFloat(debit) || 0;
    const creditVal = parseFloat(credit) || 0;
    if (debitVal > 0 && creditVal > 0) {
      return res.status(400).json({ error: "Only one of debit or credit should be provided." });
    }

    // 🔸 Get total amount for this invoice
    const [existingSub] = await db.query(
      `SELECT total_amount FROM sub_payable WHERE invoice_no = ?`,
      [invoice_no]
    );
    const total_amount = existingSub.length > 0
      ? parseFloat(existingSub[0].total_amount)
      : parseFloat(amount) || 0;

    const [subsidiaryRows] = await db.query(
      `SELECT balance FROM sub_payable
       WHERE supplier_id = ? AND invoice_no = ?
       ORDER BY pay_id DESC
       LIMIT 1`,
      [supplier_id, invoice_no]
    );

    const lastSubsidiaryBalance = subsidiaryRows.length > 0 ? parseFloat(subsidiaryRows[0].balance) || 0 : 0;

    // Liabilities: Credit ↑ increases balance, Debit ↓ decreases balance
    const newSubsidiaryBalance = lastSubsidiaryBalance + creditVal - debitVal;

    await db.query(
      `INSERT INTO sub_payable
        (date, invoice_no, amount, particulars, debit, credit, balance, supplier_id, items, day_agreement, due_date, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, invoice_no, amount, `${name} - ${expensename}`, debitVal, creditVal, newSubsidiaryBalance, supplier_id, items, day_agreement, due_date, total_amount]
    );
    //journal entry
    const description = `${name} - ${expensename}`;
    const [journalResult] = await db.query(
      `INSERT INTO journalentry (date, description, account_id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, description, account_id, debitVal, creditVal, items, total_amount]
    );

    //NEW EDIT LINE
    //general ledger
    const [ledgerRows] = await db.query(
      `SELECT balance FROM general_ledger 
       WHERE account_id = ? 
       ORDER BY date DESC, ledger_id DESC 
       LIMIT 1`,
      [account_id]
    );

    const lastLedgerBalance = ledgerRows.length > 0 ? parseFloat(ledgerRows[0].balance) || 0 : 0;

    // ✅ Same rule for liabilities
    const newLedgerBalance = lastLedgerBalance + creditVal - debitVal;

    const [ledgerResult] = await db.query(
      `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, account_id, debitVal, creditVal, newLedgerBalance, journalResult.insertId, total_amount]
    );

    //NEW EDIT LINE
    // payment
    let partnerAccountName = debitVal > 0 ? "Cash on Bank" : expensename;
    const partnerDebit = creditVal;
    const partnerCredit = debitVal;

    // For reporting total only (not invoice total)
    const partnerTotalAmount = debitVal > 0 ? debitVal : creditVal;

    // Get partner account id
    const [partnerRows] = await db.query(
      `SELECT account_id FROM chartofaccounts WHERE LOWER(account_name) = LOWER(?) LIMIT 1`,
      [partnerAccountName]
    );
    if (partnerRows.length === 0) {
      return res.status(500).json({ error: `${partnerAccountName} account not found in chart of accounts` });
    }
    const partnerAccountId = partnerRows[0].account_id;

    //NEW EDIT LINE 
    // Journal entry for partner account
    const [partnerJournalResult] = await db.query(
      `INSERT INTO journalentry (date, description, account_id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, description, partnerAccountId, partnerDebit, partnerCredit, `payment to ${items}`, partnerTotalAmount]
    );

    // Get partner ledger balance
    const [partnerLedgerRows] = await db.query(
      `SELECT balance FROM general_ledger 
       WHERE account_id = ? 
       ORDER BY date DESC, ledger_id DESC 
       LIMIT 1`,
      [partnerAccountId]
    );

    const lastPartnerLedgerBalance = partnerLedgerRows.length > 0 ? parseFloat(partnerLedgerRows[0].balance) || 0 : 0;

    // ✅ Assets (like Cash): Debit ↑ increases, Credit ↓ decreases
    const newPartnerLedgerBalance = lastPartnerLedgerBalance + partnerDebit - partnerCredit;

    //NEW EDIT LINE 3836 (ADDED ONLY PAYMENT TO DESCRIPTION)
    // Insert partner ledger entry
    await db.query(
      `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, `payment to ${description}`, partnerAccountId, partnerDebit, partnerCredit, newPartnerLedgerBalance, partnerJournalResult.insertId, partnerTotalAmount]
    );

    res.status(201).json({
      message: "Subsidiary, journal entry, and general ledger records inserted successfully.",
      supplier_id,
      newSubsidiaryBalance,
      newLedgerBalance,
      total_amount
    });

  } catch (err) {
    console.error("❌ Error inserting records:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

//get subsidiary of payable
router.get("/subsidiaryPayable", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT sp.date, sp.invoice_no, sp.day_agreement, sp.amount, sp.total_amount,
       sp.due_date, sp.items, sp.balance, sp. debit , sp.credit, sp.pay_id ,s.supplier_name, sp.particulars
       FROM sub_payable sp
       LEFT JOIN supplier s ON sp.supplier_id = s.supplier_id`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching subsidiary ledger:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//insert into sub receivable for partial payments
router.post("/subsidiaryReceivable", async (req, res) => {
  const { date, name, invoice_no, amount, appoint_id, procedure_type } = req.body;
  const db = await connectToDatabase();
  const connection = db;

  try {
    await connection.beginTransaction();

    //  Get appointment + user info
    const [appointmentRows] = await connection.query(
      `SELECT a.user_name, u.user_id, u.fname, u.lname, a.total_charged
       FROM appointment a
       JOIN users u ON a.user_name = u.user_name
       WHERE a.appoint_id = ?`,
      [appoint_id]
    );

    if (appointmentRows.length === 0) {
      throw new Error("Appointment or user not found");
    }

    const user = appointmentRows[0];
    const description = `${procedure_type} - ${user.fname} ${user.lname}`;
    const comment = `payment from Appointment #${appoint_id}`;

    const currentAmount = Number(amount);
    const totalCharged = Number(user.total_charged);

    //get total_amount
    const [existingPayment] = await connection.query(
      `SELECT total_amount FROM sub_receivable WHERE invoice_no = ?`,
      [invoice_no]
    );

    let total_amount;
    if (existingPayment.length > 0) {
      total_amount = Number(existingPayment[0].total_amount);
    } else {
      total_amount = totalCharged;
    }

    // Get previous payments (credit total)
    const [prevPayments] = await connection.query(
      `SELECT SUM(credit) AS totalPaid FROM sub_receivable WHERE appoint_id = ?`,
      [appoint_id]
    );

    const totalPaid = Number(prevPayments[0].totalPaid || 0);
    const newBalance = totalCharged - (totalPaid + currentAmount);

    //NEW EDIT LINE 3926 3929 3933
    //  Get Cash and A/R account IDs
    const [coaRows] = await connection.query(
      `SELECT account_id, account_name FROM chartofaccounts 
       WHERE account_name IN ('Cash on Hand', 'Account Receivable')`
    );

    const cashAccount = coaRows.find(a => a.account_name === "Cash on Hand");
    const receivableAccount = coaRows.find(a => a.account_name === "Account Receivable");

    if (!cashAccount || !receivableAccount) {
      throw new Error("Missing Cash on Hand or Account Receivable in chart of accounts");
    }

    // Insert Journal Entries
    const [journalCash] = await connection.query(
      `INSERT INTO journalentry 
         (date, description, account_id, id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, cashAccount.account_id, 0, currentAmount, 0, comment, currentAmount]
    );

    const [journalAR] = await connection.query(
      `INSERT INTO journalentry 
         (date, description, account_id, id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, receivableAccount.account_id, 0, 0, currentAmount, comment, currentAmount]
    );

    // Get last balances for general ledger accounts
    const [lastCashBalanceRows] = await connection.query(
      `SELECT balance FROM general_ledger 
       WHERE account_id = ? 
       ORDER BY date DESC, entry_id DESC LIMIT 1`,
      [cashAccount.account_id]
    );
    const lastCashBalance = lastCashBalanceRows.length ? Number(lastCashBalanceRows[0].balance) : 0;
    const newCashBalance = lastCashBalance + currentAmount;

    const [lastARBalanceRows] = await connection.query(
      `SELECT balance FROM general_ledger 
       WHERE account_id = ? 
       ORDER BY date DESC, entry_id DESC LIMIT 1`,
      [receivableAccount.account_id]
    );
    const lastARBalance = lastARBalanceRows.length ? Number(lastARBalanceRows[0].balance) : 0;
    const newARBalance = lastARBalance - currentAmount;

    // Insert into General Ledger
    await connection.query(
      `INSERT INTO general_ledger 
         (account_id, entry_id, date, debit, credit, balance, description, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cashAccount.account_id, journalCash.insertId, date, currentAmount, 0, newCashBalance, description, currentAmount]
    );

    await connection.query(
      `INSERT INTO general_ledger 
         (account_id, entry_id, date, debit, credit, balance, description, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [receivableAccount.account_id, journalAR.insertId, date, 0, currentAmount, newARBalance, description, total_amount]
    );

    // Insert into subsidiary receivable
    await connection.query(
      `INSERT INTO sub_receivable 
         (date, particulars, invoice_no, debit, credit, balance, appoint_id, user_id, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, invoice_no, 0, currentAmount, newBalance, appoint_id, user.user_id, total_amount]
    );

    // Update appointment if fully paid
    if (newBalance <= 0) {
      await connection.query(
        `UPDATE appointment SET payment_status = 'paid' , payment_confirmation = 'complete' WHERE appoint_id = ?`,
        [appoint_id]
      );
    }

    await connection.commit();
    res.json({
      message: "Payment recorded successfully!",
      remaining_balance: newBalance,
    });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Error processing payment:", err);
    res.status(500).json({ message: err.message });

    if (connection.release) connection.release();
  }
});

//insert into sub_receivable for hmos
router.post("/subsidiaryReceivableHmo", async (req, res) => {
  const { date, name, invoice_no, amount, appoint_id, procedure_type } = req.body;
  const db = await connectToDatabase();
  const connection = db;

  try {
    await connection.beginTransaction();

    //  Get appointment + user info
    const [appointmentRows] = await connection.query(
      `SELECT a.user_name, u.user_id, u.fname, u.lname, a.hmo_charge
       FROM appointment a
       JOIN users u ON a.user_name = u.user_name
       WHERE a.appoint_id = ?`,
      [appoint_id]
    );

    if (appointmentRows.length === 0) {
      throw new Error("Appointment or user not found");

    }

    //Get hmo name
    const [HmoRows] = await connection.query(
      `SELECT hmo_name
       FROM appointment 
       WHERE appoint_id = ?`,
      [appoint_id]
    );

    if (HmoRows.length === 0) {
      throw new Error("Appointment or user not found");
    }

    const HmoName = HmoRows[0];

    const user = appointmentRows[0];
    const description = `${HmoName.hmo_name} : ${procedure_type} - ${user.fname} ${user.lname}`;
    const comment = `Appointment #${appoint_id}`;

    const currentAmount = Number(amount);
    const totalCharged = Number(user.hmo_charge);


    //get total_amount
    const [existingPayment] = await connection.query(
      `SELECT total_amount FROM sub_receivable WHERE invoice_no = ?`,
      [invoice_no]
    );

    if (existingPayment.length === 0) {
      throw new Error(`No existing total_amount found for invoice_no: ${invoice_no}`);
    }

    const total_amount = Number(existingPayment[0].total_amount);
    // Get previous payments (credit total)
    const [prevPayments] = await connection.query(
      `SELECT SUM(credit) AS totalPaid FROM sub_receivable WHERE appoint_id = ?`,
      [appoint_id]
    );

    const totalPaid = Number(prevPayments[0].totalPaid || 0);
    const newBalance = totalCharged - (totalPaid + currentAmount);

    //NEW EDIT LINE 3926 3929 3933
    //  Get Cash and A/R account IDs
    const [coaRows] = await connection.query(
      `SELECT account_id, account_name FROM chartofaccounts 
       WHERE account_name IN ('Cash on Hand', 'Account Receivable')`
    );

    const cashAccount = coaRows.find(a => a.account_name === "Cash on Hand");
    const receivableAccount = coaRows.find(a => a.account_name === "Account Receivable");

    if (!cashAccount || !receivableAccount) {
      throw new Error("Missing Cash on Hand or Account Receivable in chart of accounts");
    }

    // Insert Journal Entries
    const [journalCash] = await connection.query(
      `INSERT INTO journalentry 
         (date, description, account_id, id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, cashAccount.account_id, 0, currentAmount, 0, comment, currentAmount]
    );

    const [journalAR] = await connection.query(
      `INSERT INTO journalentry 
         (date, description, account_id, id, debit, credit, comment, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, receivableAccount.account_id, 0, 0, currentAmount, comment, currentAmount]
    );

    // Get last balances for general ledger accounts
    const [lastCashBalanceRows] = await connection.query(
      `SELECT balance FROM general_ledger 
       WHERE account_id = ? 
       ORDER BY date DESC, entry_id DESC LIMIT 1`,
      [cashAccount.account_id]
    );
    const lastCashBalance = lastCashBalanceRows.length ? Number(lastCashBalanceRows[0].balance) : 0;
    const newCashBalance = lastCashBalance + currentAmount;

    const [lastARBalanceRows] = await connection.query(
      `SELECT balance FROM general_ledger 
       WHERE account_id = ? 
       ORDER BY date DESC, entry_id DESC LIMIT 1`,
      [receivableAccount.account_id]
    );
    const lastARBalance = lastARBalanceRows.length ? Number(lastARBalanceRows[0].balance) : 0;
    const newARBalance = lastARBalance - currentAmount;

    // Insert into General Ledger
    await connection.query(
      `INSERT INTO general_ledger 
         (account_id, entry_id, date, debit, credit, balance, description, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cashAccount.account_id, journalCash.insertId, date, currentAmount, 0, newCashBalance, description, currentAmount]
    );

    await connection.query(
      `INSERT INTO general_ledger 
         (account_id, entry_id, date, debit, credit, balance, description, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [receivableAccount.account_id, journalAR.insertId, date, 0, currentAmount, newARBalance, description, total_amount]
    );

    // Insert into subsidiary receivable
    await connection.query(
      `INSERT INTO sub_receivable 
         (date, particulars, invoice_no, debit, credit, balance, appoint_id, user_id, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, description, invoice_no, 0, currentAmount, newBalance, appoint_id, user.user_id, total_amount]
    );

    // Update appointment if fully paid
    if (newBalance <= 0) {
      await connection.query(
        `UPDATE appointment SET hmo_payment = 'complete' WHERE appoint_id = ?`,
        [appoint_id]
      );
    }

    await connection.commit();
    res.json({
      message: "Payment recorded successfully!",
      remaining_balance: newBalance,
    });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Error processing payment:", err);
    res.status(500).json({ message: err.message });

    if (connection.release) connection.release();
  }
});

// get subsidiary of receivable
router.get("/subsidiaryReceivable", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT 
  a.procedure_type,
  a.pref_date,
  a.total_service_charged,
  a.total_charged,
  CONCAT(a.p_fname, ' ', a.p_mname, ' ', a.p_lname) AS patient_name,
  sr.*
FROM sub_receivable sr
JOIN appointment a ON sr.appoint_id = a.appoint_id;
 `
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching subsidiary ledger:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//consultation receivable
router.get("/consultationReceivale", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT *
       FROM sub_receivable
       where  appoint_id`,
      [appoint_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching subsidiary ledger:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get general_ledger
router.get("/general", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
            SELECT g.date, c.account_name AS account, c.account_type, g.debit, g.credit, g.balance, g.description, g.total_amount
      FROM general_ledger g
      JOIN chartofaccounts c ON g.account_id = c.account_id
      ORDER BY g.date, g.ledger_id
        `);
    return res.json(rows); // Send back as JSON array
  } catch (err) {
    console.error("Insert Error:", err); // full error object
    res.status(500).json({ error: err.message, details: err });
  }
});

router.get("/trial", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT
        gl.account_id,
        coa.account_name,
        COALESCE(SUM(gl.debit), 0) AS total_debit,
        COALESCE(SUM(gl.credit), 0) AS total_credit,
        (COALESCE(SUM(gl.credit), 0) - COALESCE(SUM(gl.debit), 0)) AS net_credit_minus_debit
      FROM general_ledger gl
      JOIN chartofaccounts coa ON coa.account_id = gl.account_id
      GROUP BY gl.account_id, coa.account_name
      ORDER BY coa.account_name
    `);

    let totalDebit = 0;
    let totalCredit = 0;

    const data = rows.map((r) => {
      const net = Number(r.net_credit_minus_debit) || 0;

      let debit = 0;
      let credit = 0;

      if (net >= 0) {
        credit = net;
      } else {
        debit = -net;
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        account_id: r.account_id,
        account_name: r.account_name,
        debit,
        credit
      };
    });

    res.json({ data, totalDebit, totalCredit });
  } catch (error) {
    console.error("Trial Balance Route Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
;


router.get("/checkOR/:orNum", async (req, res) => {
  const { orNum } = req.params;
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(
      "SELECT appoint_id FROM appointment WHERE or_num = ?",
      [orNum]
    );

    if (rows.length > 0) {
      return res.json({ exists: true, appoint_id: rows[0].appoint_id });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking OR number:", err);
    return res.status(500).json({ error: "Failed to check OR number" });
  }
});

// Add this to your routes file
router.get("/appointments/all", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, user_name, procedure_type, pref_date, pref_time, 
             attending_dentist, appointment_status
      FROM appointment
      ORDER BY pref_date ASC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("Fetch all appointments error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//NEW (MAIN HMO)
router.get("/HMO", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(
      "SELECT * FROM hmo  "
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching HMO:", err);
    return res.status(500).json({ error: "Failed to get HMO" });
  }
});

// Use uploadHMO here
router.post("/hmo", uploadHMO.single("moa_letter"), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();
    const { hmo_name, status } = req.body;

    // ✅ Use S3 URL
    const moaPath = req.file ? req.file.location : null;

    if (!hmo_name || !status || !req.file) {
      return res.status(400).json({ message: "Please fill in all required fields including MOA Letter." });
    }

    const [existing] = await db.query(
      "SELECT * FROM hmo WHERE hmo_name = ? ",
      [hmo_name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "HMO already exists" });
    }

    await db.query(
      "INSERT INTO hmo (hmo_name, status, moa_letter) VALUES (?, ?, ?)",
      [hmo_name, status, moaPath]
    );

    // ✅ Insert audit trail record
    const at_action = "Add HMO Service";
    const at_description = `User "${decoded.user_name}" added a new HMO "${hmo_name}".`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    res.json({ message: "HMO added successfully!" });
  } catch (err) {
    console.error("❌ MySQL Error inserting subaccount:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});


//NEW (HMO SERVICE ADD)
router.post("/hmoservice/:hmo_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { hmo_id } = req.params;
  const { service, status, coverage } = req.body;

  if (!service || !coverage) {
    return res.status(400).json({ error: "service name and coverage is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();

    //  Check if subaccount already exists
    const [existing] = await db.query(
      "SELECT * FROM hmo_service WHERE hmo_id = ? AND service = ?",
      [hmo_id, service]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "HMO service already exists" });
    }

    //  Insert new service
    const [result] = await db.query(
      "INSERT INTO hmo_service (hmo_id, service, coverage, status) VALUES (?, ?, ?, ?)",
      [hmo_id, service, coverage, status]
    );

    // ✅ Insert audit trail record
    const at_action = "Add HMO Service";
    const at_description = `User "${decoded.user_name}" added a new service "${service}" under HMO Id: ${hmo_id}.`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    return res.status(201).json({
      message: "HMO Service added successfully",
      subaccountId: result.insertId,
    });
  } catch (err) {
    console.error("❌ MySQL Error inserting subaccount:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});

const EditHMOstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/hmo";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const HMOupload = multer({ storage: EditHMOstorage });

router.put("/hmo/:hmo_id", HMOupload.single("moa_letter"), async (req, res) => {
  console.log("📦 HMO Upload Debug:", {
      body: req.body,
      file: req.file,
    });
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { hmo_id } = req.params;
    const { hmo_name, status } = req.body;
    const db = await connectToDatabase();

    //  Keep old file if no new one uploaded
    let moaFile = req.file ? req.file.location : null;

    if (!moaFile) {
      // Get current file name from DB
      const [existing] = await db.query("SELECT moa_letter FROM hmo WHERE hmo_id = ?", [hmo_id]);
      moaFile = existing[0]?.moa_letter || null;
    }

    //  Update record
    const [result] = await db.query(
      "UPDATE hmo SET hmo_name = ?, status = ?, moa_letter = ? WHERE hmo_id = ?",
      [hmo_name, status, moaFile, hmo_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "HMO not found" });
    }

    //  Insert audit trail
    const action = "Update HMO";
    const description = `Updated HMO: ${hmo_name} (${moaFile})`;
    const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    res.json({ message: "HMO updated successfully." });
  } catch (err) {
    console.error("Update HMO error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/hmo/:hmoId", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { hmoId } = req.params;
    const db = await connectToDatabase();

    // ✅ Fetch existing account for audit trail details
    const [existing] = await db.query(
      "SELECT hmo_name FROM hmo WHERE hmo_id = ?",
      [hmoId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "HMO not found" });
    }

    const HMOName = existing[0].account_name;

    // ✅ Instead of DELETE, update the status
    const [result] = await db.query(
      "UPDATE hmo SET status = 'Inactive' WHERE hmo_id = ?",
      [hmoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "HMO not found" });
    }

    // ✅ Insert audit trail record
    const at_action = "Update HMO Status";
    const at_description = `User "${decoded.user_name}" marked the HMO "${HMOName}" as Inactive.`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    return res.json({ message: "Account marked as inactive successfully" });
  } catch (err) {
    console.error("Error updating COA status:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/hmo_service_status/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const { status } = req.body;

    const db = await connectToDatabase();

    const [result] = await db.query(
      "UPDATE hmo_service SET status = ? WHERE service_id = ?",
      [status, service_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating service:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//NEW
router.get("/hmo", async (req, res) => {

  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(
      "SELECT hmo_id, hmo_name FROM hmo where status = 'active' "
    );
    res.json(rows); // ✅ you forgot to return the data
  } catch (err) {
    console.error("Error fetching HMO:", err);
    return res.status(500).json({ error: "Failed to get HMO" });
  }
});

//NEW (BILLING)
router.get("/hmo/:hmoId/services", async (req, res) => {
  const { hmoId } = req.params;
  const db = await connectToDatabase();

  try {
    const [rows] = await db.query(
      "SELECT service_id, service, coverage FROM hmo_service WHERE hmo_id = ?",
      [hmoId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching HMO services:", err);
    res.status(500).json({ error: "Failed to get HMO services" });
  }
});

// NEW (SERVICES UNDER A HMO)
router.get("/hmo_services/:hmo_id", async (req, res) => {
  const { hmo_id } = req.params;
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(
      "SELECT * FROM hmo_service WHERE hmo_id = ?",
      [hmo_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching HMO services:", err);
    res.status(500).json({ message: "Failed to fetch HMO services" });
  }
});

// NEW SPECIFIC SERVICE
router.get("/hmo_service/:service_id", async (req, res) => {
  const { service_id } = req.params;
  const db = await connectToDatabase();

  try {
    const [rows] = await db.query(
      "SELECT service, coverage, status FROM hmo_service WHERE service_id = ?",
      [service_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching HMO services:", err);
    res.status(500).json({ message: "Failed to fetch HMO services" });
  }
});


// //NEW (SPECIFC HMO)
// router.get("/hmo/:id", async (req, res) => {
//   try {
//     const { hmo_id } = req.params;
//     const db = await connectToDatabase();

//     const [result] = await db.query(
//       "SELECT * FROM hmo WHERE hmo_id = ?",
//       [hmo_id]
//     );

//     if (result.length === 0) {
//       return res.status(404).json({ message: "HMO not found" });
//     }

//     res.json(result[0]);
//   } catch (err) {
//     console.error("Fetch COA error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });


// NEW HMO MAIN
router.get("/hmo1/:hmo_id", async (req, res) => {
  try {
    const { hmo_id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      "SELECT * FROM hmo WHERE hmo_id = ?",
      [hmo_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "HMO not found" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Fetch COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//NEW (ADD NEW SERVICE HMO)
router.post("/hmoservice/:hmo_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { hmo_id } = req.params;
  const { service, status, coverage } = req.body;

  if (!service || !coverage) {
    return res.status(400).json({ error: "service name and coverage is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();

    //  Check if subaccount already exists
    const [existing] = await db.query(
      "SELECT * FROM hmo_service WHERE hmo_id = ? AND service = ?",
      [hmo_id, service]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "HMO service already exists" });
    }

    //  Insert new service
    const [result] = await db.query(
      "INSERT INTO hmo_service (hmo_id, service, coverage, status) VALUES (?, ?, ?, ?)",
      [hmo_id, service, coverage, status]
    );

    // ✅ Insert audit trail record
    const at_action = "Add HMO Service";
    const at_description = `User "${decoded.user_name}" added a new service "${service}" under HMO Id: ${hmo_id}.`;
    const created_at = new Date();

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, at_action, at_description, created_at]
    );

    return res.status(201).json({
      message: "HMO Service added successfully",
      subaccountId: result.insertId,
    });
  } catch (err) {
    console.error("❌ MySQL Error inserting subaccount:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return res.status(500).json({
      error: "Database error",
      details: err.sqlMessage,
    });
  }
});

//NEW (EDIT HMO SERVICE)
router.put("/hmo_service/:service_id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { service_id } = req.params;
    const { service, coverage, hmo_status } = req.body;
    const db = await connectToDatabase();

    const [result] = await db.query(
      "UPDATE hmo_service SET service = ?, status = ?, coverage = ? WHERE service_id = ?",
      [service, hmo_status, coverage, service_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "HMO service not found" });
    }

    const action = "Update HMO Service";
    const description = `Updated HMO Service: ${service} (${hmo_status}), coverage: ${coverage}`;
    const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");

    await db.query(
      `INSERT INTO audittrail (user_name, role, at_action, at_description, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [decoded.user_name, decoded.role, action, description, created_at]
    );

    res.json({ message: "HMO service updated successfully." });
  } catch (err) {
    console.error("Update HMO Service error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ADMIN DASHBOARDS
// Count Appointments
router.get("/appointments/count", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM appointment");
    res.json(rows[0].count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments count" });
  }
});

// Count Patients
router.get("/patients/count", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'patient'");
    res.json(rows[0].count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patients count" });
  }
});

// routes/dashboard.js
router.get("/patients/demographics", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(`
      SELECT 
        CASE 
          WHEN age < 18 THEN 'Children'
          WHEN age BETWEEN 18 AND 59 THEN 'Adults'
          ELSE 'Seniors'
        END as category,
        COUNT(*) as value
      FROM users
      GROUP BY category;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch demographics" });
  }
});

// ✅ Patient demographics route
router.get("/receptionistpatientdemo", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const [rows] = await db.query(`
      SELECT 
        CASE 
          WHEN p_age < 18 THEN 'Children'
          WHEN p_age BETWEEN 18 AND 59 THEN 'Adults'
          ELSE 'Seniors'
        END as category,
        COUNT(*) as value
      FROM appointment
      GROUP BY category;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch demographics" });
  }
});


router.get("/receptionistdashboard", async (req, res) => {
  try {
    const db = await connectToDatabase();

    // --- TOTAL COUNTS ---
    const [[totalAppointments]] = await db.query(`
      SELECT COUNT(*) AS total FROM appointment
    `);

    // Count distinct users from appointment table (since no patient table)
    const [[patientsCount]] = await db.query(`
      SELECT COUNT(DISTINCT user_name) AS total FROM appointment
    `);

    const [[pendingAppointments]] = await db.query(`
      SELECT COUNT(*) AS total FROM appointment WHERE appointment_status = 'pending'
    `);

    const [[cancelledAppointments]] = await db.query(`
      SELECT COUNT(*) AS total FROM appointment WHERE appointment_status = 'cancelled'
    `);

    const [[completedAppointments]] = await db.query(`
      SELECT COUNT(*) AS total FROM appointment WHERE appointment_status = 'done'
    `);

    // --- TODAY'S APPOINTMENTS ---
    const [todayAppointments] = await db.query(`
      SELECT appoint_id, p_fname, p_lname, procedure_type, pref_time, appointment_status
      FROM appointment
      WHERE DATE(pref_date) = CURDATE()
      ORDER BY pref_time ASC
    `);

    // --- DEMOGRAPHICS (based on p_age from appointment table) ---
    const [demoRows] = await db.query(`
      SELECT
        CASE
          WHEN p_age < 18 THEN 'Children'
          WHEN p_age BETWEEN 18 AND 59 THEN 'Adults'
          ELSE 'Seniors'
        END AS category,
        COUNT(*) AS value
      FROM appointment
      GROUP BY category
    `);

    const patientDemographics = demoRows.map(r => ({
      category: r.category,
      value: Number(r.value)
    }));

    // --- APPOINTMENT TRENDS (Monthly) ---
    const [trendRows] = await db.query(`
      SELECT 
        MONTHNAME(pref_date) AS month,
        COUNT(*) AS appointments
      FROM appointment
      WHERE YEAR(pref_date) = YEAR(CURDATE())
      GROUP BY MONTH(pref_date)
      ORDER BY MONTH(pref_date)
    `);

    const appointmentTrends = trendRows.map(r => ({
      month: r.month.slice(0, 3), // "January" → "Jan"
      appointments: Number(r.appointments)
    }));

    // --- FINAL RESPONSE ---
    res.json({
      totalAppointments: totalAppointments.total,
      patientsCount: patientsCount.total,
      pendingAppointments: pendingAppointments.total,
      cancelledAppointments: cancelledAppointments.total,
      completedAppointments: completedAppointments.total,
      todayAppointments,
      patientDemographics,
      appointmentTrends
    });

  } catch (error) {
    console.error("Receptionist Dashboard Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ✅ Route for Revenue Summary (Admin Dashboard)
router.get("/revenue", async (req, res) => {
  try {
    const db = await connectToDatabase();

    // 🧠 Compute monthly revenue (total_charged per month)
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(billing_date, '%b') AS month,
        YEAR(billing_date) AS year,
        SUM(total_charged) AS revenue
      FROM appointment
      WHERE appointment_status = 'done'
      GROUP BY YEAR(billing_date), MONTH(billing_date)
      ORDER BY YEAR(billing_date), MONTH(billing_date);
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching revenue:", err);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

// ✅ Route for Ledger Summary (Dashboard Overview)
router.get("/ledger/summary", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [rows] = await db.query(`
      SELECT
        COALESCE(SUM(gl.debit), 0) AS total_debit,
        COALESCE(SUM(gl.credit), 0) AS total_credit
      FROM general_ledger gl
    `);

    const totalDebit = Number(rows[0].total_debit) || 0;
    const totalCredit = Number(rows[0].total_credit) || 0;
    const netBalance = totalCredit - totalDebit;

    res.json({ totalDebit, totalCredit, netBalance });
  } catch (error) {
    console.error("Ledger Summary Route Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


//NOTIFICATIONS
router.get("/notificaitions", authenticateToken, async (req, res) => {
  const userId = req.user.user_id; // comes from JWT
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      `SELECT * 
       FROM notifications 
       WHERE user_id = ? 
         AND ntf_created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY ntf_created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Staff sends follow-up notification
router.post("/followup/:appointId", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { appointId } = req.params;
    const { message } = req.body;

    // Get patient info (with contact number and email)
    const [rows] = await db.query(
      `SELECT u.user_id, u.contact_no, u.email, u.fname, u.lname 
       FROM appointment a 
       JOIN users u ON a.user_name = u.user_name 
       WHERE a.appoint_id = ?`,
      [appointId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Appointment or patient not found" });

    const patient = rows[0];

    // Insert notification into database
    await db.query(
      `INSERT INTO notifications 
      (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at, category)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'appointment')`,
      [patient.user_id, "Appointment Follow-up", message]
    );

    // --- Send styled follow-up email ---
    const emailSubject = "Follow-up Notification from Arciaga-Juntilla TMJ Ortho Dental Clinic";
    const emailBody = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; border: 2px solid #01D5C4; overflow: hidden;">
          
          <div style="background-color: #00458B; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Arciaga-Juntilla TMJ Ortho Dental Clinic</h1>
            <p style="color: #cce3f5; margin: 5px 0 0;">Follow-up Notification</p>
          </div>

          <div style="padding: 25px; color: #333;">
            <p>Dear <strong>${patient.fname} ${patient.lname}</strong>,</p>
            <p>You have a follow-up notification regarding your appointment:</p>
            <p style="padding: 10px; background-color: #f0f8ff; border: 1px solid #01D5C4; border-radius: 5px;">${message}</p>
            <p>Please make sure to check your appointment details or contact the clinic if needed.</p>

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://dental-clinic-management-system-frontend-wipu.onrender.com/" 
                style="background-color: #01D5C4; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                View Your Appointment
              </a>
            </div>
          </div>

          <div style="background-color: #f0f8ff; padding: 15px; text-align: center; font-size: 12px; color: #555;">
            <p>This is an automated message from Arciaga-Juntilla TMJ Ortho Dental Clinic.</p>
            <p>Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail(patient.email, emailSubject, emailBody);
      console.log("✅ Follow-up email sent to:", patient.email);
    } catch (emailError) {
      console.error("❌ Error sending follow-up email:", emailError);
    }

    res.json({ message: "Follow-up notification sent successfully!" });
  } catch (err) {
    console.error("Follow-up error:", err);
    res.status(500).json({ message: "Failed to send follow-up notification" });
  }
});

// Get all audit trail records
router.get("/audit-trail", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT at_id, user_name, role, at_action, at_description, created_at FROM audittrail ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Audit Trail fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
