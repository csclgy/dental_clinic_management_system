import express from 'express';
import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateToken } from "../middleware/authMiddleware.js";


dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// for register.jsx
router.post('/register', async (req, res) => {
  const { user_name, user_password, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num } = req.body;

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
      (user_name, user_password, role, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num) 
      VALUES (?, ?, "patient", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_name, hashedPassword, email, contact_no, fname, mname, lname, date_birth, gender, age, religion, nationality, home_address, city, province, occupation, gcash_num]
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// for login.jsx
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

//get  Chart of Accounts
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
//edit coa



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


// ============ GET CURRENT USER ============
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

// ============ UPDATE USER LOGIN INFO ============
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

// ============ UPDATE USER PERSONAL INFO ============
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

//Update User Password (Patient side)
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

// CREATE Appointment
router.post("/appointments", authenticateToken, async (req, res) => {
  const {
    procedure_type,
    pref_date,
    payment_method,
    downpayment_proof,
    attending_dentist,
    or_num,
    payment_status,
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

  if (!procedure_type || !pref_date || !p_fname || !p_lname) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const db = await connectToDatabase();

    await db.query(
    `INSERT INTO appointment 
    (user_name, procedure_type, pref_date, payment_method, downpayment_proof, attending_dentist, or_num, 
    payment_status, total_charged, appointment_status, 
    p_fname, p_mname, p_lname, p_gender, p_age, p_date_birth, 
    p_home_address, p_email, p_contact_no, p_blood_type) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.user_name,
      procedure_type,
      pref_date,
      payment_method,
      downpayment_proof || null,
      attending_dentist || null,
      or_num || null,
      payment_status || "pending",
      total_charged || null,
      appointment_status || "pending",
      p_fname,
      p_mname || null,
      p_lname,
      p_gender || null,
      p_age || null,
      p_date_birth || null,
      p_home_address || null,
      p_email || null,
      p_contact_no || null,
      p_blood_type || null,
    ]
  );


    return res.status(201).json({ message: "Appointment created successfully" });
  } catch (err) {
    console.error("Create appointment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
