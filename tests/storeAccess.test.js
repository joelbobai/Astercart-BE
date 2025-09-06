import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import storeRoutes from '../src/routes/storeRoutes.js';

// Ensure JWT secret for tests
process.env.JWT_SECRET = 'testsecret';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/store', storeRoutes);
  return app;
}

test('non-store user denied access to store details', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());
  const token = jwt.sign({ id: 'user1', userType: 'Customer' }, process.env.JWT_SECRET);
  const res = await fetch(`http://localhost:${server.address().port}/api/store/store-details`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.status, 403);
});

test('non-store user cannot update store profile', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());
  const token = jwt.sign({ id: 'user1', userType: 'Customer' }, process.env.JWT_SECRET);
  const res = await fetch(`http://localhost:${server.address().port}/api/store/update-profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  assert.strictEqual(res.status, 403);
});
