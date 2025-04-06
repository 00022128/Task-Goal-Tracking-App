const express = require("express");
const { ensureAuthenticated } = require("../middleware/auth");
const Task = require("../models/Task");
const Goal = require("../models/Goal");

const router = express.Router();

// Home page
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  res.render("index", { title: "Task & Goal Tracker" });
});

// Dashboard
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    // Define current day boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Today's tasks
    const todayTasks = await Task.find({
      user: req.user.id,
      $or: [
        {
          type: "one-time",
          dueDate: { $gte: today, $lte: endOfToday },
          completed: false,
        },
        {
          type: "routine",
          completed: false,
        },
      ],
    });

    // Upcoming one-time tasks (after today)
    const upcomingTasks = await Task.find({
      user: req.user.id,
      type: "one-time",
      dueDate: { $gt: endOfToday, $lte: nextWeek },
      completed: false,
    }).sort({ dueDate: 1 });

    //Active goals
    const activeGoals = await Goal.find({
      user: req.user.id,
      completed: false,
    }).sort({ dueDate: 1 });

    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,
      todayTasks,
      upcomingTasks,
      activeGoals,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error loading dashboard");
    res.redirect("/");
  }
});

module.exports = router;
