import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";


export const createReview = async (req, res) => {
    try {
      const customerId = req.userId; // Extracted from the token
      const { id: productId } = req.params;
      const {rating, comment } = req.body;
      
      
      // Validate input
      if (!rating || !comment) {
        return res.status(400).json({ message: "Rating and comment are required." });
      }
  
      // Fetch product and check for existing review in a single query
      const productExists = await Product.exists({ _id: productId });
      if (!productExists) {
        return res.status(404).json({ message: "Product not found." });
      }  

      const existingReview = await Review.exists({ productId, customerId });
      if (existingReview) {
        return res.status(400).json({ message: "Customer has already reviewed this product." });
      }
      
      // Save new review
      const review = await Review.create({
        productId,
        customerId,
        rating,
        comment,
      });
  
      res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  