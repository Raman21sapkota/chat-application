import jwt from "jsonwebtoken";
import pool from "./database.js";

const userSockets = new Map();

const emitToUser = (io, userId, event, data) => {
  const sockets = userSockets.get(userId);
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit(event, data);
    }
  }
};

const broadcastOnlineUsers = (io) => {
  const online = Array.from(userSockets.keys());
  io.emit("users_online", online);
};

const deliverOfflineNotifications = async (userId, socket) => {
  try {
    const pending = await pool.query(
      `SELECT fr.id, fr.sender_id, fr.created_at,
              u.username, u.name
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_id
       WHERE fr.receiver_id = $1 AND fr.status = 'pending'`,
      [userId]
    );

    if (pending.rows.length > 0) {
      socket.emit("friend_request", { requests: pending.rows });
      console.log("Delivered", pending.rows.length, "pending requests to user", userId);
    }
  } catch (error) {
    console.error("Deliver offline notifications error:", error.message);
  }
};

const handleSocket = (io, socket) => {
  let currentUserId = null;

  socket.on("authenticate", (data) => {
    try {
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
      currentUserId = decoded.id;

      if (!userSockets.has(currentUserId)) {
        userSockets.set(currentUserId, new Set());
      }
      userSockets.get(currentUserId).add(socket.id);

      socket.emit("authenticated", { user_id: currentUserId });
      broadcastOnlineUsers(io);
      console.log("User", currentUserId, "authenticated on socket", socket.id);

      deliverOfflineNotifications(currentUserId, socket);
    } catch (error) {
      socket.emit("error", { message: "Invalid token" });
    }
  });

  socket.on("send_message", async (data) => {
    try {
      if (!currentUserId) {
        return socket.emit("error", { message: "Not authenticated" });
      }

      const { receiver_id, content } = data;

      if (!receiver_id || !content) {
        return socket.emit("error", { message: "receiver_id and content are required" });
      }

      const areFriends = await pool.query(
        `SELECT id FROM friend_requests
         WHERE ((sender_id = $1 AND receiver_id = $2)
             OR (sender_id = $2 AND receiver_id = $1))
           AND status = 'accepted'`,
        [currentUserId, receiver_id]
      );

      if (areFriends.rows.length === 0) {
        return socket.emit("error", { message: "You are not friends with this user" });
      }

      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, sender_id, receiver_id, content, is_edited, created_at`,
        [currentUserId, receiver_id, content]
      );

      const message = result.rows[0];
      emitToUser(io, receiver_id, "new_message", message);
      socket.emit("new_message", message);
      console.log("Message from", currentUserId, "to", receiver_id);
    } catch (error) {
      console.error("Send message error:", error.message);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("edit_message", async (data) => {
    try {
      if (!currentUserId) {
        return socket.emit("error", { message: "Not authenticated" });
      }

      const { message_id, content } = data;

      if (!message_id || !content) {
        return socket.emit("error", { message: "message_id and content are required" });
      }

      const result = await pool.query(
        `UPDATE messages
         SET content = $1, is_edited = true
         WHERE id = $2 AND sender_id = $3
         RETURNING id, sender_id, receiver_id, content, is_edited, created_at`,
        [content, message_id, currentUserId]
      );

      if (result.rows.length === 0) {
        return socket.emit("error", { message: "Message not found or not yours" });
      }

      const message = result.rows[0];
      emitToUser(io, message.receiver_id, "message_edited", message);
      socket.emit("message_edited", message);
      console.log("Message", message_id, "edited by", currentUserId);
    } catch (error) {
      console.error("Edit message error:", error.message);
      socket.emit("error", { message: "Failed to edit message" });
    }
  });

  socket.on("delete_message", async (data) => {
    try {
      if (!currentUserId) {
        return socket.emit("error", { message: "Not authenticated" });
      }

      const { message_id } = data;

      if (!message_id) {
        return socket.emit("error", { message: "message_id is required" });
      }

      const result = await pool.query(
        `DELETE FROM messages
         WHERE id = $1 AND sender_id = $2
         RETURNING id, sender_id, receiver_id`,
        [message_id, currentUserId]
      );

      if (result.rows.length === 0) {
        return socket.emit("error", { message: "Message not found or not yours" });
      }

      const deleted = result.rows[0];
      emitToUser(io, deleted.receiver_id, "message_deleted", { id: deleted.id });
      socket.emit("message_deleted", { id: deleted.id });
      console.log("Message", message_id, "deleted by", currentUserId);
    } catch (error) {
      console.error("Delete message error:", error.message);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    if (currentUserId) {
      const sockets = userSockets.get(currentUserId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(currentUserId);
        }
      }
      broadcastOnlineUsers(io);
      console.log("User", currentUserId, "disconnected");
    }
  });
};

export default handleSocket;
