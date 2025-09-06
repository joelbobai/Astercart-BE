import Payment from '../../models/paymentModel.js';
import { totalPaymentFunction } from "../../utils/adminHelpers/paymentstats.js";

export const createPayment = async (req, res) => {
  try {
    const { products = [], storePayout = 0, fee = 0, taxRate = 0, ...rest } = req.body;

    const amount = products.reduce((total, product) => total + (product.price || 0), 0);

    // ✅ Just calculate amount, fee, tax. Not adminFee
    const taxedAmount = (amount * taxRate) / 100;
    const additionalFee = taxedAmount + fee;

    const newPayment = new Payment({
      ...rest,
      products,
      amount,
      storePayout,
      fee,
      taxRate,
      additionalFee,
    });

    await newPayment.save();
    res.status(201).json({ message: "Payment created successfully", payment: newPayment });
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment", error: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();

    // ✅ Dynamically calculate adminFee for each payment
    const formattedPayments = payments.map((p) => {
      const taxedAmount = (p.amount * p.taxRate) / 100;
      const priceWithTax = p.amount + taxedAmount;
      const adminFee = (priceWithTax * 10) / 100;

      return {
        ...p.toObject(),
        adminFee, // Include live adminFee
      };
    });

    res.status(200).json(formattedPayments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment", error: err.message });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const payments = await Payment.find({ status: { $regex: /^completed$/i } });

    // Dynamically calculate admin fees
    const paymentsWithAdminFee = payments.map((p) => {
      const taxedAmount = (p.amount * p.taxRate) / 100;
      const priceWithTax = p.amount + taxedAmount;
      const adminFee = (priceWithTax * 10) / 100;
      return {
        ...p.toObject(),
        adminFee,
      };
    });

    const totalRevenue = totalPaymentFunction(paymentsWithAdminFee, "amount");
    const totalAdminFee = totalPaymentFunction(paymentsWithAdminFee, "adminFee");
    const totalStorePayout = totalPaymentFunction(paymentsWithAdminFee, "storePayout");
    const totalAdditionalFees = totalPaymentFunction(paymentsWithAdminFee, "additionalFee");

    res.status(200).json({
      totalRevenue,
      totalAdminFee,
      totalStorePayout,
      totalAdditionalFees,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment stats", error: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully", payment });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete payment", error: error.message });
  }
};
