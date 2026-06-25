import express from "express";
import dotenv from "dotenv";

import { checkDbConnection, query } from "./db.js";

const app = express();

app.use(express.json());

const APP_VERSION = process.env.APP_VERSION || "unknown";
const NODE_ENV = process.env.NODE_ENV || "development";

app.get("/", (req, res) => {
  res.json({
    message: "Deployment Lab API is running",
    environment: NODE_ENV,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/db-health", async (req, res) => {
  try {
    const dbStatus = await checkDbConnection();

    res.status(200).json({
      status: "database healthy",
      databaseTime: dbStatus.current_time,
    });
  } catch (error) {
    res.status(500).json({
      status: "database unhealthy",
      error: error.message,
    });
  }
});

app.get("/version", (req, res) => {
  res.json({
    version: APP_VERSION,
  });
});

app.get("/users", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, email, created_at FROM users ORDER BY id ASC",
    );

    res.json({
      count: result.rowCount,
      users: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "name and email are required",
      });
    }

    const result = await query(
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       RETURNING id, name, email, created_at`,
      [name, email],
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

export default app;
