require("dotenv").config(); // Load environment variables
const axios = require("axios");
const Community = require("../models/Community");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const MATTERMOST_BASE_URL = process.env.MATTERMOST_URL;
const MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN;

console.log("✅ Mattermost API URL:", process.env.MATTERMOST_URL);
console.log("✅ Mattermost Token:", process.env.MATTERMOST_TOKEN ? "Loaded" : "Missing");


// =====================✅ Get User's Communities-------------------------------------------------------------
exports.getUserCommunities = async (req, res) => {
  try {
    const { userId } = req.query; // Or extract from req.user if using auth middleware
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const userCommunities = await Community.find({ members: userId });
    res.status(200).json(userCommunities);
  } catch (error) {
    console.error("Error fetching user communities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------✅ Create a Community---------------------------------------------


exports.createCommunity = async (req, res) => {
  console.log("📥 Received Request Body:", req.body);

  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required" });
  }

  try {
    // ✅ Create Mattermost Team
    const response = await axios.post(
      `${process.env.MATTERMOST_URL}/teams`,
      { name, display_name: name, description, type: "O" },
      { headers: { Authorization: `Bearer ${process.env.MATTERMOST_TOKEN}`, "Content-Type": "application/json" } }
    );

    const mattermostTeamId = response.data.id; // Get the Mattermost Team ID
    console.log("✅ Mattermost Team Created:", mattermostTeamId);

    // ✅ Save Community in MongoDB
    const newCommunity = new Community({
      name,
      description,
      mattermostTeamId, // Save Mattermost ID
      members: [], // Initialize empty members list
    });

    await newCommunity.save(); // Save in MongoDB
    console.log("✅ Community saved in MongoDB");

    res.status(201).json(newCommunity);
  } catch (error) {
    console.error("❌ Error creating community:", error?.response?.data || error.message);
    res.status(500).json({ message: "Failed to create community" });
  }
};




//------------------------- ✅ Get All Communities-----------------------------------------
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ message: "Failed to fetch communities" });
  }
};





//----------------- ✅ Delete a Community-------------------------------------------
exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    try {
      await axios.delete(`${MATTERMOST_BASE_URL}/teams/${community.mattermostTeamId}`, {
        headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}` },
      });
    } catch (error) {
      console.error("Error deleting Mattermost team:", error.response?.data || error.message);
      return res.status(500).json({ message: "Failed to delete community from Mattermost" });
    }

    await Community.findByIdAndDelete(id);
    res.json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ message: "Server error" });
  }
};
