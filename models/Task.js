const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the owner of the task
    required: true,
  },
  title: {
    type: String,
    required: true, // Task must have a title
  },
  description: {
    type: String, // Optional task description
  },
  category: {
    type: String,
    required: true,
    enum: ["physical", "study", "work", "hobby", "personal", "other"], // Predefined categories
  },
  type: {
    type: String,
    required: true,
    enum: ["routine", "one-time"], // Defines task nature
  },

  // Routine task-specific fields
  routineDetails: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", null],
    },
    time: String, // Preferred time of day
    days: [String], // Days of the week (e.g., ["monday", "wednesday"])
  },

  // One-time task due date
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
