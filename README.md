# Chat

A real-time chat application with a React frontend, an Express API, WebSocket messaging, and PostgreSQL persistence.

## Live application

- **React client:** [https://chat-delta-lake-55.vercel.app](https://chat-delta-lake-55.vercel.app)
- **Server/API:** [https://chat-rdtu.onrender.com](https://chat-rdtu.onrender.com)
- **Server health check:** [https://chat-rdtu.onrender.com/health](https://chat-rdtu.onrender.com/health)

Caution: Render used to deploy the backend, is of free-tier, so it's not guranteed to be online all the time. In case it was shut down, it might take some time to restart it, so server side operations (logging in, conversations) won't be available while it's starting.

## Demo video
The video is meant to show three things:
- Logging in
- Real time updates to chat, chat-participants
- Admin privileges

The timestamps are described below
- 00:00 to 00:51 shows logging in mechanism
- 00:51 to 01:20 shows creating a group chat with 3 users
- 01:20 to 01:30 shows single exchange of text, demonstrating real time update to conversation.
- 01:30 to 01:45 shows the differences in options available of the admin of the chat and general participant
- 01:45 to 02:10 shows removing a participant, the participant-list being updated in real time
- 02:10 to 02:57 shows admin being switched to Bob and the chat permissions are updated real time, with Bob now getting the access to admin options, and hence renaming the chat.


[Watch the project demo](https://drive.google.com/file/d/1EODeiXeT2SB94xVFsd0Zf4uURlovsdUl/view?usp=sharing)

## Features

- User registration and login with JWT-based authentication.
- Password hashing with `bcrypt`.
- Authenticated user sessions with token validation and expiry handling.
- Direct messages and group chats.
- Real-time chat messages over WebSockets.
- Real-time updates to change in chat participants (for example when someone gets added or removed from group)
- Chat participant management.
- Group chat renaming and admin transfer.
- Chat and participant updates delivered to connected clients.
- PostgreSQL storage for users, chats, participants, and conversations.

## Technology stack

### Client

- React 19
- Vite
- React Router
- Axios
- React Toastify

### Server

- Node.js
- Express 5
- WebSocket (`ws`)
- PostgreSQL
- Sequelize
- JSON Web Tokens
- `bcrypt`

## Project structure

```text
.
├── client/                 # React/Vite frontend
│   └── src/
│       ├── components/     # Authentication, dashboard, and chat UI
│       ├── contexts/       # Application state and authentication context
│       └── services/       # HTTP and WebSocket clients
├── server/                 # Express API and WebSocket server
│   ├── auth/               # Registration and login
│   ├── database/           # PostgreSQL connection and Sequelize models
│   ├── middlewares/        # Authentication middleware
│   ├── routes/             # Contacts, users, and chat endpoints
│   └── websockets/         # WebSocket ticketing and message handling
├── schema.sql              # PostgreSQL schema initialization
├── Dockerfile              # Server container image
└── docker-compose.yml      # Local database, server, and client stack
```

## Database schema

The application uses PostgreSQL with four core data concepts:

- **Users** stores account credentials and profile details. Each user has a unique `userId`.
- **Chats** stores direct and group chat metadata, including the chat name, administrator, and conversation history.
- **ChatUserRelation** links users to chats and tracks membership, basically realizing many-many relationsship between user and chat. For direct messages, it is used to obtain chat-names for the participant (chat names are different for users in direct-messages, unlike group chat).

The initial schema is defined in [`schema.sql`](./schema.sql) and is loaded automatically when the database is first created through Docker Compose.

## Run locally with Docker Compose

### Requirements

- Docker and Docker Compose

### Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Set `DB_PASSWORD` and `JWT_SIGN_KEY` in `.env`.

3. Start the application:

   ```bash
   docker compose up --build
   ```

4. Open the client at [http://localhost:8080](http://localhost:8080).

The API is available at [http://localhost:3000](http://localhost:3000), and its health endpoint is [http://localhost:3000/health](http://localhost:3000/health).

To stop the stack:

```bash
docker compose down
```

To stop it and remove the database volume:

```bash
docker compose down -v
```

## Run locally without Docker

### Requirements

- Node.js 22 or later
- PostgreSQL

### Server

1. Create a PostgreSQL database and apply [`schema.sql`](./schema.sql).
2. Copy [`server/.env.example`](./server/.env.example) to `server/.env`.
3. Set the database and JWT values in `server/.env`.
4. Install dependencies and start the server:

   ```bash
   cd server
   npm install
   npm start
   ```

The server listens on port `3000` by default.

### Client

In another terminal:

```bash
cd client
npm install
```

Create `client/.env.development` with:

```env
VITE_BACKEND_BASE_URL=http://localhost:3000
```

Start the Vite development server:

```bash
npm run dev
```

The client is normally available at [http://localhost:5173](http://localhost:5173).

## Environment variables

### Server

| Variable | Description |
| --- | --- |
| `DB_NAME` | PostgreSQL database name. |
| `DB_USER` | PostgreSQL user. |
| `DB_PASSWORD` | PostgreSQL password. |
| `DB_HOST` | PostgreSQL host when using local or Docker configuration. |
| `DB_PORT` | PostgreSQL port. |
| `DATABASE_URL` | Optional PostgreSQL connection string; enables connection-string mode with SSL. |
| `JWT_SIGN_KEY` | Secret used to sign authentication tokens. |
| `SALT_ROUNDS` | Optional bcrypt cost factor; defaults to `10`. |
| `CLIENT_ORIGIN` | Comma-separated list of allowed client origins for CORS. |
| `PORT` | Server port; defaults to `3000`. |

### Client

| Variable | Description |
| --- | --- |
| `VITE_BACKEND_BASE_URL` | Base URL used for API requests and WebSocket connections. |

Never commit `.env` files or real credentials. Use the example files as templates.

## API overview

Public endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /health`

Authenticated endpoints are under `/api`:

- `GET /api/userInfo`
- `GET /api/contacts`
- `GET /api/chats`
- `GET /api/chats/:chatId`
- `POST /api/chats`
- `GET /api/chats/:chatId/participants`
- `POST /api/chats/:chatId/participants`
- `DELETE /api/chats/:chatId/participants`
- `POST /api/chats/:chatId/admin/:newAdminId`
- `PUT /api/chats/:chatId/rename`

The client obtains a short-lived WebSocket ticket through the authenticated WebSocket route before connecting to the server's `/ws` endpoint.

## Available scripts

From `client/`:

```bash
npm run dev       # Start the Vite development server
npm run build     # Build the production client
```

From `server/`:

```bash
npm start         # Start the server
npm run dev       # Start the server in development mode
```

## Future additions and enhancements

### Product and application

- Add message editing, deletion, replies, reactions, and attachments.
- Add unread counts, read receipts, typing indicators, and message delivery status.
- Order chat list by the last message recieved.
- Add search across users, chats, and message history.
- Add pagination or virtualized rendering for long conversations.
- Add pagination for list of users.
- Add notifications and user-configurable notification preferences.
- Add profile editing, avatars, presence, and last-seen status.
- Add message and chat export tools.
- Add preferences setting option, where user can selectively block or mute conversations.

### Engineering and development practices

- Add a shared API contract and typed request/response models between client and server.
- Add unit, integration, and end-to-end coverage for authentication, permissions, chat management, and WebSockets.
- Add CI checks for linting, builds, tests, dependency audits, and migrations.
- Add structured server logging, request IDs, metrics, and error monitoring.
- Fix predefined types of errors and handle accordingly.
- Add database migrations and a documented seed-data workflow instead of relying only on the initial schema dump.
