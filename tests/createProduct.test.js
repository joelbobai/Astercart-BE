import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';

import { createProduct } from '../controllers/productsController.js';
import Product from '../models/productModel.js';
import Store from '../models/storeModel.js';

test('createProduct persists discount and taxRate', async () => {
  const storeId = new mongoose.Types.ObjectId();

  // Mock store lookup
  Store.findById = async () => ({ _id: storeId });

  // Capture saved product
  let savedProduct;
  Product.prototype.save = async function () {
    savedProduct = this;
  };

  const req = {
    body: {
      name: 'Test Product',
      description: 'Desc',
      price: 100,
      quantity: 5,
      category: 'Category',
      images: [],
      discount: 10,
      taxRate: 5,
    },
    userId: storeId,
  };

  let statusCode;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json() {},
  };

  await createProduct(req, res);

  assert.strictEqual(statusCode, 201);
  assert.strictEqual(savedProduct.discount, 10);
  assert.strictEqual(savedProduct.taxRate, 5);
});
