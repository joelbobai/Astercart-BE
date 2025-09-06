import Product from '../models/productModel.js';
import Store from '../models/storeModel.js';

// POST /api/products → Create a new product (Admin/Store)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, image } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: "Name, price, and quantity are required" });
    }

    // Fetch the authenticated store from the database
    const store = await Store.findById(req.userId);

    // Ensure the store exists
    if (!store) {
      return res.status(403).json({ message: "Unauthorized: Only store owners can create products" });
    }

    // Use store's ID as storeId
    const storeId = req.userId;

    // Create the product with the storeId
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      category,
      image,
      storeId, // Associate the product with the store
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products → Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("storeId", "name"); // Populates store information
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id → Get product details
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("storeId", "name");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/products/:id → Update a product (Admin/Store)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, image, isActive, isFlagged } = req.body;

    const updateData = {
      name,
      description,
      price,
      quantity,
      category,
      image,
      isActive,
    };

    if (isFlagged !== undefined) {
      updateData.isFlagged = isFlagged;
      if (isFlagged) {
        updateData.status = "pending";
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// DELETE /api/products/:id → Delete a product (Admin/Store)
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProducts = async (req, res) => {
  try {
    
    const products = req.body; // Expecting an array of product objects
    console.log(products);
    const {userId: storeId } = req;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid input: Expecting an array of products" });
    }

    // Fetch the authenticated store from the database
    const store = await Store.findById(storeId);

    // Ensure the store exists
    if (!store) {
      return res.status(403).json({ message: "Unauthorized: Only store owners can create products" });
    }

    // Validate each product object
    const validProducts = products.filter(product => 
      product.name && product.price !== undefined && product.quantity !== undefined
    );

    if (validProducts.length === 0) {
      return res.status(400).json({ message: "All products must have a name, price, and quantity" });
    }

    // Get the latest product to determine the next product ID
    const lastProduct = await Product.findOne().sort({ createdAt: -1 });
    let lastProductId = lastProduct ? parseInt(lastProduct.productId.substring(1)) : 0;

    // Create new product instances with sequential product IDs
    const newProducts = validProducts.map(product => {
      lastProductId++;
      return new Product({
        ...product,
        storeId,
        productId: `P${String(lastProductId).padStart(3, '0')}` // Generates P001, P002, etc.
      });
    });

    // Save all products to the database
    const savedProducts = await Product.insertMany(newProducts);

    res.status(201).json({ message: "Products created successfully", products: savedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/products/:id/flag → Flag a product (Admin)
export const flagProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const flaggedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        isFlagged: true,
        status: "pending",
      },
      { new: true }
    );

    if (!flaggedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product flagged successfully", product: flaggedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unflagProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const unflaggedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        isFlagged: false,
        status: "available", // or retain original status if needed
      },
      { new: true }
    );

    if (!unflaggedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product unflagged successfully", product: unflaggedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProductsForAdmin = async (req, res) => {
  try {
    const products = await Product.find();

    const storeIds = [...new Set(products.map((p) => p.storeId?.toString()))].filter(Boolean);

    const storeUsers = await Store.find({
      _id: { $in: storeIds },
    }).select("_id name storeDetails");

    const storeMap = {};
    storeUsers.forEach((store) => {
      const fullAddress = [
        store.storeDetails?.address,
        store.storeDetails?.lga,
        store.storeDetails?.state,
      ]
        .filter(Boolean)
        .join(", ");

      storeMap[store._id.toString()] = {
        name: store.name,
        address: fullAddress,
      };
    });

    const formatted = products.map((p) => {
      const taxRate = p.taxRate || 0;
      const taxedAmount = (p.price * taxRate) / 100;
      const priceWithTax = p.price + taxedAmount;

      const adminFee = (priceWithTax * 10) / 100;
      const adminPrice = priceWithTax + adminFee;

      const storeInfo = storeMap[p.storeId?.toString()] || {
        name: "Unknown Store",
        address: "Unknown Address",
      };

      return {
        _id: p._id,
        storeName: storeInfo.name,
        storeAddress: storeInfo.address,
        productId: p.productId,
        name: p.name,
        price: p.price,              // Base price
        adminFee: adminFee,           // 10% of (price + tax)
        adminPrice: adminPrice,       // (price + tax) + 10% admin fee
        createdAt: p.createdAt,
        status: p.status
          ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
          : "Pending",
        isFlagged: p.isFlagged,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Admin product fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const updateProductAsAdmin = async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const price = req.body.price ?? currentProduct.price;
    const discount = req.body.discount ?? currentProduct.discount ?? 0;
    const taxRate = req.body.taxRate ?? currentProduct.taxRate ?? 0;

    const updateData = {
      name: req.body.name ?? currentProduct.name,
      description: req.body.description ?? currentProduct.description,
      price,
      quantity: req.body.quantity ?? currentProduct.quantity,
      category: req.body.category ?? currentProduct.category,
      image: req.body.image ?? currentProduct.image,
      isActive: req.body.isActive ?? currentProduct.isActive,
      discount,
      taxRate,
      isFlagged: req.body.isFlagged ?? currentProduct.isFlagged,
    };

    // ✅ Correct Admin Price
    const taxedAmount = (price * taxRate) / 100;
    const priceWithTax = price + taxedAmount;
    updateData.adminPrice = (priceWithTax * 10) / 100; // 10% of price+tax only

    if (updateData.isFlagged) {
      updateData.status = "pending";
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



