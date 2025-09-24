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
      (user_name, user_password, role, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num, blood_type) 
      VALUES (?, ?, "patient", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    const [rows] = await db.query("SELECT user_id, user_name, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num FROM users WHERE user_id = ?", [decoded.user_id]);
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

    const {
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
        req.files.downpayment_proof ? req.files.downpayment_proof[0].filename : null,
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

    const [photos] = await db.query(
      "SELECT * FROM uploadedphotos WHERE appoint_id = ?",
      [appointId]
    );

    res.json({ consultation, chargedItems, selectedTeeth, photos});
  } catch (err) {
    console.error("Display consultation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//=============================================== ADMIN BACKEND ROUTES =============================================== 

//################################ USERS MANAGEMENT ################################
// for adminuseradd.jsx (ADD NEW USER)
router.post('/adduser', async (req, res) => {
  const { user_name, user_password, role, email, contact_no, fname, mname, lname } = req.body;

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
      (user_name, user_password, role, email, contact_no, fname, mname, lname) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_name, hashedPassword, role, email, contact_no, fname, mname, lname]
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
          lname = ?
      WHERE user_id = ?
    `;

    const params = hashedPassword
      ? [user_name, hashedPassword, role, email, contact_no, fname, mname, lname, userId]
      : [user_name, role, email, contact_no, fname, mname, lname, userId];

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
      "SELECT user_id, user_name, role, email, contact_no, fname, mname, lname FROM users WHERE user_id = ?",
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
      "SELECT user_id, user_name, role, email, contact_no, fname, mname, lname FROM users"
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
              date_birth, gender, age, religion, nationality, home_address, city, blood_type 
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
 const [photos] = await db.query(
      "SELECT * FROM uploadedphotos WHERE appoint_id = ?",
      [appointId]
    );
    res.json({ consultation, chargedItems, selectedTeeth, photos });
  } catch (err) {
    console.error("Display consultation error:", err);
    res.status(500).json({ message: "Server error" });
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
        ci_amount 
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
        total_charged
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

// Add charged item AND/OR update appointment billing totals + payment info
router.post("/billing/:appointId", authenticateToken, async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const { appointId } = req.params;

    const {
      inv_id,
      ci_item_name,
      ci_quantity,
      ci_amount,
      payment_method,   // optional
      payment_status,   // optional
      total_service_charged // optional
    } = req.body;

    // Start transaction
    await db.query("START TRANSACTION");

    let insertRes = null;

    // 🔹 CASE 1: Insert charged item if item fields are present
    if (inv_id != null && ci_item_name && ci_quantity != null && ci_amount != null) {
      const qty = Number(ci_quantity);
      const amt = Number(ci_amount);

      if (Number.isNaN(qty) || Number.isNaN(amt)) {
        return res.status(400).json({ message: "Quantity and amount must be numbers" });
      }

      [insertRes] = await db.query(
        `INSERT INTO chargeditem (inv_id, ci_item_name, ci_quantity, ci_amount, appoint_id)
         VALUES (?, ?, ?, ?, ?)`,
        [inv_id, ci_item_name, qty, amt, appointId]
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

    // 🔹 Update appointment table (include appoint_status = 'done')
    let updateQuery = `UPDATE appointment SET total_charged = ?, total_service_charged = ?, appointment_status = 'incomplete'`;
    const updateParams = [total_charged, svc];

    if (payment_method != null) {
      updateQuery += `, payment_method = ?`;
      updateParams.push(payment_method);
    }
    if (payment_status != null) {
      updateQuery += `, payment_status = ?`;
      updateParams.push(payment_status);
    }

    updateQuery += ` WHERE appoint_id = ?`;
    updateParams.push(appointId);

    await db.query(updateQuery, updateParams);

    // Commit transaction
    await db.query("COMMIT");

    // Fetch updated appointment
    const [updatedAppRows] = await db.query(
      `SELECT payment_method, payment_status, total_service_charged, total_charged, appointment_status
       FROM appointment
       WHERE appoint_id = ?`,
      [appointId]
    );

    res.status(insertRes ? 201 : 200).json({
      message: insertRes ? "Charged item added + billing updated" : "Billing updated",
      ci_id: insertRes?.insertId ?? null,
      appoint_id: appointId,
      items_total: itemsTotal,
      total_service_charged: updatedAppRows[0]?.total_service_charged ?? svc,
      total_charged: updatedAppRows[0]?.total_charged ?? total_charged,
      payment_method: updatedAppRows[0]?.payment_method ?? null,
      payment_status: updatedAppRows[0]?.payment_status ?? null,
      appointment_status: updatedAppRows[0]?.appointment_status ?? "done"
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
});

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
    } = req.body;

    const db = await connectToDatabase();
    await db.query(
      `UPDATE users 
       SET email = ?, contact_no = ?, fname = ?, mname = ?, lname = ?, 
           date_birth = ?, gender = ?, age = ?, home_address = ?, city = ? 
       WHERE user_id = ? AND role = 'patient'`,
      [email, contact_no, fname, mname, lname, date_birth, gender, age, home_address, city, id]
    );

    return res.json({ message: "Patient profile updated successfully" });
  } catch (err) {
    console.error("Update patient error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Mark consultation as DONE or INCOMPLETE + save selected teeth
router.put("/completeconsultation/:appointId", async (req, res) => {
  const { appointId } = req.params;
  const { attending_dentist, p_diagnosis, appointment_status, selected_teeth } = req.body;

  // Validate status
  if (!["done", "incomplete"].includes(appointment_status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const db = await connectToDatabase();

    // Update appointment
    const query = `
      UPDATE appointment 
      SET attending_dentist = ?, 
          p_diagnosis = ?, 
          appointment_status = ?, 
          p_date_completed = NOW()
      WHERE appoint_id = ?
    `;

    const [result] = await db.query(query, [
      attending_dentist,
      p_diagnosis,
      appointment_status,
      appointId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Insert selected teeth if provided
    if (Array.isArray(selected_teeth) && selected_teeth.length > 0) {
      const insertQuery = `
        INSERT INTO selectedteeth (appoint_id, st_number, st_name)
        VALUES (?, ?, ?)
      `;

      for (const tooth of selected_teeth) {
        await db.query(insertQuery, [appointId, tooth.st_number, tooth.st_name]);
      }
    }

    res.json({ message: `Consultation marked as ${appointment_status} and teeth recorded.` });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error while updating appointment." });
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

//patient's side Cancel Appointment
router.post("/cancelappointment/:appointId", async (req, res) => {
  const db = await connectToDatabase();
  try {
    const { appointId } = req.params;
    const { cc_reason} = req.body;

    if (cc_reason === "Refund request") {
      await db.query(
        `UPDATE appointment 
         SET appointment_status = 'cancel with refund request' 
         WHERE appoint_id = ?`,
        [appointId]
      );
      return res.json({ message: "Refund request sent successfully!" });
    }

    res.json({ message: "Appointment cancelled successfully!" });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
});

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

    res.json({ message: "Refund processed and appointment cancelled." });
  } catch (error) {
    console.error("Refund process error:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
});

// Example in Express route
router.get("/viewmyconsultation/:appointId", async (req, res) => {
  try {
    const appointId = req.params.appointId;

    const [consultation] = await db.query(
      "SELECT * FROM appointment WHERE appoint_id = ?",
      [appointId]
    );

    const [photos] = await db.query(
      "SELECT * FROM uploadedphotos WHERE appoint_id = ?",
      [appointId]
    );

    res.json({
      consultation: consultation[0],
      chargedItems: [], // keep your old logic
      selectedTeeth: [], // keep your old logic
      photos: photos,    // ✅ send photos to frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load consultation" });
  }
});


//################################ INVENTORY MANAGEMENT ################################
// for admininventoryadd.jsx (ADD NEW ITEM)
router.post('/additem', async (req, res) => {
  const { inv_item_type, inv_item_name, inv_price_per_item, inv_quantity, inv_ml, inv_exp_date } = req.body;

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
      (inv_item_type, inv_item_name, inv_price_per_item, inv_quantity, inv_ml, inv_exp_date, inv_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [inv_item_type, inv_item_name, inv_price_per_item, inv_quantity || null, inv_ml || null, inv_exp_date || null, status]
    );

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

// for admininventory.jsx (DISPLAY ALL ITEMS IN TABLE)
router.get('/inventory', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (err) {
    console.error("Fetch inventory error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//################################ LEDGER MANAGEMENT ################################

//********************* CHARTS OF ACCOUNT ********************* 
// Add a new Chart of Account
router.post("/coa", async (req, res) => {
  const { account_name, account_type } = req.body;

  if (!account_name || !account_type) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const db = await connectToDatabase();
    await db.query(
      "INSERT INTO chartofaccounts (account_name, account_type) VALUES (?, ?)",
      [account_name, account_type]
    );

    return res.status(201).json({ message: "Account saved successfully!" });
  } catch (err) {
    console.error("COA insert error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get Chart of Accounts
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

// Update account by ID
router.put("/coa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { account_name, account_type } = req.body;

    const db = await connectToDatabase();

    // Update record
    const [result] = await db.query(
      "UPDATE chartofaccounts SET account_name = ?, account_type = ? WHERE account_id = ?",
      [account_name, account_type, id]
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


//********************* JOURNAL ENTRIES ********************* 
 // Add a new journal enrty
router.post("/journal", async (req, res) => {
  const { date, description, accounts, debit, credit, comment } = req.body;

  // Validation
  if (!date || !description || !accounts || (!debit && !credit)) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const db = await connectToDatabase();
    await db.query(
      "INSERT INTO journalentry (`date`, description, accounts, debit, credit, comment) VALUES (?,?,?,?,?,?)",
      [date, description, accounts, debit || 0, credit || 0, comment || ""]
    );

    return res.status(201).json({ message: "Journal entry saved successfully!" });
  } catch (err) {
    console.error("Journal insert error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get journal entry(foradminjournal)
router.get("/journal1", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM journalentry ORDER BY date DESC");
    return res.json(rows); 
  } catch (err) {
    console.error("Fetch journal entries error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
