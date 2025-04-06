const mongoose = require("mongoose")

// Goal Schema
const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user who owns the goal
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true, // Goal must have a title
  },
  description: {
    type: String, // Optional description for the goal
  },
  type: {
    type: String,
    required: true,
    enum: ["task-based", "one-time"], // Two types of goals allowed
  },

  // Details specific to "task-based" goals
  taskBasedDetails: {
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId, // Linked task IDs
        ref: "Task",
      },
    ],
    targetDate: {
      type: Date, // Optional target date to complete the goal
    },
  },

  // For one-time goals (not linked to tasks)
  dueDate: {
    type: Date,
  },

  // Completion status
  completed: {
    type: Boolean,
    default: false,
  },
  completedDate: {
    type: Date,
  },

  // Automatically add creation date
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Goal = mongoose.model("Goal", GoalSchema)
module.exports = Goal
