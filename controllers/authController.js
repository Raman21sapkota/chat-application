import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database.js";

export const register = async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
      return res.status(400).json({ error: "username, name, and password are required" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, name, created_at`,
      [username, name, password_hash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("User registered:", user.username);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const result = await pool.query(
      `SELECT id, username, name, password_hash, created_at
       FROM users
       WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn("Failed login attempt for", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("User logged in:", user.username);
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, created_at: user.created_at } });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
