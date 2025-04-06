const express = require("express")
const { ensureAuthenticated } = require("../middleware/auth")
const { upload } = require("../middleware/upload")
const User = require("../models/User")
const Task = require("../models/Task")
const Goal = require("../models/Goal")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

const router = express.Router()

// Profile page
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    // Get user stats
    const taskCount = await Task.countDocuments({ user: req.user.id })
    const completedTaskCount = await Task.countDocuments({
      user: req.user.id,
      completed: true,
    })

    const goalCount = await Goal.countDocuments({ user: req.user.id })
    const completedGoalCount = await Goal.countDocuments({
      user: req.user.id,
      completed: true,
    })

    // Calculate days since registration
    const registerDate = new Date(req.user.registerDate)
    const today = new Date()
    const daysSinceRegistration = Math.floor((today - registerDate) / (1000 * 60 * 60 * 24))

    res.render("profile/index", {
      title: "My Profile",
      user: req.user,
      taskCount,
      completedTaskCount,
      goalCount,
      completedGoalCount,
      daysSinceRegistration,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading profile")
    res.redirect("/dashboard")
  }
})

// Edit profile form
router.get("/edit", ensureAuthenticated, (req, res) => {
  res.render("profile/edit", {
    title: "Edit Profile",
    user: req.user,
  })
})

// Update profile - PUT
router.put("/", ensureAuthenticated, async (req, res) => {
  try {
    const { name, email } = req.body

    // Validate required fields
    if (!name || !email) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect("/profile/edit")
    }

    // Check if email is already taken (by another user)
    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      req.flash("error_msg", "Email is already in use")
      return res.redirect("/profile/edit")
    }

    // Update user
    await User.findByIdAndUpdate(req.user.id, {
      name,
      email,
    })

    req.flash("success_msg", "Profile updated successfully")
    res.redirect("/profile")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error updating profile")
    res.redirect("/profile/edit")
  }
})

// Change password form
router.get("/change-password", ensureAuthenticated, (req, res) => {
  res.render("profile/change-password", {
    title: "Change Password",
  })
})

// Change password - PUT
router.put("/change-password", ensureAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash("error_msg", "Please fill in all fields")
      return res.redirect("/profile/change-password")
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      req.flash("error_msg", "New passwords do not match")
      return res.redirect("/profile/change-password")
    }

    // Check if new password is long enough
    if (newPassword.length < 6) {
      req.flash("error_msg", "Password should be at least 6 characters")
      return res.redirect("/profile/change-password")
    }

    // Check if current password is correct
    const user = await User.findById(req.user.id)
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      req.flash("error_msg", "Current password is incorrect")
      return res.redirect("/profile/change-password")
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
    })

    req.flash("success_msg", "Password changed successfully")
    res.redirect("/profile")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error changing password")
    res.redirect("/profile/change-password")
  }
})

// Change avatar form
router.get("/change-avatar", ensureAuthenticated, (req, res) => {
  res.render("profile/change-avatar", {
    title: "Change Avatar",
  })
})

// Change avatar - POST
router.post("/change-avatar", ensureAuthenticated, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      req.flash("error_msg", err)
      return res.redirect("/profile/change-avatar")
    }

    if (!req.file) {
      req.flash("error_msg", "Please select an image")
      return res.redirect("/profile/change-avatar")
    }

    try {
      // Get current avatar
      const user = await User.findById(req.user.id)
      const currentAvatar = user.avatar

      // Delete old avatar if it's not the default
      if (currentAvatar !== "default-avatar.png") {
        const avatarPath = path.join(__dirname, "../public/uploads/", currentAvatar)

        // Check if file exists before deleting
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath)
        }
      }

      // Update user with new avatar
      await User.findByIdAndUpdate(req.user.id, {
        avatar: req.file.filename,
      })

      req.flash("success_msg", "Avatar updated successfully")
      res.redirect("/profile")
    } catch (err) {
      console.error(err)
      req.flash("error_msg", "Error updating avatar")
      res.redirect("/profile/change-avatar")
    }
  })
})

module.exports = router

