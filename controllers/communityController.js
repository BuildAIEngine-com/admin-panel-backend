require("dotenv").config(); // Load environment variables
const axios = require("axios");


// Use environment variables for security
const MATTERMOST_URL = process.env.MATTERMOST_URI || "https://mattermost.buildaiengine.com/api/v4";
const MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN; // Store this in .env file

if (!MATTERMOST_TOKEN) {
  console.error("❌ MATTERMOST_TOKEN is missing. Please check your .env file.");
  process.exit(1); // Stop execution if token is missing
}

// ✅ Create a new community

const Community = require("../models/Community");

exports.createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Mattermost API details
    const MATTERMOST_URL = process.env.MATTERMOST_URI || "https://mattermost.buildaiengine.com/api/v4";
    const MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN; // Store this in .env file

    // Create a Mattermost team
    const response = await axios.post(
      `${MATTERMOST_URL}/teams`,
      {
        name: name.toLowerCase().replace(/\s+/g, "-"), // Convert name to slug
        display_name: name,
        type: "O", // 'O' for open, 'I' for invite-only
      },
      {
        headers: {
          Authorization: `Bearer ${MATTERMOST_TOKEN}`,
        },
      }
    );

    const mattermostTeamId = response.data.id; // Store Mattermost team ID

    // Create community in MongoDB with Mattermost team ID
    const newCommunity = new Community({
      name,
      description,
      mattermostTeamId,
    });
    console.log("New Community Created:", newCommunity); // Debug log

    await newCommunity.save();
    console.log("New Community Created:", newCommunity); // Debug log
    res.status(201).json(newCommunity);
  } catch (error) {
    console.error("Error creating community:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create community" });
  }
};





// ✅ Fetch all communities


exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find(); // ✅ Ensure this is correct
    res.json(communities);
  } catch (err) {
    console.error("Error fetching communities:", err);
    res.status(500).json({ message: "Failed to fetch communities" });
  }
};







exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting community with ID:", id);

    // Find the community in the database
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

// Use environment variables for security
const MATTERMOST_URL = process.env.MATTERMOST_URI || "https://mattermost.buildaiengine.com/api/v4";
const MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN; // Store this in .env file

    // Attempt to delete from Mattermost
    try {
      const response = await axios.delete(
        `${MATTERMOST_URL}/teams/${community.mattermostTeamId}`, // Use the stored Mattermost team ID
        {
          headers: {
            Authorization: `Bearer ${MATTERMOST_TOKEN}`,
          },
        }
      );
      console.log("Mattermost team deleted:", response.data);
    } catch (error) {
      console.error("Error deleting Mattermost team:", error.response?.data || error.message);
      return res.status(500).json({ message: "Failed to delete community from Mattermost" });
    }

    // Delete from MongoDB
    await Community.findByIdAndDelete(id);

    res.json({ message: "Community deleted successfully from both DB and Mattermost" });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ message: "Server error" });
  }
};

