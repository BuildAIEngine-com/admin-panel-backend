require("dotenv").config(); // Load environment variables
const axios = require("axios");
const Community = require("../models/Community");
//const User = require("../models/User");

const MATTERMOST_BASE_URL = process.env.MATTERMOST_URL;
const MATTERMOST_TOKEN = process.env.MATTERMOST_TOKEN;

console.log("✅ Mattermost API URL:", MATTERMOST_BASE_URL);
console.log("✅ Mattermost Token:", MATTERMOST_TOKEN ? "Loaded" : "Missing");

// =====================✅ Get User's Communities-------------------------------------------------------------
exports.getUserCommunities = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const userCommunities = await Community.find({ owner: userId });
    res.status(200).json(userCommunities);
  } catch (error) {
    console.error("Error fetching user communities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------✅ Create a Community---------------------------------------------
exports.createCommunity = async (req, res) => {
  console.log("📥 Received Request Body:", req.body);

  const { userId, name, description } = req.body;
  if (!userId || !name || !description) {
    return res.status(400).json({ message: "User ID, name, and description are required" });
  }

  try {
    // ✅ Check if the user already owns a community
    const existingCommunity = await Community.findOne({ owner: userId });
    if (existingCommunity) {
      return res.status(400).json({ message: "You can only create one community." });
    }

    // ✅ Create Mattermost Team
    const response = await axios.post(
      `${MATTERMOST_BASE_URL}/teams`,
      { name, display_name: name, description, type: "O" },
      { headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}`, "Content-Type": "application/json" } }
    );

    const mattermostTeamId = response.data.id;
    console.log("✅ Mattermost Team Created:", mattermostTeamId);

    // ✅ Save Community in MongoDB
    const newCommunity = new Community({
      owner: userId, // Assign the owner
      name,
      description,
      mattermostTeamId,
      members: [{ userId, role: "Admin" }], // Add creator as Admin
    });

    await newCommunity.save();
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
    console.log("🛑 Received delete request for community ID:", id); // Debugging log

    // Fetch the community to get the Mattermost team ID
    const community = await Community.findById(id);
    if (!community) {
      console.log(`❌ Community with ID ${id} not found.`);
      return res.status(404).json({ message: "Community not found" });
    }

    const mattermostTeamId = community.mattermostTeamId; // Ensure this is stored

    // Step 1: Delete from Mattermost
    if (mattermostTeamId) {
      try {
        await axios.delete(`${MATTERMOST_BASE_URL}/teams/${mattermostTeamId}`, {
          headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}` },
        });
        console.log(`✅ Successfully deleted Mattermost team: ${mattermostTeamId}`);
      } catch (mmError) {
        console.error(`❌ Error deleting Mattermost team ${mattermostTeamId}:`, mmError.response?.data || mmError.message);
        return res.status(500).json({ message: "Failed to delete Mattermost team" });
      }
    }

    // Step 2: Delete from MongoDB
    await Community.findByIdAndDelete(id);
    console.log(`✅ Successfully deleted community from database: ${id}`);

    res.json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting community:", error);
    res.status(500).json({ message: "Error deleting community" });
  }
};



// ---------------------------✅ Discover Communities------------------------
//const Community = require("../models/Community");

exports.getDiscoverCommunities = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Fetch all communities except the ones owned by the user
    const communities = await Community.find({ ownerId: { $ne: userId } });

    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching communities", error });
  }
};



//------------------------join community---------------------------------

// const axios = require("axios");
// const Community = require("../models/Community");
// const User = require("../models/User");
const User = require("../models/userModel");







exports.joinCommunity = async (req, res) => {
  const { userId, communityId } = req.body;
  console.log("📡 Join Request Received for:", { userId, communityId });

  if (!userId || !communityId) {
    return res.status(400).json({ message: "User ID and Community ID are required" });
  }

  try {
    // Fetch user from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.joinedCommunities) {
      user.joinedCommunities = [];
    }

    // Fetch community from MongoDB
    const community = await Community.findById(communityId);
    if (!community) {
      console.log("❌ Community not found:", communityId);
      return res.status(404).json({ message: "Community not found" });
    }

    if (user.joinedCommunities.length >= 10) {
      return res.status(403).json({ message: "You can only join up to 10 communities." });
    }

    if (user.joinedCommunities.includes(communityId)) {
      return res.status(400).json({ message: "You are already a member of this community." });
    }

    // 🛑 Fetch Mattermost Team ID from the community schema
    const mattermostTeamId = community.mattermostTeamId;
    if (!mattermostTeamId) {
      console.log("❌ Mattermost Team ID missing for community:", communityId);
      return res.status(500).json({ message: "Mattermost Team ID not found for this community" });
    }

    // 🛑 STEP 1: Check if user exists in Mattermost
    let mattermostUserId;
    try {
      const { data } = await axios.get(
        `${MATTERMOST_BASE_URL}/users/email/${user.email}`,
        { headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}` } }
      );
      mattermostUserId = data.id;
      console.log("✅ Mattermost user found:", mattermostUserId);
    } catch (err) {
      // If user is not found, create them
      console.log("⚠️ User not found in Mattermost. Creating...");
      try {
        const { data: newUser } = await axios.post(
          `${MATTERMOST_BASE_URL}/users`,
          {
            email: user.email,
            username: user.username,
            password: "Admin123", // Generate a strong password
          },
          { headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}` } }
        );
        mattermostUserId = newUser.id;
        console.log("✅ Mattermost user created:", mattermostUserId);
      } catch (createError) {
        console.error("❌ Error creating Mattermost user:", createError.message);
        return res.status(500).json({ message: "Failed to create Mattermost user" });
      }
    }

    // 🛑 STEP 2: Add user to the Mattermost team
    try {
      await axios.post(
        `${MATTERMOST_BASE_URL}/teams/${mattermostTeamId}/members`,
        { team_id: mattermostTeamId, user_id: mattermostUserId },
        { headers: { Authorization: `Bearer ${MATTERMOST_TOKEN}` } }
      );
      console.log(`✅ User ${mattermostUserId} added to Mattermost team: ${mattermostTeamId}`);
    } catch (teamError) {
      console.error("❌ Error adding user to Mattermost team:", teamError.message);
      return res.status(500).json({ message: "Failed to add user to Mattermost team" });
    }

    // 🛑 STEP 3: Add user to community in MongoDB
    user.joinedCommunities.push(communityId);
    await user.save();

    if (!community.members) {
      community.members = [];
    }
    community.members.push({ userId, role: "Member" });
    await community.save();

    console.log("✅ User successfully joined the community:", communityId);
    return res.status(200).json({ message: "Joined successfully", community });
  } catch (error) {
    console.error("❌ Error in joinCommunity:", error.stack);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

