import { connectToDatabase } from '../lib/db.js';

// 1️⃣ Create OR range (admin)
export const createOrRange = async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();

    const { start_or, end_or } = req.body;

    await db.query("UPDATE ORRangeSetup SET is_active = FALSE WHERE is_active = TRUE"); // deactivate previous
    await db.query(
      "INSERT INTO ORRangeSetup (start_or, end_or, current_or, is_active) VALUES (?, ?, ?, TRUE)",
      [start_or, end_or, start_or - 1]
    );

    res.json({ message: "OR range created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create OR range" });
  } finally {
    if (db) await db.end();
  }
};

// 2️⃣ Get active OR range
export const getActiveOrRange = async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();
    const [rows] = await db.query(`
      SELECT id, start_or, end_or, current_or, created_at
      FROM ORRangeSetup
      WHERE is_active = 1
      LIMIT 1
    `);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching active OR range:", err);
    res.status(500).json({ error: "Failed to fetch active range" });
  } finally {
    if (db) await db.end();
  }
};

export const generateNextOr = async (req, res) => {
  let db;
  try {
    db = await connectToDatabase();

    // Just return the next available OR without incrementing yet
    const [rangeRows] = await db.query(
      "SELECT * FROM ORRangeSetup WHERE is_active = TRUE LIMIT 1"
    );
    const range = rangeRows[0];
    if (!range) {
      return res.status(400).json({ error: "No active OR range found" });
    }

    const nextOr = range.current_or + 1;

    if (nextOr > range.end_or) {
      return res.status(400).json({ error: "OR range exhausted" });
    }

    res.json({ or_num: nextOr }); // ✅ only preview, don’t update
  } catch (err) {
    console.error("Error generating next OR:", err);
    res.status(500).json({ error: "Failed to generate OR number" });
  } finally {
    if (db) await db.end();
  }
};


// 4️⃣ Assign OR to appointment safely
export const assignOrToAppointment = async (req, res) => {
  let db;
  let transactionStarted = false;

  try {
    db = await connectToDatabase();
    await db.beginTransaction();
    transactionStarted = true;

    const { appoint_id } = req.body;

    // Lock the active OR range row
    const [rangeRows] = await db.query(
      "SELECT * FROM ORRangeSetup WHERE is_active = TRUE LIMIT 1 FOR UPDATE"
    );
    const range = rangeRows[0];
    if (!range) throw new Error("No active OR range found!");

    // Fetch all ORs already used in appointments
    const [usedOrRows] = await db.query(
      "SELECT or_num FROM appointment WHERE or_num BETWEEN ? AND ? ORDER BY or_num ASC",
      [range.start_or, range.end_or]
    );
    const usedSet = new Set(usedOrRows.map(r => r.or_num));

    // Find the first unused OR number
    let nextOr = null;
    for (let i = range.start_or; i <= range.end_or; i++) {
      if (!usedSet.has(i)) {
        nextOr = i;
        break;
      }
    }

    if (!nextOr) {
      await db.rollback();
      return res.status(400).json({ error: "All OR numbers are already used!" });
    }

    // Update current_or in OR range
    await db.query("UPDATE ORRangeSetup SET current_or = ? WHERE id = ?", [nextOr, range.id]);

    // Assign OR to appointment
    await db.query("UPDATE appointment SET or_num = ? WHERE appoint_id = ?", [nextOr, appoint_id]);

    await db.commit();
    res.json({ message: "OR assigned successfully", or_num: nextOr });

  } catch (err) {
    if (db && transactionStarted) await db.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to assign OR to appointment" });
  } finally {
    if (db) await db.end();
  }
};
