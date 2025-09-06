import Transaction from "../../models/transactionModel.js"; // Adjust the path to your transaction model
import Product from "../../models/productModel.js";
import Cart from "../../models/cartModel.js";
import Store from "../../models/storeModel.js";


export const createTransaction = async (req, res) => {
  try {
    const { customerId, deliveryAddress} = req.body;

    // Validate input
    if (!customerId || !deliveryAddress) {
      return res.status(400).json({ message: "Customer ID, Delivery Address and Store Name are required." });
    }

    // Fetch cart
    const cart = await Cart.findOne({ customerId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // Calculate total and format order items
    
    const products = cart.products.map((product) => ({
      productId: product.productId._id,
      name: product.productId.name,
      price: product.productId.price,
      quantity: product.quantity,
      totalPrice: product.productId.price * product.quantity,
    }));

    const storeId = cart.products[0]?.productId.storeId || null; // Assuming products are from one store per order
    // calculate total amount
    const totalAmount = products.reduce(
      (sum, product) => sum + product.totalPrice, 0);

    // Fetch store ID
    const store = await Store.findById(storeId);
    // Validate store exists
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    const storeName = store.name;
    
    

   // Create order
    const order = new Transaction({
      storeId,
      customerId,
      products,
      totalAmount,
      deliveryAddress,
      storeName,
      paymentStatus: "unpaid",
      status: "pending",
    });

    await order.save();
    // debugging
    console.log("Order created:", order);

    // Deduct quantities from stock
    await Promise.all(
      products.map((product) =>
        Product.findByIdAndUpdate(product.productId, {
          $inc: { quantity: -product.quantity },
        })
      )
    );

    // Clear the cart
    await Cart.deleteOne({ customerId });

    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /api/transactions/:id → Get transaction details
export const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate("products.productId", "name price")
      .populate("storeId", "name")
      .populate("customerId", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /api/transactions/customer/:customerId → Get customer's transactions
export const getUserTransactions = async (req, res) => {
  try {
    const {customerId } = req.params;
    const transactions = await Transaction.find({customerId : customerId })
      .populate("customerId", "name email") // Include customer name and email
      .populate("products.productId", "name price") // Populate product details
      .populate("storeId", "name") // Populate store details
      .sort({ createdAt: -1 }); // Sort by most recent transactions
      
      if (!transactions.length) {
        return res.status(404).json({ message: "No transactions found for this customer." })
        };

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// GET /api/transactions → Get all transactions (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("storeId", "name") // Include store name
      .populate("customerId", "name email") // Include customer name and email
      .sort({ createdAt: -1 }); // Sort by most recent transactions

      if (!transactions.length) {
        return res.status(404).json({ message: "No transactions found." });
      }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PUT /api/transactions/:id/status → Update transaction status (Admin)
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Transaction status is required." });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    transaction.status = status;
    await transaction.save();

    res.status(200).json({ message: "Transaction status updated successfully.", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE /api/transactions/:id → Cancel a transaction
export const cancelTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Only pending transactions can be canceled." });
    }

    await Transaction.findByIdAndDelete(id);
    res.status(200).json({ message: "Transaction canceled successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

