
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const communityRoutes = require("./routes/communityRoutes");

const app = express();

// 🛠 Enable CORS
app.use(cors({
  origin: "http://localhost:5173",  // Allow requests from frontend
  credentials: true,  // Allow cookies and authentication headers
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allowed HTTP methods
}));

dotenv.config();
// Connect Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/communities", communityRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
