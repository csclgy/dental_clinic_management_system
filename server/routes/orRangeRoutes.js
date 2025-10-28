import express from "express";
import {
  createOrRange,
  getActiveOrRange,
  generateNextOr,
  assignOrToAppointment,
} from "../controllers/orRangeController.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

// ✅ Fetch all OR ranges
router.get("/", async (req, res) => {
  console.log("✅ GET /api/or-range hit");

  let db;
  try {
    db = await connectToDatabase();

    const [rows] = await db.query(`
      SELECT 
        id,
        start_or,
        end_or,
        current_or,
        CASE 
          WHEN is_active = 1 THEN 'Active'
          ELSE 'Inactive'
        END AS status,
        created_at
      FROM ORRangeSetup
      ORDER BY id DESC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("Error fetching OR ranges:", err);
    return res.status(500).json({ error: "Failed to fetch OR ranges" });
  } finally {
    if (db) await db.end();
  }
});

// ✅ Activate a range
router.put("/:id/activate", async (req, res) => {
  let db;
  const { id } = req.params;

  try {
    db = await connectToDatabase();

    // Deactivate all ranges first
    await db.query("UPDATE ORRangeSetup SET is_active = 0");

    // Activate selected one
    await db.query("UPDATE ORRangeSetup SET is_active = 1 WHERE id = ?", [id]);

    res.json({ message: "Range activated successfully!" });
  } catch (err) {
    console.error("Error activating range:", err);
    res.status(500).json({ error: "Failed to activate range" });
  } finally {
    if (db) await db.end();
  }
});

// ✅ Deactivate a range
router.put("/:id/deactivate", async (req, res) => {
  let db;
  const { id } = req.params;

  try {
    db = await connectToDatabase();

    await db.query("UPDATE ORRangeSetup SET is_active = 0 WHERE id = ?", [id]);

    res.json({ message: "Range deactivated successfully!" });
  } catch (err) {
    console.error("Error deactivating range:", err);
    res.status(500).json({ error: "Failed to deactivate range" });
  } finally {
    if (db) await db.end();
  }
});

// ✅ Existing routes
router.get("/active", getActiveOrRange);
router.post("/", createOrRange);
router.post("/generate", generateNextOr);
router.post("/assign", assignOrToAppointment);

export default router;
