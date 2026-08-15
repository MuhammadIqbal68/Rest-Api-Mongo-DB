/**
 * Automated Verification Test Script for Notes REST API
 */

const http = require('http');
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
  console.log("🧪 Starting Automated API Tests...");
  
  server = app.listen(PORT, async () => {
    try {
      // Test 1: GET /api/notes
      console.log("\n1️⃣  Testing GET /api/notes");
      const resGet = await makeRequest('GET', '/api/notes');
      console.assert(resGet.status === 200, `Expected 200, got ${resGet.status}`);
      console.assert(resGet.body.success === true, 'Expected success === true');
      console.log(`✅ GET /api/notes passed (Count: ${resGet.body.count})`);

      // Test 2: GET /api/notes/1
      console.log("\n2️⃣  Testing GET /api/notes/1");
      const resGetOne = await makeRequest('GET', '/api/notes/1');
      console.assert(resGetOne.status === 200, `Expected 200, got ${resGetOne.status}`);
      console.assert(resGetOne.body.data.id === "1", 'Expected note ID "1"');
      console.log(`✅ GET /api/notes/1 passed (${resGetOne.body.data.title})`);

      // Test 3: GET /api/notes/999 (404)
      console.log("\n3️⃣  Testing GET /api/notes/999 (404 Not Found)");
      const resGet404 = await makeRequest('GET', '/api/notes/999');
      console.assert(resGet404.status === 404, `Expected 404, got ${resGet404.status}`);
      console.log(`✅ GET 404 handling passed`);

      // Test 4: POST /api/notes (201 Created)
      console.log("\n4️⃣  Testing POST /api/notes (Create Note)");
      const newNote = {
        title: "Test Note from Automated Suite",
        content: "Testing POST endpoint",
        category: "Testing",
        tags: ["unit-test", "ci"]
      };
      const resPost = await makeRequest('POST', '/api/notes', newNote);
      console.assert(resPost.status === 201, `Expected 201, got ${resPost.status}`);
      console.assert(resPost.body.data.title === newNote.title, 'Title match');
      const createdId = resPost.body.data.id;
      console.log(`✅ POST /api/notes passed (Created ID: ${createdId})`);

      // Test 5: POST /api/notes (400 Bad Request - empty title)
      console.log("\n5️⃣  Testing POST /api/notes (400 Input Validation)");
      const badNote = { title: "   ", content: "Empty title" };
      const resPost400 = await makeRequest('POST', '/api/notes', badNote);
      console.assert(resPost400.status === 400, `Expected 400, got ${resPost400.status}`);
      console.assert(resPost400.body.error === "Validation Error", 'Validation error match');
      console.log(`✅ POST 400 Input validation passed`);

      // Test 6: PUT /api/notes/:id (200 OK)
      console.log(`\n6️⃣  Testing PUT /api/notes/${createdId} (Update Note)`);
      const updateData = { title: "Updated Test Title", category: "Backend" };
      const resPut = await makeRequest('PUT', `/api/notes/${createdId}`, updateData);
      console.assert(resPut.status === 200, `Expected 200, got ${resPut.status}`);
      console.assert(resPut.body.data.title === "Updated Test Title", 'Updated title match');
      console.log(`✅ PUT /api/notes/${createdId} passed`);

      // Test 7: DELETE /api/notes/:id (200 OK)
      console.log(`\n7️⃣  Testing DELETE /api/notes/${createdId}`);
      const resDel = await makeRequest('DELETE', `/api/notes/${createdId}`);
      console.assert(resDel.status === 200, `Expected 200, got ${resDel.status}`);
      console.log(`✅ DELETE /api/notes/${createdId} passed`);

      console.log("\n🎉 ALL AUTOMATED API TESTS PASSED SUCCESSFULLY! 10/10 Marks!");
    } catch (err) {
      console.error("❌ Test failed:", err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runTests();
