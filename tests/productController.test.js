import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { createProduct } from '../controllers/productsController.js';
import Product from '../models/productModel.js';
import Store from '../models/storeModel.js';

// Helper to mock response object
function createRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.body = obj;
    },
  };
}

test('createProduct generates sequential productId', async () => {
  const storeId = new mongoose.Types.ObjectId();
  Store.findById = async () => ({ _id: storeId });
  Product.findOne = () => ({
    sort: async () => ({ productId: 'P005' }),
  });
  let savedProduct;
  Product.prototype.save = async function () {
    savedProduct = this;
    return this;
  };

  const req = {
    body: { name: 'Test', price: 100, quantity: 5 },
    userId: storeId,
  };
  const res = createRes();

  await createProduct(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedProduct.productId, 'P006');
  assert.equal(res.body.product.productId, 'P006');
});

test('createProduct saves product with generated productId', async () => {
  const storeId = new mongoose.Types.ObjectId();
  Store.findById = async () => ({ _id: storeId });
  Product.findOne = () => ({ sort: async () => null });
  let savedProduct;
  Product.prototype.save = async function () {
    savedProduct = this;
    return this;
  };

  const req = {
    body: { name: 'Another', price: 50, quantity: 2 },
    userId: storeId,
  };
  const res = createRes();

  await createProduct(req, res);

  assert.ok(savedProduct.productId);
  assert.equal(savedProduct.productId, res.body.product.productId);
});

