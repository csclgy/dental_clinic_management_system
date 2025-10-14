import mysql from "mysql2/promise";

let connection;

export const connectToDatabase = async () => {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,  // Make sure this matches your Render env variable
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306, // Optional: include port
      });
      console.log("Connected to AWS RDS MySQL!");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  return connection;
};