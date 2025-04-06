const express = require("express")
const { ensureAuthenticated } = require("../middleware/auth")
const Goal = require("../models/Goal")
const Task = require("../models/Task")
const User = require("../models/User")

const router = express.Router()

// Get all goals
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).populate("taskBasedDetails.tasks").sort({ createdAt: -1 })

    // Separate goals by type and completion status
    const activeGoals = goals.filter((goal) => !goal.completed)
    const completedGoals = goals.filter((goal) => goal.completed)

    res.render("goals/index", {
      title: "My Goals",
      activeGoals,
      completedGoals,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading goals")
    res.redirect("/dashboard")
  }
})

// Add goal form
router.get("/add", ensureAuthenticated, async (req, res) => {
  try {
    // Get user's tasks for task-based goals
    const tasks = await Task.find({
      user: req.user.id,
      completed: false,
    })

    res.render("goals/add", {
      title: "Add Goal",
      tasks,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading form")
    res.redirect("/goals")
  }
})

// Add goal - POST
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, type, tasks, targetDate, dueDate } = req.body

    // Validate required fields
    if (!title || !type) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect("/goals/add")
    }

    // Validate type-specific required fields
    if (type === "task-based" && (!tasks || !targetDate)) {
      req.flash("error_msg", "Please select tasks and target date for task-based goals")
      return res.redirect("/goals/add")
    }

    if (type === "one-time" && !dueDate) {
      req.flash("error_msg", "Please provide a due date for one-time goals")
      return res.redirect("/goals/add")
    }

    // Create new goal
    const newGoal = new Goal({
      user: req.user.id,
      title,
      description,
      type,
    })

    // Add type-specific details
    if (type === "task-based") {
      // Convert tasks to array if it's a single value
      const taskArray = Array.isArray(tasks) ? tasks : [tasks]

      newGoal.taskBasedDetails = {
        tasks: taskArray,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      }
    } else if (type === "one-time") {
      newGoal.dueDate = dueDate ? new Date(dueDate) : undefined
    }

    await newGoal.save()

    // Update user's total goals count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalGoals: 1 },
    })

    req.flash("success_msg", "Goal added successfully")
    res.redirect("/goals")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error adding goal")
    res.redirect("/goals/add")
  }
})

// Edit goal form
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("taskBasedDetails.tasks")

    if (!goal) {
      req.flash("error_msg", "Goal not found")
      return res.redirect("/goals")
    }

    // Get user's tasks for task-based goals
    const tasks = await Task.find({
      user: req.user.id,
      completed: false,
    })

    res.render("goals/edit", {
      title: "Edit Goal",
      goal,
      tasks,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading goal")
    res.redirect("/goals")
  }
})

// Update goal - PUT
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, type, tasks, targetDate, dueDate } = req.body

    // Validate required fields
    if (!title || !type) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect(`/goals/edit/${req.params.id}`)
    }

    // Validate type-specific required fields
    if (type === "task-based" && (!tasks || !targetDate)) {
      req.flash("error_msg", "Please select tasks and target date for task-based goals")
      return res.redirect(`/goals/edit/${req.params.id}`)
    }

    if (type === "one-time" && !dueDate) {
      req.flash("error_msg", "Please provide a due date for one-time goals")
      return res.redirect(`/goals/edit/${req.params.id}`)
    }

    // Find goal
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!goal) {
      req.flash("error_msg", "Goal not found")
      return res.redirect("/goals")
    }

    // Update goal
    goal.title = title
    goal.description = description
    goal.type = type

    if (type === "task-based") {
      // Convert tasks to array if it's a single value
      const taskArray = Array.isArray(tasks) ? tasks : tasks ? [tasks] : []

      goal.taskBasedDetails = {
        tasks: taskArray,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      }
      goal.dueDate = undefined
    } else if (type === "one-time") {
      goal.dueDate = dueDate ? new Date(dueDate) : undefined
      goal.taskBasedDetails = {
        tasks: [],
        targetDate: undefined,
      }
    }

    await goal.save()

    req.flash("success_msg", "Goal updated successfully")
    res.redirect("/goals")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error updating goal")
    res.redirect("/goals")
  }
})

// Mark goal as complete - PATCH
router.patch("/:id/complete", ensureAuthenticated, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!goal) {
      req.flash("error_msg", "Goal not found")
      return res.redirect("/goals")
    }

    // Toggle completion status
    goal.completed = !goal.completed

    if (goal.completed) {
      goal.completedDate = new Date()

      // Update user's completed goals count
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { completedGoals: 1 },
      })
    } else {
      goal.completedDate = undefined

      // Decrement user's completed goals count
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { completedGoals: -1 },
      })
    }

    await goal.save()

    req.flash("success_msg", `Goal marked as ${goal.completed ? "completed" : "incomplete"}`)
    res.redirect("/goals")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error updating goal")
    res.redirect("/goals")
  }
})

// Delete goal - DELETE
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!goal) {
      req.flash("error_msg", "Goal not found")
      return res.redirect("/goals")
    }

    // Delete goal
    await Goal.deleteOne({ _id: goal._id })

    // Update user's goal counts
    const updateQuery = { $inc: { totalGoals: -1 } }
    if (goal.completed) {
      updateQuery.$inc.completedGoals = -1
    }

    await User.findByIdAndUpdate(req.user.id, updateQuery)

    req.flash("success_msg", "Goal removed")
    res.redirect("/goals")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error removing goal")
    res.redirect("/goals")
  }
})

module.exports = router

