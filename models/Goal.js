const mongoose = require("mongoose")

const GoalSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ["task-based", "one-time"],
  },
  // For task-based goals
  taskBasedDetails: {
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    targetDate: {
      type: Date,
    },
  },
  // For one-time goals
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

const Goal = mongoose.model("Goal", GoalSchema)

module.exports = Goal