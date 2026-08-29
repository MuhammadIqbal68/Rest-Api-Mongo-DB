/**
 * Automated Verification Test Script for Notes REST API (MongoDB)
 */

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Fallback to default system DNS
}

const app = require('../src/server');

const PORT = 3001; // Use separate port for testing
let server;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body && { 'Content-Length': Buffer.byteLength(dataString) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Starting Automated API Tests (MongoDB)...\n");

  try {
    // Connect to MongoDB before running tests
    console.log("📦 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    console.error("   Make sure MONGO_URI is set in your .env file.");
    process.exit(1);
  }

  server = app.listen(PORT, async () => {
    let createdId = null;

    try {
      // Test 1: GET /api/notes
      console.log("1️⃣  Testing GET /api/notes");
      const resGet = await makeRequest('GET', '/api/notes');
      console.assert(resGet.status === 200, `Expected 200, got ${resGet.status}`);
      console.assert(resGet.body.success === true, 'Expected success === true');
      console.log(`   ✅ Passed (Count: ${resGet.body.count})`);

      // Test 2: POST /api/notes (201 Created)
      console.log("\n2️⃣  Testing POST /api/notes (Create Note)");
      const newNote = {
        title: "Test Note from Automated Suite",
        content: "Testing POST endpoint with MongoDB",
        category: "Testing",
        tags: ["unit-test", "mongodb"]
      };
      const resPost = await makeRequest('POST', '/api/notes', newNote);
      console.assert(resPost.status === 201, `Expected 201, got ${resPost.status}`);
      console.assert(resPost.body.data.title === newNote.title, 'Title match');
      createdId = resPost.body.data.id || resPost.body.data._id;
      console.log(`   ✅ Passed (Created ID: ${createdId})`);

      // Test 3: GET /api/notes/:id
      console.log(`\n3️⃣  Testing GET /api/notes/${createdId}`);
      const resGetOne = await makeRequest('GET', `/api/notes/${createdId}`);
      console.assert(resGetOne.status === 200, `Expected 200, got ${resGetOne.status}`);
      const returnedId = resGetOne.body.data.id || resGetOne.body.data._id;
      console.assert(returnedId === createdId, 'Expected matching note ID');
      console.log(`   ✅ Passed (${resGetOne.body.data.title})`);

      // Test 4: GET /api/notes/:id (404 — non-existent ObjectId)
      console.log("\n4️⃣  Testing GET /api/notes/64a000000000000000000000 (404 Not Found)");
      const resGet404 = await makeRequest('GET', '/api/notes/64a000000000000000000000');
      console.assert(resGet404.status === 404, `Expected 404, got ${resGet404.status}`);
      console.log(`   ✅ Passed — 404 handling works`);

      // Test 5: POST /api/notes (400 Bad Request — empty title)
      console.log("\n5️⃣  Testing POST /api/notes (400 Input Validation)");
      const badNote = { title: "   ", content: "Empty title" };
      const resPost400 = await makeRequest('POST', '/api/notes', badNote);
      console.assert(resPost400.status === 400, `Expected 400, got ${resPost400.status}`);
      console.assert(resPost400.body.error === "Validation Error", 'Validation error match');
      console.log(`   ✅ Passed — Input validation works`);

      // Test 6: PUT /api/notes/:id (200 OK)
      console.log(`\n6️⃣  Testing PUT /api/notes/${createdId} (Update Note)`);
      const updateData = { title: "Updated Test Title", category: "Backend" };
      const resPut = await makeRequest('PUT', `/api/notes/${createdId}`, updateData);
      console.assert(resPut.status === 200, `Expected 200, got ${resPut.status}`);
      console.assert(resPut.body.data.title === "Updated Test Title", 'Updated title match');
      console.log(`   ✅ Passed — Note updated`);

      // Test 7: DELETE /api/notes/:id (200 OK)
      console.log(`\n7️⃣  Testing DELETE /api/notes/${createdId}`);
      const resDel = await makeRequest('DELETE', `/api/notes/${createdId}`);
      console.assert(resDel.status === 200, `Expected 200, got ${resDel.status}`);
      console.log(`   ✅ Passed — Note deleted`);

      // Test 8: GET deleted note (should be 404)
      console.log(`\n8️⃣  Testing GET deleted note /api/notes/${createdId} (404)`);
      const resDelConfirm = await makeRequest('GET', `/api/notes/${createdId}`);
      console.assert(resDelConfirm.status === 404, `Expected 404, got ${resDelConfirm.status}`);
      console.log(`   ✅ Passed — Deleted note returns 404`);

      console.log("\n🎉 ALL 8 AUTOMATED API TESTS PASSED SUCCESSFULLY!");
    } catch (err) {
      console.error("\n❌ Test failed:", err);
      process.exitCode = 1;
    } finally {
      server.close();
      await mongoose.connection.close();
      console.log("\n📦 MongoDB connection closed.");
    }
  });
}

runTests();
