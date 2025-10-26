import mysql from "mysql2/promise";

let connection;

export const connectToDatabase = async () => {
  try {
    if (!connection || connection.connection._closing) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      // Handle unexpected disconnections
      connection.on("error", async (err) => {
        if (err.code === "PROTOCOL_CONNECTION_LOST" || err.fatal) {
          console.error("⚠️ MySQL connection lost. Reconnecting...");
          connection = await connectToDatabase();
        } else {
          throw err;
        }
      });

      console.log("✅ Connected to MySQL database");
    }

    return connection;
  } catch (err) {
    console.error("❌ Error connecting to MySQL:", err);
    throw err;
  }
};
