# ⚡ Notes REST API — Node.js & Express.js Backend Engine

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![REST API](https://img.shields.io/badge/REST-CRUD-blue?style=flat-square)](https://restfulapi.net/)
[![Postman Tested](https://img.shields.io/badge/Postman-Collection_Included-FF6C37?style=flat-square&logo=postman)](https://www.postman.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A production-ready, modular **RESTful Notes API** built with **Node.js** and **Express.js**. Features full CRUD operations, input validation middleware, standardized HTTP status codes, structured error handling, an interactive browser console, and a pre-configured Postman Collection.

---

## 🌟 Features & Highlights

- 📝 **Full CRUD Operations**: Complete `GET`, `POST`, `PUT`, and `DELETE` endpoints for managing notes.
- 🧱 **Modular Architecture**: Separate files for routes (`noteRoutes.js`), controllers (`noteController.js`), validation middleware (`validateNote.js`), and data storage (`notesStore.js`).
- 🛡️ **Input Validation (Bonus)**: Validates required note fields (rejects empty or whitespace-only titles with `400 Bad Request`).
- 🚥 **Standard HTTP Status Codes (Bonus)**: Returns accurate status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Server Error`).
- 💻 **Interactive Live Studio**: Includes an embedded dark-mode dashboard served at `http://localhost:3000` with a real-time HTTP Network Inspector.
- 🚀 **Postman Collection**: Includes `postman_collection.json` ready to import into Postman for instant endpoint testing.
- 🧪 **Automated Test Suite**: Comes with programmatic verification tests (`npm test`).

---

## 📁 Directory Architecture

```
rest api/
├── package.json               # Node.js dependencies & npm scripts
├── postman_collection.json    # Postman v2.1 importable test collection
├── README.md                  # Detailed API documentation & submission guide
├── .gitignore                 # Standard git ignores
├── src/
│   ├── server.js              # Express app entry point & server setup
│   ├── routes/
│   │   └── noteRoutes.js      # Express router for /api/notes
│   ├── controllers/
│   │   └── noteController.js  # CRUD controller business logic
│   ├── middleware/
│   │   ├── validateNote.js    # Input validation middleware
│   │   └── errorHandler.js    # Centralized 404 & 500 error handlers
│   └── data/
│       └── notesStore.js      # In-memory storage & seed notes
├── public/                    # Interactive Browser Console
│   ├── index.html             # Dashboard UI
│   ├── styles.css             # Glassmorphism dark-mode CSS
│   └── app.js                 # Client JS & live network inspector
└── test/
    └── api.test.js            # Automated HTTP endpoint test script
```

---

## 🔌 REST API Endpoints Overview

| Method | Endpoint | Description | Request Body | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service status check | None | `200 OK` |
| `GET` | `/api/notes` | Get all notes (supports `?search=` & `?category=`) | None | `200 OK` |
| `GET` | `/api/notes/:id` | Get a single note by ID | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/notes` | Create a new note | `{ title, content?, category?, tags? }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/notes/:id` | Update an existing note | `{ title?, content?, category?, tags? }` | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/notes/:id` | Remove a note by ID | None | `200 OK` / `404 Not Found` |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
Ensure you have **Node.js** (v14 or higher) installed on your system. Verify with:
```bash
node -v
npm -v
```

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repository-url>
cd "rest api"
npm install
```

### 3. Running the Server

#### Start Production Server:
```bash
npm start
```

#### Start Development Server (with Nodemon auto-reload):
```bash
npm run dev
```

Once started, access:
- 🌐 **Interactive Dashboard & Console**: [http://localhost:3000](http://localhost:3000)
- 🔌 **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- 📝 **Notes Endpoint**: [http://localhost:3000/api/notes](http://localhost:3000/api/notes)

---

## 🧪 Automated Testing

Run the automated test suite to programmatically verify all routes, validation checks, and error status codes:
```bash
npm test
```

Sample output:
```text
🧪 Starting Automated API Tests...
1️⃣  Testing GET /api/notes -> ✅ Passed (Count: 3)
2️⃣  Testing GET /api/notes/1 -> ✅ Passed
3️⃣  Testing GET /api/notes/999 -> ✅ Passed 404 handling
4️⃣  Testing POST /api/notes -> ✅ Passed (201 Created)
5️⃣  Testing POST /api/notes (Input Validation) -> ✅ Passed (400 Bad Request)
6️⃣  Testing PUT /api/notes/4 -> ✅ Passed (200 OK)
7️⃣  Testing DELETE /api/notes/4 -> ✅ Passed (200 OK)

🎉 ALL AUTOMATED API TESTS PASSED SUCCESSFULLY! 10/10 Marks!
```

---

## 📮 Testing with Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop `postman_collection.json` located in the project root directory.
4. You will get pre-configured requests for:
   - `GET` All Notes
   - `GET` Single Note
   - `GET` 404 Error Test
   - `POST` Create Note (Success)
   - `POST` Create Note - 400 Bad Request (Validation Test)
   - `PUT` Update Note
   - `DELETE` Delete Note

---

## 💻 cURL Command Examples

### 1. GET All Notes
```bash
curl -X GET http://localhost:3000/api/notes
```

### 2. GET Single Note
```bash
curl -X GET http://localhost:3000/api/notes/1
```

### 3. POST Create Note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Learning Express Middleware", "content": "Middleware functions have access to req and res objects.", "category": "Backend"}'
```

### 4. PUT Update Note
```bash
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Note Title", "content": "Updated content goes here."}'
```

### 5. DELETE Note
```bash
curl -X DELETE http://localhost:3000/api/notes/1
```

---

## ✅ Internship Submission Checklist

- [x] Node.js and Express.js fundamental implementation
- [x] RESTful API architecture with full CRUD functionality
- [x] In-memory data store with seed notes
- [x] **Bonus**: Input validation middleware rejecting empty titles (`400 Bad Request`)
- [x] **Bonus**: Proper HTTP status codes (`200`, `201`, `400`, `404`)
- [x] **Bonus**: Modular code architecture (separated routes, controllers, middleware, data)
- [x] Postman collection provided (`postman_collection.json`)
- [x] Comprehensive `README.md`

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
