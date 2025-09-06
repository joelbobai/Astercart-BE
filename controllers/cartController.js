import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
// import mongoose from "mongoose";


export const addToCart = async (req, res) => {
    try {
      const { customerId, productId, quantity } = req.body;
  
      // Validate input
      if (!customerId || !productId || !quantity) {
        return res.status(400).json({ message: "Customer ID, product ID, and quantity are required." });
      }
  
      // Check if product exists and has enough stock
      const product = await Product.findById(productId);
      if (!product || product.quantity < quantity) {
        return res.status(400).json({ message: "Product not available or insufficient stock." });
      }
  
      // Check if the customer already has a cart
      let cart = await Cart.findOne({ customerId });
  
      if (!cart) {
        // Create a new cart if none exists
        cart = new Cart({
          customerId,
          products: [{ productId, quantity }],
        });
      } else {
        // Check if the product is already in the cart
        const existingItem = cart.products.find((product) => product.productId.toString() === productId);
  
        if (existingItem) {
          // Update quantity if the product is already in the cart
          existingItem.quantity += quantity;
        } else {
          // Add a new product to the cart
          cart.products.push({ productId, quantity });
        }
      }
  
      await cart.save();
      res.status(200).json({ message: "Product added to cart.", cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  


  // view Cart endpoint

  export const viewCart = async (req, res) => {
    try {
      const { customerId } = req.params;

          // Validate the customerId
    // if (!mongoose.Types.ObjectId.isValid(customerId)) {
    //   return res.status(400).json({ message: "Invalid customerId format." });
    // }
  
      const cart = await Cart.findOne({ customerId }).populate("products.productId", "name price quantity");
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
      }
  
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  // PUT /api/cart/:itemId → Update cart item quantity
export const updateCart = async (req, res) => {
  try {
    const { customerId, quantity } = req.body;
    const { productId } = req.params;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero." });
    }

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const product = cart.products.id(productId);
    if (!product) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    product.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart item updated successfully.", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE /api/cart/:productId → Remove item from cart
export const deleteCartItem = async (req, res) => {
  try {
    const { customerId } = req.body;
    const { productId } = req.params;

    // Find the cart for the customer
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Filter out the product to remove it from the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    cart.products.splice(productIndex, 1); // Remove the product
    await cart.save();

    return res.status(200).json({ message: "Product removed successfully.", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE /api/cart/clear → Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const { customerId } = req.body;

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully.", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
