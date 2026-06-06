import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.PG_URL,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

export default pool;
