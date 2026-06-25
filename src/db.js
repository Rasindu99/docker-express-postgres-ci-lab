import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD || "app_password",
  database: process.env.DB_NAME || "deployment_lab",
});

async function query(text, params) {
  return pool.query(text, params);
}

async function checkDbConnection() {
  const result = await pool.query("SELECT NOW() AS current_time");
  return result.rows[0];
}

export { query, checkDbConnection };
