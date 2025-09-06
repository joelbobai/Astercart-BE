import Payment from '../../models/paymentModel.js';
import Category from '../../models/categoryModel.js';


// POST /api/categories → Create a new category (Admin)
export const createCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      if (!name) return res.status(400).json({ message: "Category name is required." });
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) return res.status(400).json({ message: "Category already exists." });
  
      const newCategory = new Category({ name, description });
      await newCategory.save();
  
      res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


// GET /api/categories → Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    if(!categories.length){
        return res.status(404).json({ message: "No category found." });
    }
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/categories/:id → Get category details
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PUT /api/categories/:id → Update a category (Admin)
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    category.name = name || category.name;
    category.description = description || category.description;

    await category.save();
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/categories/:id → Delete a category (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) return res.status(404).json({ message: "Category not found." });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopCategoriesFromPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "completed" });

    if (!payments.length) {
      return res.status(404).json({ message: "No completed payments found." });
    }

    const categoryStats = {};
    let totalAmount = 0;

    payments.forEach(payment => {
      totalAmount += payment.amount || 0;

      if (Array.isArray(payment.products)) {
        payment.products.forEach(product => {
          const category = product.category;
          const price = product.price || 0;

          if (category) {
            if (!categoryStats[category]) {
              categoryStats[category] = { count: 0, amount: 0 };
            }
            categoryStats[category].count += 1;
            categoryStats[category].amount += price;
          }
        });
      }
    });

    const sortedCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    const topCategoryNames = sortedCategories.map(([name]) => name);

    const categoriesFromDb = await Category.find({ name: { $in: topCategoryNames } });

    const categoryColors = {
      Fruits: "#f59e0b",
      Vegetables: "#10b981",
      Beverages: "#3b82f6",
      Snacks: "#ec4899",
      Bakery: "#8b5cf6",
      Dairy: "#06b6d4",
      "Frozen Foods": "#0ea5e9",
      "Grains & Cereals": "#eab308",
      "Meat & Poultry": "#ef4444",
      "Household Essentials": "#64748b",
    };

    const vibrantFallbackColors = [
      "#ff6b6b", "#ffcc00", "#4caf50", "#ff9800", "#2196f3",
      "#9c27b0", "#00bcd4", "#f44336", "#673ab7", "#ff4081"
    ];

    let fallbackColorIndex = 0;

    // Use sortedCategories to preserve order
    const topCategories = sortedCategories.map(([name, stats]) => {
      const cat = categoriesFromDb.find(c => c.name === name);

      let color;
      if (categoryColors[name]) {
        color = categoryColors[name];
      } else {
        color = vibrantFallbackColors[fallbackColorIndex % vibrantFallbackColors.length];
        fallbackColorIndex++;
      }

      return {
        name: name,
        description: cat?.description || "",
        orderCount: stats.count,
        totalAmount: stats.amount,
        color,
        icon: cat?.icon || null,
      };
    });

    res.status(200).json({
      totalAmount,
      topCategories,
    });
  } catch (error) {
    console.error("Error fetching top categories from payments:", error.message);
    res.status(500).json({ message: "Failed to fetch top categories", error: error.message });
  }
};