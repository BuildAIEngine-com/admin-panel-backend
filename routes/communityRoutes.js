const express = require("express");
const {
  createCommunity,
  getAllCommunities,
  deleteCommunity,
  getUserCommunities,
  getDiscoverCommunities,
  joinCommunity
} = require("../controllers/communityController");

const router = express.Router();

// ✅ Create a new community
router.post("/", createCommunity);

// ✅ Get all communities
router.get("/", getAllCommunities);

// ✅ Get user-specific communities (Fix: Now uses query params instead of URL params)
router.get("/user", getUserCommunities);

// ✅ Delete a community by ID
router.delete("/:id", deleteCommunity);

// dicover routes
router.get("/discover/:userId", getDiscoverCommunities);

// join community
router.post("/join", joinCommunity);



module.exports = router;
