const express = require("express");
const {
  createCommunity,
  getAllCommunities,
  deleteCommunity,
  getUserCommunities,
} = require("../controllers/communityController");

const router = express.Router();

// ✅ Create a new community
router.post("/:id", createCommunity);

// ✅ Get all communities
router.get("/", getAllCommunities);

// ✅ Get user-specific communities
router.get("/user/:id", getUserCommunities);


// ✅ Delete a community by ID
router.delete("/:id", deleteCommunity);





module.exports = router;
