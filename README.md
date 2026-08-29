# ⚡ Notes REST API — Node.js, Express.js & MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square&logo=mongoose)](https://mongoosejs.com/)
[![REST API](https://img.shields.io/badge/REST-CRUD-blue?style=flat-square)](https://restfulapi.net/)
[![Postman Tested](https://img.shields.io/badge/Postman-Collection_Included-FF6C37?style=flat-square&logo=postman)](https://www.postman.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A production-ready, modular **RESTful Notes API** built with **Node.js**, **Express.js**, and **MongoDB Atlas** (via **Mongoose** ODM). Features full CRUD operations with persistent database storage, input validation middleware, standardized HTTP status codes, structured error handling, an interactive browser dashboard, and a pre-configured Postman Collection.

> **Week 4 Upgrade**: Migrated from in-memory data storage to a persistent **MongoDB Atlas** database using **Mongoose** schemas and models.

---

## 🌟 Features & Highlights

- 💾 **MongoDB Atlas Integration**: Persistent data storage using a cloud-hosted NoSQL database.
- 🧬 **Mongoose ODM**: Schema-based data modeling with built-in validation and type casting.
- 📝 **Full CRUD Operations**: Complete `GET`, `POST`, `PUT`, and `DELETE` endpoints for managing notes.
- 🧱 **Modular Architecture**: Separate files for config, models, routes, controllers, and middleware.
- 🛡️ **Input Validation**: Validates required note fields (rejects empty or whitespace-only titles with `400 Bad Request`).
- 🚥 **Standard HTTP Status Codes**: Returns accurate status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Server Error`).
- 🔐 **Environment Variables**: Database credentials stored securely in `.env` (never pushed to GitHub).
- 💻 **Interactive Live Studio**: Includes an embedded dark-mode dashboard served at `http://localhost:3000` with a real-time HTTP Network Inspector.
- 🚀 **Postman Collection**: Includes `postman_collection.json` ready to import into Postman for instant endpoint testing.
- 🧪 **Automated Test Suite**: Comes with programmatic verification tests (`npm test`).

---

## 📁 Directory Architecture

```
rest-api-mongodb/
├── package.json               # Node.js dependencies & npm scripts
├── .env.example               # Template for environment variables (safe to commit)
├── .env                       # Actual credentials (NOT committed — in .gitignore)
├── .gitignore                 # Standard git ignores including .env
├── postman_collection.json    # Postman v2.1 importable test collection
├── README.md                  # API documentation & setup guide
├── src/
│   ├── server.js              # Express app entry point & server setup
│   ├── config/
│   │   └── db.js              # MongoDB connection via Mongoose
│   ├── models/
│   │   └── Note.js            # Mongoose schema & model for notes
│   ├── routes/
│   │   └── noteRoutes.js      # Express router for /api/notes
│   ├── controllers/
│   │   └── noteController.js  # CRUD controller with Mongoose queries
│   └── middleware/
│       ├── validateNote.js    # Input validation middleware
│       └── errorHandler.js    # Centralized 404, 500 & Mongoose error handlers
├── public/                    # Interactive Browser Dashboard
│   ├── index.html             # Dashboard UI
│   ├── styles.css             # Clean light-mode CSS
│   └── app.js                 # Client JS & live network inspector
└── test/
    └── api.test.js            # Automated HTTP endpoint test script
```

---

## 🔌 REST API Endpoints Overview

| Method | Endpoint | Description | Request Body | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service & database status check | None | `200 OK` |
| `GET` | `/api/notes` | Get all notes (supports `?search=` & `?category=`) | None | `200 OK` |
| `GET` | `/api/notes/:id` | Get a single note by MongoDB ObjectId | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/notes` | Create a new note | `{ title, content?, category?, tags? }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/notes/:id` | Update an existing note | `{ title?, content?, category?, tags? }` | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/notes/:id` | Remove a note by ObjectId | None | `200 OK` / `404 Not Found` |

> **Note**: The `:id` parameter accepts a MongoDB ObjectId (e.g., `64a1b2c3d4e5f6a7b8c9d0e1`).

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v14 or higher)
- A **MongoDB Atlas** account (free tier works perfectly)

Verify Node.js:
```bash
node -v
npm -v
```

### 2. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new **Cluster** (free M0 tier is fine).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
5. Click **Connect** → **Connect your application** → Copy the connection string.

### 3. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repository-url>
cd "rest-api-mongodb"
npm install
```

### 4. Environment Configuration
Create a `.env` file in the project root (or copy from the template):
```bash
cp .env.example .env
```

Edit `.env` and paste your MongoDB Atlas connection string:
```env
MONGO_URI=mongodb+srv://yourUsername:yourPassword@yourCluster.mongodb.net/notesdb?retryWrites=true&w=majority
PORT=3000
```

> ⚠️ **Important**: The `.env` file is in `.gitignore` and will **NOT** be pushed to GitHub. Never commit database credentials.

### 5. Running the Server

#### Start Production Server:
```bash
npm start
```

#### Start Development Server (with Nodemon auto-reload):
```bash
npm run dev
```

Once started, you should see:
```
✅ MongoDB Connected: yourCluster.mongodb.net
🚀 Notes REST API running on http://localhost:3000
```

Access:
- 🌐 **Interactive Dashboard & Console**: [http://localhost:3000](http://localhost:3000)
- 🔌 **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- 📝 **Notes Endpoint**: [http://localhost:3000/api/notes](http://localhost:3000/api/notes)

---

## 🧪 Automated Testing

Run the automated test suite to programmatically verify all routes, validation checks, and database operations:
```bash
npm test
```

Sample output:
```text
🧪 Starting Automated API Tests (MongoDB)...
📦 Connecting to MongoDB...
✅ MongoDB Connected

1️⃣  Testing GET /api/notes
   ✅ Passed (Count: 3)
2️⃣  Testing POST /api/notes (Create Note)
   ✅ Passed (Created ID: 64a1b2c3d4e5f6a7b8c9d0e1)
3️⃣  Testing GET /api/notes/64a1b2c3d4e5f6a7b8c9d0e1
   ✅ Passed (Test Note from Automated Suite)
4️⃣  Testing GET /api/notes/invalidid123 (404 Not Found)
   ✅ Passed — 404 handling works
5️⃣  Testing POST /api/notes (400 Input Validation)
   ✅ Passed — Input validation works
6️⃣  Testing PUT /api/notes/64a1b2c3d4e5f6a7b8c9d0e1 (Update Note)
   ✅ Passed — Note updated
7️⃣  Testing DELETE /api/notes/64a1b2c3d4e5f6a7b8c9d0e1
   ✅ Passed — Note deleted
8️⃣  Testing GET deleted note (404)
   ✅ Passed — Deleted note returns 404

🎉 ALL 8 AUTOMATED API TESTS PASSED SUCCESSFULLY!
📦 MongoDB connection closed.
```

---

## 📮 Testing with Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop `postman_collection.json` located in the project root directory.
4. **Run request #4 (POST Create Note) first** — it automatically saves the created note's ID to the `{{noteId}}` variable.
5. All subsequent GET, PUT, and DELETE requests use `{{noteId}}` dynamically.

Pre-configured requests:
- `GET` All Notes
- `GET` Single Note by ObjectId
- `GET` 404 Error Test
- `POST` Create Note (auto-saves ID)
- `POST` Create Note — 400 Bad Request (Validation Test)
- `PUT` Update Note
- `DELETE` Delete Note

---

## 💻 cURL Command Examples

### 1. GET All Notes
```bash
curl -X GET http://localhost:3000/api/notes
```

### 2. GET Single Note (replace with actual ObjectId)
```bash
curl -X GET http://localhost:3000/api/notes/64a1b2c3d4e5f6a7b8c9d0e1
```

### 3. POST Create Note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Learning Mongoose", "content": "Mongoose provides schema-based modeling for MongoDB.", "category": "Backend", "tags": ["mongoose", "mongodb"]}'
```

### 4. PUT Update Note
```bash
curl -X PUT http://localhost:3000/api/notes/64a1b2c3d4e5f6a7b8c9d0e1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Note Title", "content": "Updated content goes here."}'
```

### 5. DELETE Note
```bash
curl -X DELETE http://localhost:3000/api/notes/64a1b2c3d4e5f6a7b8c9d0e1
```

---

## 🗄️ Mongoose Note Schema

```javascript
{
  title:     { type: String, required: true, trim: true, maxlength: 150 },
  content:   { type: String, trim: true, default: '' },
  category:  { type: String, trim: true, default: 'General' },
  tags:      { type: [String], default: [] },
  createdAt: { type: Date, auto-generated by Mongoose timestamps },
  updatedAt: { type: Date, auto-generated by Mongoose timestamps }
}
```

---

## ✅ Internship Submission Checklist

- [x] Node.js and Express.js implementation
- [x] RESTful API architecture with full CRUD functionality
- [x] **MongoDB Atlas** database (persistent storage)
- [x] **Mongoose** schema and model for notes
- [x] Connected Express application to MongoDB using Mongoose
- [x] All endpoints store and retrieve data from MongoDB
- [x] Database credentials stored in environment variables (`.env`)
- [x] `.env` file excluded from version control (`.gitignore`)
- [x] Input validation middleware rejecting empty titles (`400 Bad Request`)
- [x] Proper HTTP status codes (`200`, `201`, `400`, `404`)
- [x] Modular code architecture (config, models, routes, controllers, middleware)
- [x] Postman collection provided (`postman_collection.json`)
- [x] Automated test suite (`npm test`)
- [x] Comprehensive `README.md` with setup instructions
- [x] Public GitHub repository

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
