require("dotenv").config(); // Load environment variables
const axios = require("axios");

// Use environment variables for security
const MATTERMOST_URL = process.env.MATTERMOST_URL || "https://mattermost.buildaiengine.com/api/v4";
const MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN; // Store this in .env file

if (!MATTERMOST_TOKEN) {
  console.error("❌ MATTERMOST_TOKEN is missing. Please check your .env file.");
  process.exit(1); // Stop execution if token is missing
}

exports.createCommunity = async (req, res) => {
  const { name, description } = req.body;

  try {
    console.log("📤 Creating Mattermost Community:", name);

    const response = await axios.post(
      `${MATTERMOST_URL}/teams`,
      {
        name: name.toLowerCase().replace(/\s+/g, "-"), // Convert to valid team ID
        display_name: name,
        type: "O", // "O" = Open team, "I" = Invite-only
      },
      {
        headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}` },
      }
    );

    console.log("✅ Mattermost Response:", response.data);
    res.status(201).json(response.data);
  } catch (error) {
    console.error("❌ Mattermost API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || "Failed to create community" });
  }
};
