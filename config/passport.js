const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
const User = require("../models/User")

function configurePassport() {
  // Set up Passport Local Strategy (email & password login)
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ email })

        if (!user) {
          return done(null, false, { message: "That email is not registered" })
        }

        // Compare input password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
          return done(null, user) // Login success
        } else {
          return done(null, false, { message: "Password incorrect" }) // Wrong password
        }
      } catch (err) {
        console.error(err)
        return done(err)
      }
    }),
  )

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (err) {
      done(err, null)
    }
  })
}

module.exports = configurePassport
