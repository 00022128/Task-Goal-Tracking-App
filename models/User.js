const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // User's full name
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email must be unique
  },
  password: {
    type: String,
    required: true, // Hashed password
  },
  avatar: {
    type: String,
    default: "default-avatar.png", // Default avatar if none is uploaded
  },
  registerDate: {
    type: Date,
    default: Date.now, // Auto-set registration timestamp
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
  completedGoals: {
    type: Number,
    default: 0,
  },
  totalTasks: {
    type: Number,
    default: 0,
  },
  totalGoals: {
    type: Number,
    default: 0,
  },
})

// Virtual field to calculate productivity as a percentage
UserSchema.virtual("productivityScore").get(function () {
  if (this.totalTasks === 0 && this.totalGoals === 0) return 0

  const taskScore = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 50 : 0
  const goalScore = this.totalGoals > 0 ? (this.completedGoals / this.totalGoals) * 50 : 0

  return Math.round(taskScore + goalScore)
})

const User = mongoose.model("User", UserSchema)
module.exports = User
