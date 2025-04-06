const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const methodOverride = require("method-override")
const flash = require("connect-flash")
const passport = require("passport")

// Routes
const indexRoutes = require("./routes/index")
const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/tasks")
const goalRoutes = require("./routes/goals")
const profileRoutes = require("./routes/profile")

// Load environment variables
dotenv.config()

// Initialize Express
const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅MongoDB Connected"))
  .catch((err) => console.error("❌MongoDB Connection Error:", err))

// Set up view engine
app.set("view engine", "pug")
app.set("views", "./views")

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))

// Static files
app.use(express.static(path.join(__dirname, "public")))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    },
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Flash messages
app.use(flash())

// Global variables
app.use((req, res, next) => {
  res.locals.user = req.user || null
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  next()
})

// Configure passport
require("./config/passport")()

// Routes
app.use("/", indexRoutes)
app.use("/auth", authRoutes)
app.use("/tasks", taskRoutes)
app.use("/goals", goalRoutes)
app.use("/profile", profileRoutes)

// Error handling
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 - Page Not Found",
    message: "The page you are looking for does not exist.",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})

module.exports = app

