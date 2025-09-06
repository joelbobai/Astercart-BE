import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';

import { getStoreDetails } from '../controllers/storeControllers/storeController.js';
import Transaction from '../models/transactionModel.js';
import Product from '../models/productModel.js';
import Store from '../models/storeModel.js';

test('getStoreDetails returns expected dashboard structure', async () => {
  const storeId = new mongoose.Types.ObjectId();

  // Mock transaction aggregation
  Transaction.aggregate = async () => [
    {
      _id: null,
      totalTransactions: 2,
      totalStockItems: 5,
      totalSoldItems: 5,
      totalOrderSales: 200,
      totalFeesCharged: 20,
      completedOrders: 2,
      pendingOrders: 0,
      failedOrders: 0,
    },
  ];

  // Mock product aggregation
  Product.aggregate = async () => [
    {
      _id: null,
      totalItemsLeftInStock: 10,
      totalItemsOutOfStock: 1,
    },
  ];

  // Mock store profile lookup
  Store.findById = () => ({
    select: async () => ({ _id: storeId, name: 'Test Store' }),
  });

  // Mock transaction list
  Transaction.find = async () => [{ _id: new mongoose.Types.ObjectId(), amount: 200 }];

  const req = { userId: storeId.toString(), userType: 'Store' };
  let jsonResponse;
  const res = { json: (data) => { jsonResponse = data; } };

  await getStoreDetails(req, res);

  assert.ok(jsonResponse.summary, 'summary should be present');
  assert.ok(jsonResponse.storeProfile, 'storeProfile should be present');
  assert.ok(Array.isArray(jsonResponse.transactions), 'transactions should be an array');

  assert.strictEqual(jsonResponse.summary.totalTransactions, 2);
  assert.strictEqual(jsonResponse.summary.totalItemsLeftInStock, 10);
  assert.strictEqual(jsonResponse.summary.totalItemsOutOfStock, 1);
});

