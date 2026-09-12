# Notes Manager — Authenticated MERN Stack Application

A full-stack **Notes REST API** built with **Node.js**, **Express.js**, **MongoDB Atlas**, and **Mongoose**, featuring a complete **JWT + bcrypt authentication system**. Users can register, log in, manage their own notes, and log out — all through a premium dark-themed web interface.

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, and logout with secure JWT sessions
- 🔒 **Password Hashing** — bcrypt (cost factor 12) for all stored passwords
- 🎫 **JWT Authorization** — All note routes are protected with Bearer token verification
- 📝 **Full CRUD Notes** — Create, read, update, delete notes (scoped per user)
- 🔍 **Search & Filter** — Filter by category, search by title/content
- 🌐 **API Inspector** — Real-time JSON response viewer in the browser UI
- 🛡️ **Input Validation** — Server-side validation middleware for all operations

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Rest-Api-Mongo-DB.git
cd Rest-Api-Mongo-DB
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notesdb?retryWrites=true&w=majority

# Server Port
PORT=3000

# JWT Secret Key — use a long, random string in production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# JWT Token Expiry (e.g., 7d, 24h, 30m)
JWT_EXPIRES_IN=7d
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## 🔐 Authentication Flow

1. **Sign Up** — POST to `/api/auth/register` with `username`, `email`, `password`
2. **Log In** — POST to `/api/auth/login` with `email`, `password`
3. Server responds with a **JWT token** (valid for 7 days by default)
4. Token is stored in **`localStorage`** in the browser
5. All subsequent note API calls include `Authorization: Bearer <token>`
6. **Logout** clears the token and returns to the auth screen

---

## 📡 API Reference

### Auth Endpoints (Public)

| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| POST   | `/api/auth/register`  | Register a new user account         |
| POST   | `/api/auth/login`     | Authenticate and receive JWT        |
| GET    | `/api/auth/me`        | Get authenticated user's profile 🔒 |

**Register Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Successful Auth Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f...",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

### Notes Endpoints (🔒 Protected — Requires JWT)

All requests must include the header:
```
Authorization: Bearer <your_jwt_token>
```

| Method | Endpoint          | Description                     |
|--------|-------------------|---------------------------------|
| GET    | `/api/notes`      | Fetch all notes for current user |
| GET    | `/api/notes/:id`  | Fetch a single note by ID       |
| POST   | `/api/notes`      | Create a new note               |
| PUT    | `/api/notes/:id`  | Update an existing note         |
| DELETE | `/api/notes/:id`  | Delete a note                   |

**Query Parameters (GET /api/notes):**
- `?search=express` — Search by title or content
- `?category=Work` — Filter by category

**Create / Update Note Body:**
```json
{
  "title": "My Note Title",
  "content": "Note body text here...",
  "category": "Work",
  "tags": ["nodejs", "express"]
}
```

---

### Other Endpoints

| Method | Endpoint       | Description           |
|--------|----------------|-----------------------|
| GET    | `/api/health`  | Server health check   |

---

## 🔑 Security Notes

- Passwords are hashed with **bcrypt** (cost factor 12) before storage
- Password field uses `select: false` in Mongoose — never returned in API responses
- JWTs are signed with `HS256` using a secret stored in `.env`
- Token expiry errors return a descriptive `401` response prompting re-login
- Notes are **owner-scoped**: users can only read/edit/delete their own notes
- **`.env` is gitignored** — secrets are never committed to the repository

---

## 🗂 Project Structure

```
Rest-Api-Mongo-DB/
├── public/                 # Static frontend files
│   ├── index.html          # App shell + Auth modal
│   ├── styles.css          # Full styling + auth overlay
│   └── app.js              # Client JS: auth + notes logic
├── src/
│   ├── config/
│   │   └── db.js           # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   └── noteController.js   # CRUD (owner-scoped)
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect middleware
│   │   ├── errorHandler.js     # Global error handler
│   │   └── validateNote.js     # Note input validation
│   ├── models/
│   │   ├── User.js         # User schema (bcrypt, email)
│   │   └── Note.js         # Note schema (+ owner field)
│   ├── routes/
│   │   ├── authRoutes.js   # /api/auth/*
│   │   └── noteRoutes.js   # /api/notes/* (protected)
│   └── server.js           # Express app entry point
├── .env                    # ⚠️ Local only — never commit
├── .env.example            # ✅ Safe template to share
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testing with Postman / curl

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Create a note (use token from login):**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title":"My First Note","content":"Hello world","category":"Work","tags":["test"]}'
```

**Access notes without token (should return 401):**
```bash
curl http://localhost:3000/api/notes
```

---

## 🛠 Scripts

| Command       | Description                                |
|---------------|--------------------------------------------|
| `npm start`   | Start production server                    |
| `npm run dev` | Start development server with nodemon      |
| `npm test`    | Run API test suite                         |

---

## 📦 Dependencies

| Package      | Purpose                                  |
|--------------|------------------------------------------|
| express      | Web framework                            |
| mongoose     | MongoDB ODM                              |
| bcryptjs     | Password hashing (bcrypt algorithm)      |
| jsonwebtoken | JWT signing and verification             |
| cors         | Cross-origin resource sharing            |
| dotenv       | Environment variable loading             |

---

## 📄 License

MIT © Internship Developer
