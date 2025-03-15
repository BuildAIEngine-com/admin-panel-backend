const express = require("express");
const router = express.Router();
const { createCommunity, addUserToCommunity, assignRole } = require("../controllers/communityController");

router.post("/create", createCommunity);
router.post("/add-user", addUserToCommunity);
router.put("/assign-role", assignRole);

module.exports = router;
