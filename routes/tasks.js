const express = require("express")
const { ensureAuthenticated } = require("../middleware/auth")
const Task = require("../models/Task")
const User = require("../models/User")
const Goal = require("../models/Goal")

const router = express.Router()

// Get all tasks
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 })

    // Separate tasks by type
    const routineTasks = tasks.filter((task) => task.type === "routine")
    const oneTimeTasks = tasks.filter((task) => task.type === "one-time")

    res.render("tasks/index", {
      title: "My Tasks",
      routineTasks,
      oneTimeTasks,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading tasks")
    res.redirect("/dashboard")
  }
})

// Add task form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("tasks/add", {
    title: "Add Task",
    categories: ["physical", "study", "work", "hobby", "personal", "other"],
  })
})

// Add task - POST
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    console.log("Request body:", req.body)

    const { title, description, category, type, frequency, time, dueDate } = req.body

    // Get days array if present
    let days = []
    if (req.body.days) {
      days = Array.isArray(req.body.days) ? req.body.days : [req.body.days]
    }

    console.log("Days array:", days)

    // Validate required fields
    if (!title || !category || !type) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect("/tasks/add")
    }

    // Validate type-specific required fields
    if (type === "routine" && (!frequency || !time)) {
      req.flash("error_msg", "Please fill in all required fields for routine tasks")
      return res.redirect("/tasks/add")
    }

    if (type === "one-time" && !dueDate) {
      req.flash("error_msg", "Please provide a due date for one-time tasks")
      return res.redirect("/tasks/add")
    }

    // Create new task
    const newTask = new Task({
      user: req.user.id,
      title,
      description,
      category,
      type,
    })

    // Add type-specific details
    if (type === "routine") {
      newTask.routineDetails = {
        frequency,
        time,
        days,
      }
    } else if (type === "one-time") {
      newTask.dueDate = new Date(dueDate)
    }

    await newTask.save()

    // Update user's total tasks count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalTasks: 1 },
    })

    req.flash("success_msg", "Task added successfully")
    res.redirect("/tasks")
  } catch (err) {
    console.error("Error adding task:", err)
    req.flash("error_msg", "Error adding task: " + err.message)
    res.redirect("/tasks/add")
  }
})

// Edit task form
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!task) {
      req.flash("error_msg", "Task not found")
      return res.redirect("/tasks")
    }

    res.render("tasks/edit", {
      title: "Edit Task",
      task,
      categories: ["physical", "study", "work", "hobby", "personal", "other"],
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading task")
    res.redirect("/tasks")
  }
})

// Update task - PUT
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, category, type, frequency, time, dueDate } = req.body

    // Get days array if present
    let days = []
    if (req.body.days) {
      days = Array.isArray(req.body.days) ? req.body.days : [req.body.days]
    }

    // Find task
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!task) {
      req.flash("error_msg", "Task not found")
      return res.redirect("/tasks")
    }

    // Update task
    task.title = title
    task.description = description
    task.category = category
    task.type = type

    if (type === "routine") {
      task.routineDetails = {
        frequency,
        time,
        days,
      }
      task.dueDate = undefined
    } else if (type === "one-time") {
      task.dueDate = new Date(dueDate)
      task.routineDetails = {
        frequency: null,
        time: null,
        days: [],
      }
    }

    await task.save()

    req.flash("success_msg", "Task updated successfully")
    res.redirect("/tasks")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error updating task")
    res.redirect("/tasks")
  }
})

// Mark task as complete - PATCH
router.patch("/:id/complete", ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!task) {
      req.flash("error_msg", "Task not found")
      return res.redirect("/tasks")
    }

    // Toggle completion status
    task.completed = !task.completed

    if (task.completed) {
      task.completedDate = new Date()

      // Update user's completed tasks count
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { completedTasks: 1 },
      })

      // Check if this task is part of any goals
      const goals = await Goal.find({
        user: req.user.id,
        "taskBasedDetails.tasks": task._id,
        completed: false,
      })

      // For each goal, check if all tasks are completed
      for (const goal of goals) {
        const taskIds = goal.taskBasedDetails.tasks
        const tasks = await Task.find({
          _id: { $in: taskIds },
        })

        const allCompleted = tasks.every((t) => t.completed)

        if (allCompleted) {
          goal.completed = true
          goal.completedDate = new Date()
          await goal.save()

          // Update user's completed goals count
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { completedGoals: 1 },
          })
        }
      }
    } else {
      task.completedDate = undefined

      // Decrement user's completed tasks count
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { completedTasks: -1 },
      })
    }

    await task.save()

    req.flash("success_msg", `Task marked as ${task.completed ? "completed" : "incomplete"}`)
    res.redirect("/tasks")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error updating task")
    res.redirect("/tasks")
  }
})

// Delete task - DELETE
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!task) {
      req.flash("error_msg", "Task not found")
      return res.redirect("/tasks")
    }

    // Remove task from any goals
    await Goal.updateMany({ "taskBasedDetails.tasks": task._id }, { $pull: { "taskBasedDetails.tasks": task._id } })

    // Delete task
    await Task.deleteOne({ _id: task._id })

    // Update user's task counts
    const updateQuery = { $inc: { totalTasks: -1 } }
    if (task.completed) {
      updateQuery.$inc.completedTasks = -1
    }

    await User.findByIdAndUpdate(req.user.id, updateQuery)

    req.flash("success_msg", "Task removed")
    res.redirect("/tasks")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error removing task")
    res.redirect("/tasks")
  }
})

module.exports = router

