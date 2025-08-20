const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://logeshkarnish:Logeshpv%402001@cluster0.jpknhkc.mongodb.net/"
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const expenseSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  date: String,
  date: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", expenseSchema);

app.post("/api/expenses", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get("/api/expenses", async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // e.g. 2025-08-01
//     const endOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59
//     ); // e.g. 2025-08-31 23:59:59

//     const expenses = await Expense.find({
//       date: { $gte: startOfMonth, $lte: endOfMonth },
//     }).sort({ date: -1 });

//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.patch("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
    });
    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
