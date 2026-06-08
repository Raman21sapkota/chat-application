import pool from "../database.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      const result = await pool.query(
        `SELECT id, username, name, created_at
         FROM users
         ORDER BY name`
      );
      return res.json({ users: result.rows });
    }

    const result = await pool.query(
      `SELECT id, username, name, created_at
       FROM users
       WHERE username ILIKE $1 OR name ILIKE $1
       ORDER BY name`,
      [`%${q}%`]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error("Search users error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, name, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get me error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, username, name, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
