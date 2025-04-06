const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "default-avatar.png",
  },
  registerDate: {
    type: Date,
    default: Date.now,
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

// Calculate productivity score (0-100)
UserSchema.virtual("productivityScore").get(function () {
  if (this.totalTasks === 0 && this.totalGoals === 0) return 0

  const taskScore = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 50 : 0
  const goalScore = this.totalGoals > 0 ? (this.completedGoals / this.totalGoals) * 50 : 0

  return Math.round(taskScore + goalScore)
})

const User = mongoose.model("User", UserSchema)

module.exports = User