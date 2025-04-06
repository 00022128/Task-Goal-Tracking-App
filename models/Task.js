const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ["physical", "study", "work", "hobby", "personal", "other"],
  },
  type: {
    type: String,
    required: true,
    enum: ["routine", "one-time"],
  },
  // For routine tasks
  routineDetails: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", null],
    },
    time: String,
    days: [String], // Array of days of the week
  },
  // For one-time tasks
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Task = mongoose.model("Task", TaskSchema)

module.exports = Task