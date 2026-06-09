import pool from "../database.js";

export const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const areFriends = await pool.query(
      `SELECT id FROM friend_requests
       WHERE ((sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1))
         AND status = 'accepted'`,
      [userId, otherUserId]
    );

    if (areFriends.rows.length === 0) {
      return res.status(403).json({ error: "You are not friends with this user" });
    }

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, content, is_edited, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId, otherUserId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error("Get conversation error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
