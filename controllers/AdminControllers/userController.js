import User from "../../models/userModel.js";
import { getGraphValues, totalUsersFunction } from "../../utils/adminHelpers/totalusers.js";

// ✅ Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ userType: "Customer" })
      .select("+customerStatus") // ✅ include hidden field
      .sort({ createdAt: -1 });
    const formatted = customers.map((c) => ({
      id: c._id, // ✅ add this
      name: c.name,
      email: c.email,
      location: c.location,
      status: c.customerStatus || "unknown", // ✅ extra safety fallback
      createdAt: c.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch customers", error: error.message });
  }
};

// ✅ Get one customer
export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select(
      "+customerStatus"
    );

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const formatted = {
      name: customer.name,
      email: customer.email,
      location: customer.location,
      status: customer.customerStatus,
      createdAt: customer.createdAt,
    };

    res.status(200).json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customer", error: error.message });
  }
};

// ✅ Block or Unblock
export const blockCustomer = async (req, res) => {
  try {
    const { id, action } = req.params;

    if (!["block", "unblock"].includes(action)) {
      return res
        .status(400)
        .json({ message: 'Invalid action. Use "block" or "unblock".' });
    }

    const status = action === "block" ? "rejected" : "completed";

    const updatedCustomer = await User.findByIdAndUpdate(
      id,
      { customerStatus: status },
      { new: true }
    ).select("+customerStatus");

    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });

    const formatted = {
      id: updatedCustomer._id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      location: updatedCustomer.location,
      status: updatedCustomer.customerStatus, // ✅ correct
      createdAt: updatedCustomer.createdAt,
    };

    res.status(200).json({
      message: `Customer ${
        action === "block" ? "rejected" : "unblocked"
      } successfully`,
      updatedCustomer: formatted,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update customer status",
        error: error.message,
      });
  }
};

// ✅ User stats
// ✅ Backend: getUserStats Controller
export const getUserStats = async (req, res) => {
  try {
    const users = await User.find({ userType: "Customer" }).select(
      "createdAt customerStatus"
    );
    const test = users.filter((u) => u.customerStatus === "completed");
    console.log({ "i am test": test });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const prevNewUsers = users.filter(
      (user) => new Date(user.createdAt) == sevenDaysAgo
    ).length;
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const currentNewUsers = users.filter((user) => {
      const createdDate = new Date(user.createdAt).toISOString().split("T")[0];
      return createdDate === today;
    }).length;

    const totalUsers = totalUsersFunction(users);
    const activeUsers = totalUsersFunction(
      users.filter((u) => u.customerStatus === "completed")
    );
    const inactiveUsers = totalUsersFunction(
      users.filter((u) => u.customerStatus === "rejected")
    );
    const newUsers = {
      value:currentNewUsers,
      percentageDifference:prevNewUsers?Math.round(((currentNewUsers - prevNewUsers) / prevNewUsers) * 100):0,
      graphValues: getGraphValues(users, false)
    }
    console.log(totalUsers);
    console.log(activeUsers);
    console.log(inactiveUsers);
    console.log(newUsers);
    

    res.status(200).json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch stats", error: error.message });
  }
};

// const now = new Date();
// const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
// const past7Days = Array.from({ length: 7 }, (_, i) => {
//   const day = new Date(startOfToday);
//   day.setDate(day.getDate() - (6 - i));
//   return day;
// });

// const createChart = (filterFn) => {
//   return past7Days.map((day, i) => {
//     const next = new Date(day);
//     next.setDate(day.getDate() + 1);
//     const count = users.filter((u) => filterFn(u) && u.createdAt >= day && u.createdAt < next).length;
//     return { name: day.toLocaleDateString('en-US', { weekday: 'short' }), value: count };
//   });
// };

// const totalChart = createChart(() => true);
// const completedChart = createChart(u => u.customerStatus === "completed");
// const rejectedChart = createChart(u => u.customerStatus === "rejected");
// const newChart = createChart(() => true); // same as totalChart

// const completedUsers = users.filter(u => u.customerStatus === "completed").length;
// const rejectedUsers = users.filter(u => u.customerStatus === "rejected").length;

// const newUsersThisWeek = users.filter(u => u.createdAt >= past7Days[0]);
// const newUsersLastWeek = users.filter(u => u.createdAt < past7Days[0] && u.createdAt >= past7Days[0] - 7);
// const totalUsers = totalUsersFunction(users)
// const activeUsers = totalUsersFunction(users.filter(u => u.customerStatus === "completed"))
// const currentWeek = newUsersThisWeek.length;
// const lastWeek = newUsersLastWeek.length;
// const diff = currentWeek - lastWeek;
// const percentageChange =
//   lastWeek === 0 ? (currentWeek > 0 ? "+100%" : "0%") : `${((diff / lastWeek) * 100).toFixed(2)}%`;

//   console.log(users);
//   console.log(totalUsers)
