import express from 'express';
import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateToken } from "../middleware/authMiddleware.js";
import bodyParser from "body-parser";

dotenv.config();

const router = express.Router();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// for register.jsx (REGISTRATION)
router.post('/register', async (req, res) => {
  const { user_name, user_password, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num, blood_type } = req.body;

  if (!user_name || !email || !user_password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(user_password, 10);
    await db.query(
      `INSERT INTO users 
      (user_name, user_password, role, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num, blood_type, user_status) 
      VALUES (?, ?, "patient", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")`,
      [user_name, hashedPassword, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num, blood_type]
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
      user: { user_id: user.user_id, user_name: user.user_name, email: user.email, role: user.role, fname:user.fname }
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
    await db.query(
      "UPDATE users SET user_name = ?, email = ?, contact_no = ?, gcash_num = ? WHERE user_id = ?",
      [user_name, email, contact_no, gcash_num, decoded.user_id]
    );

    return res.json({ message: "Profile updated successfully" });
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
    const { fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation } = req.body;

    const db = await connectToDatabase();
    await db.query(
      "UPDATE users SET fname = ?,  mname = ?, lname = ?, date_birth = ?, gender = ?, age = ?, religion = ?, nationality = ?, home_address = ?, city = ?, province = ?, occupation = ? WHERE user_id = ?",
      [fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, decoded.user_id]
    );

    return res.json({ message: "Profile updated successfully" });
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
  if (!currentPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT user_password FROM users WHERE user_id = ?", [decoded.user_id]);

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].user_password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET user_password = ? WHERE user_id = ?", [hashedNewPassword, decoded.user_id]);

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//for appointment (BOOKING AN APPOINTMENT)
// Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads")); // all files go to uploads/
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });

// For Appointments
const appointmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/appointments"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: appointmentStorage });

// const upload = multer({ storage });

// Fields configuration: downpayment + multiple photos
const cpUpload = upload.fields([
  { name: "downpayment_proof", maxCount: 1 },
  { name: "photos", maxCount: 10 }, // allow up to 10 uploaded photos
]);

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

    // --- Enforce business rule ---
    let downpaymentProofFile = null;
    if (procedure_type !== "Dentures") {
      // Force cash, ignore downpayment proof
      payment_method = "cash";
      downpaymentProofFile = null;
    } else {
      // Allow proof only for Dentures
      downpaymentProofFile = req.files.downpayment_proof
        ? req.files.downpayment_proof[0].filename
        : null;
    }

    // Required fields
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

    // Insert multiple uploaded photos (if any)
    if (req.files.photos) {
      for (const file of req.files.photos) {
        await db.query(
          `INSERT INTO uploadedphotos (up_url, appoint_id) VALUES (?, ?)`,
          [file.filename, appoint_id]
        );
      }
    }

    // --- NEW: Insert notification with expiry ---
    await db.query(
      `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
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
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
        VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [
          staff.user_id,
          "New Appointment Submitted",
          `Patient ${p_fname} ${p_lname} submitted an appointment for ${procedure_type} on ${pref_date} at ${pref_time}.`,
        ]
      );
    }

    return res.status(201).json({ message: "Appointment created successfully!" });
  } catch (err) {
    console.error("Create appointment error:", err);
    return res.status(500).json({ message: "Internal server error" });
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

  if (!user_name || !email ||!user_password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
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

    // Optional: check if admin has permission
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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

//for adminusers.jsx (DELETE USER)
router.delete("/deleteuserinfo/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔒 Only admin can delete users
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const db = await connectToDatabase();

    // Delete user
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// for adminuserpatient.jsx (ADD NEW PATIENT)
router.post('/addpatient', async (req, res) => {
  const { user_name, user_password, email, contact_no, gcash_num, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, province, city, occupation, blood_type } = req.body;

  if (!user_name || !email || !user_password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(user_password, 10);
    await db.query(
      `INSERT INTO users 
      (user_name, user_password, role, email, contact_no, gcash_num, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, province, city, occupation, blood_type) 
      VALUES (?, ?, "patient", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_name, hashedPassword, email, contact_no, gcash_num, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, province, city, occupation, blood_type]
    );

    return res.status(201).json({ message: "Patient created successfully" });
  } catch (err) {
    console.error("Add Patient error:", err);
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

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE role = 'patient'");

    return res.json(rows); 
  } catch (err) {
    console.error("Display users error:", err);
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

    if (decoded.role !== "admin") {
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

    if (decoded.role !== "admin") {
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

    if (decoded.role !== "admin") {
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
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method,
             downpayment_proof, attending_dentist, or_num, payment_status,
             total_charged, appointment_status, payment_confirmation,
             p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
             p_home_address, p_email, p_contact_no, p_blood_type
      FROM appointment
      WHERE appointment_status = 'done' and  payment_confirmation = 'Complete'
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
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT appoint_id, procedure_type, pref_date, pref_time, payment_method,
             downpayment_proof, attending_dentist, or_num, payment_status,
             total_charged, appointment_status, payment_confirmation,
             p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth,
             p_home_address, p_email, p_contact_no, p_blood_type
      FROM appointment
      WHERE appointment_status = 'done' and  payment_confirmation = 'incomplete' and payment_status = 'Partial'
      ORDER BY pref_date ASC
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

// Add charged item/service AND/OR update appointment billing totals + payment info
router.post(
  "/billing/:appointId",
  authenticateToken,
  upload.single("gcash_proof"),
  async (req, res) => {
    let db;
    try {
      db = await connectToDatabase();
      const { appointId } = req.params;

      const {
        inv_id,
        ci_item_name,
        ci_quantity,
        ci_amount,
        ci_type, // NEW: "item" or "service"
        payment_method,   // optional
        or_num,   // optional
        payment_status,   // optional
        total_service_charged, // optional (manual override)
        pwd_number,       // NEW
        hmo_number,
        billing_date 
      } = req.body;

      const gcashProof = req.file ? req.file.filename : null;

      // Start transaction
      await db.query("START TRANSACTION");

      let insertRes = null;

      // 🔹 CASE 1: Insert charged record (item OR service)
      if (ci_item_name && ci_amount != null) {
        const qty = Number(ci_quantity ?? 1);
        const amt = Number(ci_amount);

        if (Number.isNaN(qty) || Number.isNaN(amt)) {
          return res.status(400).json({ message: "Quantity and amount must be numbers" });
        }

        [insertRes] = await db.query(
          `INSERT INTO chargeditem 
            (inv_id, ci_item_name, ci_quantity, ci_amount, appoint_id, ci_status, ci_type)
          VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
          [inv_id || null, ci_item_name, qty, amt, appointId, ci_type || (inv_id ? "item" : "service")]
        );
      }

      // 🔹 Always compute totals
      const [sumRows] = await db.query(
        `SELECT COALESCE(SUM(ci_quantity * ci_amount), 0) AS items_total
         FROM chargeditem
         WHERE appoint_id = ?`,
        [appointId]
      );
      const itemsTotal = sumRows[0]?.items_total || 0;

      // Get current service charge (unless new one is provided)
      const [appRows] = await db.query(
        `SELECT COALESCE(total_service_charged, 0) AS svc
         FROM appointment
         WHERE appoint_id = ?`,
        [appointId]
      );
      const svc = total_service_charged != null ? Number(total_service_charged) : appRows[0]?.svc || 0;

      // Compute total_charged
      const total_charged = Number(itemsTotal) + Number(svc);

      // 🔹 Update appointment table (now also saving gcash_proof if uploaded)
      let updateQuery = `
        UPDATE appointment 
        SET total_charged = ?, total_service_charged = ?, appointment_status = 'incomplete'`;
      const updateParams = [total_charged, svc];

      if (payment_method != null) {
        updateQuery += `, payment_method = ?`;
        updateParams.push(payment_method);
      }
      if (payment_status != null) {
        updateQuery += `, payment_status = ?`;
        updateParams.push(payment_status);
      }
      if (gcashProof) {
        updateQuery += `, downpayment_proof = ?`;
        updateParams.push(gcashProof);
      }
      if (or_num != null) {
        updateQuery += `, or_num = ?`;
        updateParams.push(or_num);
      }

      if (pwd_number != null) {
        updateQuery += `, pwd_number = ?`;
        updateParams.push(pwd_number);
      }
      if (hmo_number != null) {
        updateQuery += `, hmo_number = ?`;
        updateParams.push(hmo_number);
      }

      if (billing_date != null) {
        updateQuery += `, billing_date = ?`;
        updateParams.push(billing_date);
      }

      updateQuery += ` WHERE appoint_id = ?`;
      updateParams.push(appointId);

      await db.query(updateQuery, updateParams);

      // Commit transaction
      await db.query("COMMIT");

      // Fetch updated appointment
      const [updatedAppRows] = await db.query(
        `SELECT payment_method, payment_status, total_service_charged, total_charged, 
                appointment_status, downpayment_proof, pwd_number, hmo_number, billing_date
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
        pwd_number: updatedAppRows[0]?.pwd_number ?? null,
        hmo_number: updatedAppRows[0]?.hmo_number ?? null,
        billing_date: updatedAppRows[0]?.billing_date ?? null
      });

    } catch (err) {
      try {
        if (db) await db.query("ROLLBACK");
      } catch (rbErr) {
        console.error("Rollback error:", rbErr);
      }
      console.error("Billing POST error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// (UPDATE PATIENT INFO)
router.put("/updatepatientinfo/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // only admins can update other patients
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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

    // Build the fields dynamically so password update is optional
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

    // If password is provided, hash and update it
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

    await db.query(sql, values);

    return res.json({ message: "Patient profile updated successfully" });
  } catch (err) {
    console.error("Update patient error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// Mark consultation as DONE or INCOMPLETE + save selected teeth
router.put("/completeconsultation/:appointId", async (req, res) => {
  const { appointId } = req.params;
  const { attending_dentist, p_diagnosis, appointment_status, payment_confirmation, selected_teeth } = req.body;

  // Validate status
  if (!["done", "incomplete"].includes(appointment_status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const db = await connectToDatabase();

    // 1) Update appointment info
    const [result] = await db.query(
      `
      UPDATE appointment 
      SET attending_dentist = ?, 
          p_diagnosis = ?, 
          appointment_status = ?, 
          payment_confirmation = ?,
          p_date_completed = NOW()
      WHERE appoint_id = ?
      `,
      [attending_dentist, p_diagnosis, appointment_status, payment_confirmation , appointId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // 2) If appointment is marked DONE
    if (appointment_status === "done") {
      // ✅ Flip charged items from pending → charged
      await db.query(
        `UPDATE chargeditem 
         SET ci_status = 'charged' 
         WHERE appoint_id = ? AND ci_status = 'pending'`,
        [appointId]
      );

      // ✅ Deduct inventory stock based on charged items
      await db.query(
        `UPDATE inventory i
         JOIN chargeditem c ON i.inv_id = c.inv_id
         SET i.inv_quantity = i.inv_quantity - c.ci_quantity
         WHERE c.appoint_id = ? AND c.ci_status = 'charged'`,
        [appointId]
      );

       // ✅ Send notification to patient
      await db.query(
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
        SELECT u.user_id, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
        FROM appointment a
        JOIN users u ON u.user_name = a.user_name
        WHERE a.appoint_id = ?`,
        [
          "Appointment Completed",
          `Your appointment (ID: ${appointId}) has been completed. Please check your records for details.`,
          appointId,
        ]
      );
    }

    // 3) Insert selected teeth (if any)
    if (Array.isArray(selected_teeth) && selected_teeth.length > 0) {
      const insertQuery = `
        INSERT INTO selectedteeth (appoint_id, st_number, st_name)
        VALUES (?, ?, ?)
      `;
      for (const tooth of selected_teeth) {
        await db.query(insertQuery, [appointId, tooth.st_number, tooth.st_name]);
      }
    }

    res.json({
      message: `Consultation marked as ${appointment_status}, items ${
        appointment_status === "done" ? "charged & inventory updated" : "left pending"
      }, teeth recorded if provided.`
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error while updating appointment." });
  }
});

router.post("/complete/:appoint_id", async (req, res) => {
  const { appoint_id } = req.params;
  const connection = await connectToDatabase(); 

  try {
    console.log("🔹 Starting payment completion for appointment:", appoint_id);
    
    await connection.beginTransaction();

    //  Get appointment
    const [appoint] = await connection.query(
      `SELECT total_charged, p_fname, p_mname, p_lname, procedure_type 
       FROM appointment 
       WHERE appoint_id = ?`,
      [appoint_id]
    );

    if (appoint.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Appointment not found." });
    }

     const { total_charged, p_fname, p_mname, p_lname, procedure_type } = appoint[0];
     const patient_name = `${p_fname} ${p_mname ? p_mname + " " : ""}${p_lname}`;

    //  Get accounts
    const [accounts] = await connection.query(
      "SELECT account_id, account_name FROM chartofaccounts WHERE account_name IN ('Cash', 'Service Income')"
    );

    const incomeAcc = accounts.find(
    (a) => a.account_name.trim().toLowerCase() === "service income"
    );

    const cashAcc = accounts.find(
      (a) => a.account_name.trim().toLowerCase() === "cash"
    );

    if (!cashAcc || !incomeAcc) {
      console.log("Missing Cash or Service Income account record");
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Cash or Service Income account not found." });
    }

    const date = new Date();
    const description = `Payment received from ${patient_name}`;
    const fullDescription = `${procedure_type} - ${patient_name}`;
    const subAccountId = 0; 

    // 3️⃣ Insert Journal Entries
    console.log("Inserting journal entries...");
    const [debitEntry] = await connection.query(
      `INSERT INTO journalentry (\`date\`, description, account_id, id, debit, credit, comment)
       VALUES (?, ?, ?, ?, ?, 0, 'Payment Received')`,
      [date, description, cashAcc.account_id, subAccountId, total_charged]
    );
    console.log(" Debit journal entry inserted:", debitEntry.insertId);

    const [creditEntry] = await connection.query(
      `INSERT INTO journalentry (\`date\`, description, account_id, id, debit, credit, comment)
       VALUES (?, ?, ?, ?, 0, ?, 'Service Income Recorded')`,
      [date, description, incomeAcc.account_id, subAccountId, total_charged]
    );
    console.log("Credit journal entry inserted:", creditEntry.insertId);

    // 4️⃣ Insert into General Ledger
    console.log("Inserting general ledger...");
    await connection.query(
      `INSERT INTO general_ledger (entry_id, account_id, debit, credit, description, \`date\`)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [debitEntry.insertId, cashAcc.account_id, total_charged, fullDescription , date]
    );

    await connection.query(
      `INSERT INTO general_ledger (entry_id, account_id, debit, credit, description, \`date\`)
       VALUES (?, ?, 0, ?, ?, ?)`,
      [creditEntry.insertId, incomeAcc.account_id, total_charged, fullDescription , date]
    );
    console.log(" General ledger entries inserted");

    // 5️⃣ Update appointment
    console.log(" Updating appointment...");
    await connection.query(
       "UPDATE appointment SET payment_confirmation = 'Complete', payment_status = 'Paid' WHERE appoint_id = ?",
      [appoint_id]
    );
    console.log("Appointment marked as Complete");

    await connection.commit();
    console.log(" Transaction committed successfully.");

    res.status(200).json({
      message: "Payment completed successfully.",
      appoint_id,
      patient_name,
      total_charged,
    });
  } catch (error) {
    await connection.rollback();
    console.error(" ERROR completing payment:", error.message);
    console.error("🔍 Full stack:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  } 
});

// 📌 For Refunds
const refundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/refunds"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const uploadRefund = multer({ storage: refundStorage });

// Patient's side Cancel Appointment
router.post(
  "/cancelappointment/:appointId",
  uploadRefund.single("refund_photo"),
  async (req, res) => {
    const db = await connectToDatabase();
    try {
      const { appointId } = req.params;
      const { cc_reason, cc_notes } = req.body;
      const refundPhoto = req.file ? req.file.filename : null;

      // Set appointment status
      let newStatus = "cancelled";
      if (cc_reason === "Refund request") {
        newStatus = "cancel with refund request";
      }

      // ✅ Update appointment table
      await db.query(
        `UPDATE appointment 
         SET appointment_status = ? 
         WHERE appoint_id = ?`,
        [newStatus, appointId]
      );

      // ✅ Only insert into "cancelled" table if NOT refund request
      if (cc_reason !== "Refund request") {
        await db.query(
          `INSERT INTO cancelled 
            (appoint_id, cc_reason, cc_notes, cc_date, cc_label, refund_photo)
           VALUES (?, ?, ?, NOW(), ?, ?)`,
          [appointId, cc_reason, cc_notes || null, newStatus, refundPhoto]
        );
      }

      // Insert notification for the user
      await db.query(
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
        SELECT u.user_id, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
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
            ? "Refund request sent successfully!"
            : "Appointment cancelled successfully!",
        refund_photo: refundPhoto,
      });
    } catch (error) {
      console.error("Cancel error:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  }
);

// Admin/receptionist completes refund cancellation
router.post("/processRefund/:appointId", upload.single("refund_photo"), async (req, res) => {
  const db = await connectToDatabase();
  try {
    const { appointId } = req.params;
    const { refund_method, cc_notes } = req.body;

    const refund_photo = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO cancelled 
        (appoint_id, cc_reason, cc_notes, cc_date, cc_label, refund_photo, refund_date, refund_method)
       VALUES (?, 'Refund', ?, NOW(), 'cancelled', ?, NOW(), ?)`,
      [appointId, cc_notes, refund_photo, refund_method]
    );

    await db.query(
      `UPDATE appointment 
       SET payment_status = 'cancelled', appointment_status = 'cancelled'  
       WHERE appoint_id = ?`,
      [appointId]
    );

    // Send notification to patient
    await db.query(
      `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
       SELECT u.user_id, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
       FROM appointment a
       JOIN users u ON u.user_name = a.user_name
       WHERE a.appoint_id = ?`,
      [
        "Appointment Cancelled by The Clinic",
        `Your appointment (ID: ${appointId}) has been cancelled by the clinic. Note: ${cc_notes || "No additional note."}`,
        appointId,
      ]
    );

    res.json({ message: "Refund processed and appointment cancelled." });
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
      (inv_item_type, inv_item_name, inv_price_per_item, inv_quantity, inv_ml, inv_exp_date, inv_status, inv_item_status, supplier_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [inv_item_type, inv_item_name, inv_price_per_item, inv_quantity || null, inv_ml || null, inv_exp_date || null, status, supplier_id]
    );

     // --- Send notification to all admins ---
    const [adminRows] = await db.query(
      `SELECT user_id FROM users WHERE role = 'admin'`
    );

    for (const admin of adminRows) {
      await db.query(
        `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
        VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [
          admin.user_id,
          "New Inventory Item Added",
          `A new inventory item "${inv_item_name}" has been added by staff and is pending approval.`,
        ]
      );
    }

    return res.status(201).json({ message: "Item created successfully" });
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
      inv_exp_date 
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
           inv_exp_date = ? 
       WHERE inv_id = ?`,
      [inv_item_name, inv_item_type, inv_quantity, inv_price_per_item, inv_ml, inv_exp_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json({ message: "Item updated successfully" });
  } catch (err) {
    console.error("Update item error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// (DELETE ITEM)
router.delete("/deleteitem/:id", async (req, res) => {
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

    const [result] = await db.query("DELETE FROM inventory WHERE inv_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete Item" });
  }
});

// for admininventoryedit.jsx (DISPLAY ITEM IN EDIT PAGE)
router.get("/displayitem/:id", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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
    const { id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      `UPDATE inventory 
       SET inv_item_status = 'active' 
       WHERE inv_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item approved successfully" });
  } catch (err) {
    console.error("Approve item error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Approve item
router.put("/inactiveitem/:id", async (req, res) => {
  try {
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
  const { supplier_name, contact_person,contact_no,description } = req.body;
  const db = await connectToDatabase();

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
      "INSERT INTO supplier (supplier_name, contact_person, contact_no, description) VALUES (?, ?, ?, ?)",
      [supplier_name, contact_person,contact_no,description ]
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
  const { id } = req.params;
  const { supplier_name, contact_person, contact_no, description } = req.body;
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
      "UPDATE supplier SET supplier_name = ?, contact_person = ?, contact_no = ?, description = ? WHERE supplier_id = ?",
      [supplier_name, contact_person, contact_no, description, id]
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

// delete supplier
router.delete("/suppliers/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;
    await db.query("DELETE FROM supplier WHERE supplier_id = ?", [id]);
    return res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("Delete supplier error:", err);
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
  const { account_name, account_type } = req.body;

  if (!account_name || !account_type) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const db = await connectToDatabase();

    // 1️⃣ Insert into chartofaccounts
    await db.query(
      "INSERT INTO chartofaccounts (account_name, account_type, status) VALUES (?, ?, ?)",
      [account_name, account_type, 'Active']
    );

    // 2️⃣ Get logged-in user info
    const user_name = req.user.user_name; // comes from your auth middleware
    const role = req.user.role;

    // 3️⃣ Insert into audit_trail
    const action = "Add COA";
    const description = `Added new COA: ${account_name} (${account_type})`;

    const created_at = new Date(); // current date and time
    await db.query(
      "INSERT INTO audittrail (user_name, role, at_action, at_description, created_at) VALUES (?, ?, ?, ?, ?)",
      [user_name, role, action, description, created_at]
    );

    return res.status(201).json({ message: "Account saved successfully!" });
  } catch (err) {
    console.error("COA insert error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update account by ID
router.put("/coa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { account_name, account_type, status } = req.body;

    const db = await connectToDatabase();

    // Update record
    const [result] = await db.query(
      "UPDATE chartofaccounts SET account_name = ?, account_type = ? , status = ?  WHERE account_id = ?",
      [account_name, account_type, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json({ message: "Account updated successfully" });
  } catch (err) {
    console.error("Update COA error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


//delete chart of accounts
router.delete("/coa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query("DELETE FROM chartofaccounts WHERE account_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete COA error:", err);
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
    ( "SELECT * FROM subaccount WHERE id = ?", 
      [id] ); 
      
      if (result.length === 0) 
        { return res.status(404).json({ message: "Account not found" }); 
      } 
      res.json(result[0]);
     } catch (err) { 
      console.error("Fetch COA error:", err);
       return res.status(500).json({ message: "Internal server error" }); } });

  //add new sub account ->admincoaviewadd
router.post("/coa/:id/subaccounts", async (req, res) => {
  const { id } = req.params; 
  const { account_name } = req.body;
  const db = await connectToDatabase();

  if (!account_name) {
    return res.status(400).json({ error: "Subaccount name is required" });
  }
  //if subacount already exists
  try {
    const [existing] = await db.query(
      "SELECT * FROM subaccount WHERE account_id = ? AND account_name = ?",
      [id, account_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Subaccount name already exists" });
    }

    // insert
    const [result] = await db.query(
      "INSERT INTO subaccount (account_id, account_name) VALUES (?, ?)",
      [id, account_name]
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


// edit subaccount ->admincoaviewedit
 router.put("/sub/:id", async (req, res) => {
  const { id } = req.params;
  const { account_name } = req.body;

  try {
    const db = await connectToDatabase();

    const [existing] = await db.query(
      "SELECT * FROM subaccount WHERE account_name = ? AND id != ?",
      [account_name, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Account name already exists" });
    }


    await db.query(
      "UPDATE subaccount SET account_name = ? WHERE id = ?",
      [account_name, id]
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

// ✅ DELETE a subaccount by ID
router.delete("/coa/sub/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const sql = "DELETE FROM subaccount WHERE id = ?";
    await db.query(sql, [id]);

    res.status(200).json({ message: "Subaccount deleted successfully!" });
  } catch (err) {
    console.error("Error deleting subaccount:", err);
    res.status(500).json({ message: "Failed to delete subaccount." });
  }
});
      
//=================================== JOURNAL ENTRY & GENERAL LEDGER ====================================

// get journal entry (for adminjournal)
router.get("/journal1", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT 
  j.date, 
  j.description, 
  CASE 
    WHEN sa.id IS NULL OR sa.id = 0 
      THEN ca.account_name
    ELSE CONCAT(ca.account_name, ' : ', sa.account_name)
  END AS Account,
  j.debit,
  j.credit,
  j.comment
FROM journalentry j
LEFT JOIN subaccount sa ON j.id = sa.id
LEFT JOIN chartofaccounts ca 
       ON (sa.account_id = ca.account_id OR j.account_id = ca.account_id);
    `);

    return res.json(rows);
  } catch (err) {
    console.error("Fetch journal entries error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new journal entry + insert general ledfer
router.post("/journal", async (req, res) => {
  const { date, description, account_id, subaccount_id, debit, credit, comment } = req.body;

  const debitAmount = parseFloat(debit) || 0;
  const creditAmount = parseFloat(credit) || 0;

  if (!date || !description || !account_id || (!debit && !credit)) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const db = await connectToDatabase();

    // 1️⃣ Insert into journalentry
    const [journalResult] = await db.query(
      "INSERT INTO journalentry (`date`, description, account_id, debit, credit, comment, id) VALUES (?,?,?,?,?,?,?)",
      [date, description, account_id, debitAmount, creditAmount, comment || "n/a", subaccount_id]
    );

    const entryId = journalResult.insertId;

    // 2️⃣ Get account type
    const [accountRows] = await db.query(
      "SELECT account_type FROM chartofaccounts WHERE account_id = ?",
      [account_id]
    );

    if (accountRows.length === 0) {
      return res.status(400).json({ message: "Account not found" });
    }

    const accountType = accountRows[0].account_type;

    // 3️⃣ Get last balance for this account
    const [lastBalanceRows] = await db.query(
      "SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY ledger_id DESC LIMIT 1",
      [account_id]
    );

    let lastBalance = lastBalanceRows.length ? parseFloat(lastBalanceRows[0].balance) : 0;

    // 4️⃣ Compute new balance
    let newBalance;
    if (accountType === "Asset" || accountType === "Expense") {
      newBalance = lastBalance + debitAmount - creditAmount;
    } else { // Liability, Equity, Revenue
      newBalance = lastBalance + creditAmount - debitAmount;
    }

    // 5️⃣ Insert into general_ledger
    await db.query(
      "INSERT INTO general_ledger (entry_id, account_id, description, debit, credit, balance, date) VALUES (?,?,?,?,?,?,?)",
      [entryId, account_id, description, debitAmount, creditAmount, newBalance, date]
    );

    return res.status(201).json({ message: "Journal entry and general ledger updated successfully!" });

  } catch (err) {
    console.error("Journal insert error:", err);
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



/// Insert into subsidiary+general+journal for account receivable
router.post("/subsidiary", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const {
      date,
      name,
      invoice_no,
      debit,
      credit,
      account_id,
    } = req.body;

    // Validate required fields
    if (!date || !name || !invoice_no || !account_id) {
      return res.status(400).json({
        error: "Missing required fields: date, name, invoice_no, account_id",
      });
    }

    // Split name
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return res.status(400).json({ error: "Please provide full name (first and last)" });
    }

    const fname = nameParts[0];
    const lname = nameParts[nameParts.length - 1];

    // Find the user_id from users table
    const [userRows] = await db.query(
      `SELECT user_id FROM users 
       WHERE LOWER(fname) = LOWER(?) 
         AND LOWER(lname) = LOWER(?) 
         AND LOWER(role) = 'patient'
       LIMIT 1`,
      [fname, lname]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Patient not found with the given name" });
    }

    const patient_id = userRows[0].user_id;

    // Parse debit/credit
    const debitVal = parseFloat(debit) || 0;
    const creditVal = parseFloat(credit) || 0;

    if (debitVal > 0 && creditVal > 0) {
      return res.status(400).json({
        error: "Only one of debit or credit should be provided.",
      });
    }

    // --- SUBSIDIARY LEDGER ---

    // Get last balance for this patient + account in subsidiary ledger
    const [subsidiaryRows] = await db.query(
      `SELECT balance
       FROM subsidiary
       WHERE account_id = ? AND patient_id = ?
       ORDER BY sub_id DESC
       LIMIT 1`,
      [account_id, patient_id]
    );

    const lastSubsidiaryBalance = subsidiaryRows.length > 0 ? parseFloat(subsidiaryRows[0].balance) || 0 : 0;
    const newSubsidiaryBalance = lastSubsidiaryBalance + debitVal - creditVal;

    // Insert into subsidiary ledger
    const [subsidiaryResult] = await db.query(
      `INSERT INTO subsidiary 
       (date, name, invoice_no, debit, credit, balance, account_id, patient_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, name, invoice_no, debitVal, creditVal, newSubsidiaryBalance, account_id, patient_id]
    );

    // --- JOURNAL ENTRY ---

    const description = name;

    // Insert main journal entry (for the provided account)
    const [journalResult] = await db.query(
      `INSERT INTO journalentry (date, description, account_id, debit, credit, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, description, account_id, debitVal, creditVal, 'n/a']
    );

    // --- GENERAL LEDGER ---

    // Get last balance for this account in general ledger
    const [ledgerRows] = await db.query(
      `SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY date DESC, ledger_id DESC LIMIT 1`,
      [account_id]
    );

    const lastLedgerBalance = ledgerRows.length > 0 ? parseFloat(ledgerRows[0].balance) || 0 : 0;
    const newLedgerBalance = lastLedgerBalance + debitVal - creditVal;

    // Insert into general ledger
    const [ledgerResult] = await db.query(
      `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, description, account_id, debitVal, creditVal, newLedgerBalance, journalResult.insertId]
    );

    // --- PARTNER ACCOUNT: Service Income ---
      let partnerAccountName = null;

      if (debitVal > 0) {
        // AR is debited -> partner is Sales Revenue (credited)
        partnerAccountName = 'Service Income';
      } else if (creditVal > 0) {
        // AR is credited -> partner is Cash (debited)
        partnerAccountName = 'Cash';
      }

      if (!partnerAccountName) {
        return res.status(400).json({ error: "Either debit or credit must be provided." });
      }

      // Find partner account_id dynamically
      const [partnerRows] = await db.query(
        `SELECT account_id FROM chartofaccounts 
        WHERE LOWER(account_name) = LOWER(?) 
        LIMIT 1`,
        [partnerAccountName]
      );

      if (partnerRows.length === 0) {
        return res.status(500).json({ error: `${partnerAccountName} account not found in chart of accounts` });
      }

      const partnerAccountId = partnerRows[0].account_id;

      // Partner debit/credit is the reverse of AR entry
      const partnerDebit = creditVal;  
      const partnerCredit = debitVal;  

      // Insert partner journal entry
      const [partnerJournalResult] = await db.query(
        `INSERT INTO journalentry (date, description, account_id, debit, credit, comment)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [date, description, partnerAccountId, partnerDebit, partnerCredit, 'Partner entry']
      );

      // Get last balance for partner account in general ledger
      const [partnerLedgerRows] = await db.query(
        `SELECT balance FROM general_ledger 
        WHERE account_id = ? 
        ORDER BY date DESC, ledger_id DESC 
        LIMIT 1`,
        [partnerAccountId]
      );

      const lastPartnerLedgerBalance = partnerLedgerRows.length > 0 ? parseFloat(partnerLedgerRows[0].balance) || 0 : 0;
      const newPartnerLedgerBalance = lastPartnerLedgerBalance + partnerDebit - partnerCredit;

      // Insert partner entry into general ledger
      await db.query(
        `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [date, description, partnerAccountId, partnerDebit, partnerCredit, newPartnerLedgerBalance, partnerJournalResult.insertId]
      );

    res.status(201).json({
      message: "Subsidiary, journal entry, general ledger, and partner entries inserted successfully.",
      subsidiaryId: subsidiaryResult.insertId,
      journalEntryId: journalResult.insertId,
      generalLedgerId: ledgerResult.insertId,
      partnerJournalEntryId: partnerJournalResult.insertId,
      patient_id,
      newSubsidiaryBalance,
      newLedgerBalance,
      newPartnerLedgerBalance,
    });

  } catch (err) {
    console.error("❌ Error inserting records:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});


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
        } = req.body;

          // Validate required fields
          if (!date || !name || !invoice_no || !account_id) {
            return res.status(400).json({
              error: "Missing required fields: date, name, invoice_no, account_id",
            });
          }

          // Split name
          const nameParts = name;

          // Find the user_id from suppliertable
          const [userRows] = await db.query(
            `SELECT supplier_id FROM supplier
            WHERE supplier_name = ?
            LIMIT 1`,
            [nameParts]
          );

          if (userRows.length === 0) {
            return res.status(404).json({ error: "Supplier not found with the given name" });
          }

        const supplier_id = userRows[0].supplier_id;

        //find expense_id

        const expense = expense_id;

         const [expenseRows] = await db.query(
            `SELECT account_name FROM chartofaccounts
            WHERE account_id = ?
            LIMIT 1`,
            [expense]
          );

          if (expenseRows.length === 0) {
            return res.status(404).json({ error: "account not found with the given name" });
          }

        const expensename = expenseRows[0].account_name;

        // Parse debit/credit
        const debitVal = parseFloat(debit) || 0;
        const creditVal = parseFloat(credit) || 0;

        if (debitVal > 0 && creditVal > 0) {
          return res.status(400).json({
            error: "Only one of debit or credit should be provided.",
          });
        }

        // --- SUBSIDIARY LEDGER ---

        // Get last balance for this supplier + account in subsidiary ledger
        const [subsidiaryRows] = await db.query(
          `SELECT balance
          FROM subsidiary
          WHERE account_id = ? AND patient_id = ?
          ORDER BY sub_id DESC
          LIMIT 1`,
          [account_id, supplier_id]
        );

        const lastSubsidiaryBalance = subsidiaryRows.length > 0 ? parseFloat(subsidiaryRows[0].balance) || 0 : 0;
        const newSubsidiaryBalance = lastSubsidiaryBalance - debitVal + creditVal;

        // Insert into subsidiary ledger
        const [subsidiaryResult] = await db.query(
          `INSERT INTO subsidiary 
            (date, name, invoice_no, debit, credit, balance, account_id, patient_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [date, `${name} - ${expensename}`, invoice_no, debitVal, creditVal, newSubsidiaryBalance, account_id, supplier_id, expensename]
        );

        // --- JOURNAL ENTRY ---

        const description = name;

    const [journalResult] = await db.query(
      `INSERT INTO journalentry (date, description, account_id, debit, credit, comment)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [date, description, account_id, debitVal, creditVal, expensename]
    );
        // --- GENERAL LEDGER ---

        // Get last balance for this account in general ledger
        const [ledgerRows] = await db.query(
          `SELECT balance FROM general_ledger WHERE account_id = ? ORDER BY date DESC, ledger_id DESC LIMIT 1`,
          [account_id]
        );

        const lastLedgerBalance = ledgerRows.length > 0 ? parseFloat(ledgerRows[0].balance) || 0 : 0;
        const newLedgerBalance = lastLedgerBalance - debitVal + creditVal;

        // Insert into general ledger
        const [ledgerResult] = await db.query(
          `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [date, `${description} - ${expensename}`, account_id, debitVal, creditVal, newLedgerBalance, journalResult.insertId]
        );

        //PARTNER ACCOUNT: Cash & Inventory==========

        let partnerAccountName = null;
        if (debitVal > 0) {

        // AR is debited -> partner is Sales Revenue (credited)
        partnerAccountName = 'Cash';
      } else if (creditVal > 0) {
        // AR is credited -> partner is Cash (debited)
        partnerAccountName = expensename;
      }

      if (!partnerAccountName) {
        return res.status(400).json({ error: "Either debit or credit must be provided." });
      }

      // Find partner account_id dynamically
      const [partnerRows] = await db.query(
        `SELECT account_id FROM chartofaccounts 
        WHERE LOWER(account_name) = LOWER(?) 
        LIMIT 1`,
        [partnerAccountName]
      );

      if (partnerRows.length === 0) {
      return res.status(500).json({ error: `${partnerAccountName} account not found in chart of accounts` });
      }

      const partnerAccountId = partnerRows[0].account_id;

      // Partner debit/credit is the reverse of AR entry
      const partnerDebit = creditVal;  
      const partnerCredit = debitVal;  

        // Insert partner journal entry
      const [partnerJournalResult] = await db.query(
        `INSERT INTO journalentry (date, description, account_id, debit, credit, comment)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [date, description, partnerAccountId, partnerDebit, partnerCredit, expensename]
      );

       // Get last balance for partner account in general ledger
      const [partnerLedgerRows] = await db.query(
        `SELECT balance FROM general_ledger 
        WHERE account_id = ? 
        ORDER BY date DESC, ledger_id DESC 
        LIMIT 1`,
        [partnerAccountId]
      );

      const lastPartnerLedgerBalance = partnerLedgerRows.length > 0 ? parseFloat(partnerLedgerRows[0].balance) || 0 : 0;
      const newPartnerLedgerBalance = lastPartnerLedgerBalance + partnerDebit - partnerCredit;

      // Insert partner entry into general ledger
      await db.query(
        `INSERT INTO general_ledger (date, description, account_id, debit, credit, balance, entry_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [date, description, partnerAccountId, partnerDebit, partnerCredit, newPartnerLedgerBalance, partnerJournalResult.insertId]
      );

        res.status(201).json({
          message: "Subsidiary, journal entry, and general ledger records inserted successfully.",
          subsidiaryId: subsidiaryResult.insertId,
          journalEntryId: journalResult.insertId,
          generalLedgerId: ledgerResult.insertId,
          supplier_id,
          newSubsidiaryBalance,
          newLedgerBalance,
        });

      } catch (err) {
        console.error("❌ Error inserting records:", err);
        res.status(500).json({ error: "Internal server error: " + err.message });
      }
    });


router.get("/subsidiary", async (req, res) => {
  try {
    const { account_id } = req.query;  // use req.query, not req.body for GET

    if (!account_id) {
      return res.status(400).json({ error: "Missing account_id query parameter" });
    }

    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT date, name, invoice_no, debit, credit, balance
       FROM subsidiary
       WHERE account_id = ?`,
      [account_id]  // pass as array
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
        const [rows] =  await db.query(`
            SELECT g.date, c.account_name AS account, c.account_type, g.debit, g.credit, g.balance
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

//Add consultation journal entry (auto insert Cash & Service Revenue dynamically)

//   router.post("/journalconsultation", async (req, res) => {
//   console.log("✅ journalconsultation route hit!");
//   try {
//     const { date, description, amount, comment } = req.body;

//     if (!date || !description || !amount) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const db = await connectToDatabase();

//     // Fetch Cash account ID
//     const [cashRows] = await db.query(
//       `SELECT account_id FROM chartofaccounts WHERE account_name = 'Cash' LIMIT 1`
//     );

//     // Fetch Service Income account ID
//     const [incomeRows] = await db.query(
//       `SELECT account_id FROM chartofaccounts WHERE account_name = 'Service Income' LIMIT 1`
//     );

//     if (!cashRows.length || !incomeRows.length) {
//       return res.status(400).json({ message: "Required accounts not found" });
//     }

//     const cashId = cashRows[0].account_id;
//     const incomeId = incomeRows[0].account_id;

//     // Insert Cash (Debit)
//     await db.query(
//       `INSERT INTO journalentry (date, account_id, description, debit, credit, comment)
//        VALUES (?, ?, ?, ?, 0, ?)`,
//       [date, cashId, description, amount, comment]
//     );

//     // Insert Service Income (Credit)
//     await db.query(
//       `INSERT INTO journalentry (date, account_id, description, debit, credit, comment)
//        VALUES (?, ?, ?, 0, ?, ?)`,
//       [date, incomeId, description, amount, comment]
//     );

//     res.json({ message: "Journal entry recorded successfully" });
//   } catch (err) {
//     console.error("Error inserting journal entry:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });


// // upload excel to journal entry
// router.post("/journal/upload", upload.single("file"), async (req, res) => {
//   try {
//     const workbook = xlsx.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     for (let row of rows) {
//       const accountField = row["Account"]?.trim();
//       let accountId = null;

//       if (accountField.includes("-")) {
//         // "Main - Sub"
//         const [mainName, subName] = accountField.split("-").map(s => s.trim());

//         const [mainAccount] = await db.query(
//           "SELECT id FROM chartofaccounts WHERE account_name = ?",
//           [mainName]
//         );

//         if (mainAccount.length > 0) {
//           const [subAccount] = await db.query(
//             "SELECT id FROM subaccount WHERE account_id = ? AND account_name = ?",
//             [mainAccount[0].id, subName]
//           );

//           if (subAccount.length > 0) {
//             accountId = subAccount[0].id;
//           } else {
//             console.warn(`⚠️ Subaccount '${subName}' not found under '${mainName}'`);
//           }
//         } else {
//           console.warn(`⚠️ Main account '${mainName}' not found`);
//         }
//       } else {
//         // only main account
//         const [mainAccount] = await db.query(
//           "SELECT id FROM chartofaccounts WHERE account_name = ?",
//           [accountField]
//         );
//         if (mainAccount.length > 0) {
//           accountId = mainAccount[0].id;
//         } else {
//           console.warn(`⚠️ Account '${accountField}' not found`);
//         }
//       }

//       if (!accountId) {
//         console.error(`❌ Could not resolve account: ${accountField}`);
//         continue; // skip this row
//       }

//       // ✅ Insert into journalentry
//       await db.query(
//         `INSERT INTO journalentry 
//          (date, description, account_id, debit, credit, comment) 
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           row["Date"],
//           row["Description"],
//           accountId,
//           row["Debit"] || 0,
//           row["Credit"] || 0,
//           row["Comment"] || null
//         ]
//       );
//     }

//     res.json({ success: true, message: "Journal entries uploaded successfully." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Upload failed. Please check your file format." });
//   }
// });

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

    // Get patient user_id from appointment
    const [rows] = await db.query(
      "SELECT u.user_id FROM appointment a JOIN users u ON a.user_name = u.user_name WHERE a.appoint_id = ?",
      [appointId]
    );

    if (!rows.length) return res.status(404).json({ message: "Appointment or patient not found" });

    const user_id = rows[0].user_id;

    // Insert notification
    await db.query(
      `INSERT INTO notifications (user_id, ntf_subject, ntf_description, ntf_created_at, ntf_expires_at)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [user_id, "Appointment Follow-up", message]
    );

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