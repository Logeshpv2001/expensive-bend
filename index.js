// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose
//   .connect(
//     "mongodb+srv://logeshkarnish:Logeshpv%402001@cluster0.jpknhkc.mongodb.net/"
//   )
//   .then(() => console.log("✅ MongoDB connected successfully"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// const expenseSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   amount: Number,
//   date: { type: Date, default: Date.now },
// });

// const Expense = mongoose.model("Expense", expenseSchema);

// // Add expense
// app.post("/api/expenses", async (req, res) => {
//   try {
//     const expense = new Expense(req.body);
//     await expense.save();
//     res.status(201).json(expense);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all expenses
// app.get("/api/expenses", async (req, res) => {
//   try {
//     const expenses = await Expense.find().sort({ date: -1 });
//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get current month expenses
// app.get("/api/expenses/current-month", async (req, res) => {
//   try {
//     const now = new Date();
//     const start = new Date(now.getFullYear(), now.getMonth(), 1);
//     const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//     const expenses = await Expense.find({
//       date: { $gte: start, $lte: end },
//     }).sort({ date: -1 });

//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Filter expenses by date range
// app.get("/api/expenses/filter", async (req, res) => {
//   try {
//     const { from, to } = req.query;
//     if (!from || !to) {
//       return res.status(400).json({ error: "Both from and to dates required" });
//     }

//     const start = new Date(from);
//     const end = new Date(to);

//     const expenses = await Expense.find({
//       date: { $gte: start, $lte: end },
//     }).sort({ date: -1 });

//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Total spent
// app.get("/api/expenses/total", async (req, res) => {
//   try {
//     const { from, to } = req.query;
//     let start, end;

//     if (from && to) {
//       start = new Date(from);
//       end = new Date(to);
//     } else {
//       const now = new Date();
//       start = new Date(now.getFullYear(), now.getMonth(), 1);
//       end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//     }

//     const result = await Expense.aggregate([
//       {
//         $match: {
//           date: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     res.json({ total: result.length > 0 ? result[0].total : 0 });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update
// app.patch("/api/expenses/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedExpense) {
//       return res.status(404).json({ error: "Expense not found" });
//     }
//     res.json(updatedExpense);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Delete
// app.delete("/api/expenses/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedExpense = await Expense.findByIdAndDelete(id);
//     if (!deletedExpense) {
//       return res.status(404).json({ error: "Expense not found" });
//     }
//     res.json({ message: "Expense deleted successfully" });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "logeshpv"; // change to env variable in production

// ✅ MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://logeshkarnish:G0GWqnT5ZCqilTxh@cluster0.jpknhkc.mongodb.net/"
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Expense Schema (linked with userId)
const expenseSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Expense = mongoose.model("Expense", expenseSchema);

// ================== AUTH ================== //

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Middleware for protected routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    req.userId = decoded.userId;
    next();
  });
};

// ================== EXPENSES ================== //

// Add expense
app.post("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, userId: req.userId });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all expenses for logged-in user
app.get("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current month expenses
app.get("/api/expenses/current-month", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filter expenses by date range
app.get("/api/expenses/filter", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Both from and to dates required" });
    }

    const start = new Date(from);
    const end = new Date(to);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Total spent
app.get("/api/expenses/total", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    let start, end;

    if (from && to) {
      start = new Date(from);
      end = new Date(to);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const result = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({ total: result.length > 0 ? result[0].total : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update expense
app.patch("/api/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete expense
app.delete("/api/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================== START ================== //
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
