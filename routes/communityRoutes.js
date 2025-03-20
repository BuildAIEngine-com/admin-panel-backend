const express = require("express");
const { createCommunity,getAllCommunities,deleteCommunity } = require("../controllers/communityController"); // ✅ Import correctly

const router = express.Router();

// ✅ Route to create a new community
router.post("/", createCommunity);

// ✅ Route to fetch all communities
router.get("/", getAllCommunities);

 // Delete community by ID
 router.delete("/:id", (req, res, next) => {
    console.log("DELETE request received for:", req.params.id);
    next();
  }, deleteCommunity);
  

module.exports = router;
