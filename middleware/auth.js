// Authentication middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash("error_msg", "Please log in to view this resource")
    res.redirect("/auth/login")
  }
  
  // Guest middleware (for login/register pages)
  const forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect("/dashboard")
  }
  
  module.exports = {
    ensureAuthenticated,
    forwardAuthenticated,
  }
  
  