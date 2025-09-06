import mongoose from "mongoose";
import Promo from '../../models/promoModel.js';

export const createPromo = async (req, res) => {
  try {
    const {
      promoName,
      storeName,
      storeAddress,
      category,
      product,
      startDate,
      endDate,
      description,
      banner
    } = req.body;

    const createdBy = req.userId;
    console.log(req.body);
    
    if (!storeName || !storeAddress) {
      return res.status(400).json({ message: "Store name and address are required." });
    }

    const promo = await Promo.create({
      promoName,
      store: {
        name: storeName,
        address: storeAddress,
      },
      category,
      product,
      startDate,
      endDate,
      description,
      bannerImage: req.file?.path || banner || null,
      createdBy,
      status: "active",
    });

    res.status(201).json({ message: "Promo created successfully", promo });
  } catch (error) {
    res.status(500).json({ message: "Failed to create promo", error: error.message });
  }
};
            

export const getAllPromos = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    const now = new Date();
    await Promo.updateMany({ endDate: { $lt: now }, status: "active" }, { status: "inactive" });

    if (search) {
      query["store.name"] = { $regex: search, $options: "i" };
    }

    const promos = await Promo.find(query).populate('createdBy');
    res.status(200).json(promos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch promos", error: error.message });
  }
};

export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    await Promo.findByIdAndDelete(id);
    res.status(200).json({ message: "Promo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete promo", error: error.message });
  }
};

export const deactivateExpiredPromos = async () => {
  const now = new Date();
  await Promo.updateMany({ endDate: { $lt: now }, status: "active" }, { status: "inactive" });
};
