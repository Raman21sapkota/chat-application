# Chat App

A real-time chat application built with Express, Socket.IO, and PostgreSQL.

## Features

- User registration and login with JWT authentication
- Friend request system (send, accept, reject)
- Real-time messaging via Socket.IO
- Edit and delete messages
- Typing indicators
- Online user tracking
- Offline message and friend request delivery
- Rate limiting on all endpoints

## Tech Stack

- Node.js
- Express
- Socket.IO
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt

## Setup

1. Clone the repository

```bash
git clone https://github.com/Raman21sapkota/chat-application.git
cd chat-application
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file

```env
PG_URL=postgresql://postgres:postgres@localhost:5432/chat_app
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

4. Create the database

Run the `schema.sql` file in your PostgreSQL tool:

```bash
psql -U postgres -f schema.sql
```

5. Start the server

```bash
npm start
```

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Yes | Search users by username (`?q=`) |
| GET | `/api/users/me` | Yes | Get your own profile |
| GET | `/api/users/:id` | Yes | Get a user by ID |

### Friends

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/friends` | Yes | List accepted friends |
| GET | `/api/friends/requests` | Yes | List pending incoming requests |
| POST | `/api/friends/request/:id` | Yes | Send friend request |
| POST | `/api/friends/accept/:id` | Yes | Accept friend request |
| POST | `/api/friends/reject/:id` | Yes | Reject friend request |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/:userId` | Yes | Get conversation history (friends only) |

## Socket.IO Events

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ token }` | Authenticate with JWT |
| `send_message` | `{ receiver_id, content }` | Send a message |
| `edit_message` | `{ message_id, content }` | Edit your message |
| `delete_message` | `{ message_id }` | Delete your message |

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticated` | `{ user_id }` | Auth successful |
| `new_message` | `{ id, sender_id, receiver_id, content, ... }` | New message received |
| `message_edited` | `{ id, content, is_edited, ... }` | Message was edited |
| `message_deleted` | `{ id }` | Message was deleted |
| `friend_request` | `{ requests: [...] }` | Pending friend requests (on auth) |
| `users_online` | `[user_id, ...]` | List of online users |
| `error` | `{ message }` | Error message |

## Rate Limiting

- Global: 100 requests per minute
- Auth routes: 10 requests per minute

## Project Structure

```
├── app.js                    # Express app setup
├── server.js                 # HTTP + Socket.IO server
├── database.js               # PostgreSQL pool
├── schema.sql                # Database schema
├── socket.js                 # Socket.IO event handlers
├── controllers/
│   ├── authController.js     # Register and login logic
│   ├── userController.js     # User search and profile
│   ├── friendController.js   # Friend request management
│   └── messageController.js  # Message history
├── routes/
│   ├── auth.js               # Auth routes
│   ├── users.js              # User routes
│   ├── friends.js            # Friend routes
│   └── messages.js           # Message routes
└── middleware/
    └── auth.js               # JWT verification middleware
```
