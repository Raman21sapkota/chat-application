import pool from "../database.js";

export const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.id);

    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    const receiver = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [receiverId]
    );
    if (receiver.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await pool.query(
      `SELECT id, status FROM friend_requests
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      const req = existing.rows[0];
      if (req.status === "accepted") {
        return res.status(409).json({ error: "Already friends" });
      }
      return res.status(409).json({ error: "Friend request already exists" });
    }

    const result = await pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, sender_id, receiver_id, status, created_at`,
      [senderId, receiverId]
    );

    console.log("Friend request sent from", senderId, "to", receiverId);
    res.status(201).json({ request: result.rows[0] });
  } catch (error) {
    console.error("Send friend request error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, status
       FROM friend_requests
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    await pool.query(
      `UPDATE friend_requests
       SET status = 'accepted', updated_at = NOW()
       WHERE id = $1`,
      [requestId]
    );

    console.log("Friend request", requestId, "accepted");
    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend request error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, status
       FROM friend_requests
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    await pool.query(
      `UPDATE friend_requests
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1`,
      [requestId]
    );

    console.log("Friend request", requestId, "rejected");
    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Reject friend request error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = CASE WHEN fr.sender_id = $1 THEN fr.receiver_id ELSE fr.sender_id END
       WHERE (fr.sender_id = $1 OR fr.receiver_id = $1)
         AND fr.status = 'accepted'
       ORDER BY u.name`,
      [userId]
    );

    res.json({ friends: result.rows });
  } catch (error) {
    console.error("List friends error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at,
              u.username, u.name
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_id
       WHERE fr.receiver_id = $1 AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [userId]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error("List requests error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
