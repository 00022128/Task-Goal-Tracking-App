# Goal Tracker App

## About the Application

**Goal Tracker App** is a web application designed to help users set, manage, and track personal or professional goals. It allows users to create tasks and goals, monitor their progress, and manage profiles.

**Note: This project was created as part of the Web Technology module at WIUT and is intended solely for educational purposes.**

## Links

- GitHub Repository: [https://github.com/00022128/Task-Goal-Tracking-App](https://github.com/00022128/Task-Goal-Tracking-App)
- Hosted Application: https://task-goal-tracking-app.onrender.com

## How to Run the Application Locally

### Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (local or Atlas)

### Step-by-Step Installation Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/00022128/Task-Goal-Tracking-App.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd Task-Goal-Tracking-App
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Create environment variables file**

   Create a `.env` file in the root folder with the following values:

   ```env
   PORT=3000
   MONGO_URI= mongodb+srv://Scorpiii:Scorpionboy0@cluster0.matu6nl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=00022128
   ```

5. **Start the application in development**

   ```bash
   npm run dev
   ```

   This will start the application with nodemon for live reload.

6. **Access the application**

   Open your browser and go to:

   [http://localhost:3000](http://localhost:3000)

7. **Test accounts**

   *Email = 00022128@wiut.uz
    Password = AD0616352*

## Application Dependencies

### Main Dependencies

- **bcryptjs** – Password hashing
- **connect-flash** – Flash messages for UI feedback
- **connect-mongo** – Session storage in MongoDB
- **dotenv** – Loads environment variables
- **express** – Web server and routing
- **express-session** – Session management
- **method-override** – Enables PUT/DELETE in forms
- **mongoose** – MongoDB object modeling
- **multer** – File uploading middleware
- **passport** – Authentication framework
- **passport-local** – Local strategy for Passport
- **pug** – View templating engine

### Development Dependencies

- **nodemon** – Automatically restarts server on code changes

## Project Structure

```plaintext
goal-tracker-app/
├── public/               # Static files (CSS, client-side JS)
├── routes/               # All route handlers
├── views/                # Pug templates
├── models/               # Mongoose schemas
├── config/               # Passport configuration
├── app.js                # Main application entry point
├── .env                  # Environment config
├── package.json          # Dependency definitions
└── README.md             # Project documentation
```

## Features

- **User Registration & Login**
- **Session-based Authentication with Passport**
- **Create, Edit, Delete Tasks & Goals**
- **Track Progress and View Stats**
- **Filter Goals by Deadline or Status**
- **Flash Messaging and Error Handling**
- **Responsive UI using Pug Templates**


# NOTE
Please note that, Render was used to host this web application on it's "free tier". For that reason, responses from the website might be delayed up to 50 seconds