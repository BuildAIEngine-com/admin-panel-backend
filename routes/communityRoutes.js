const express = require("express");
const { createCommunity } = require("../controllers/communityController"); // ✅ Import correctly

const router = express.Router();

router.post("/", createCommunity); // ✅ Use the function correctly

module.exports = router;
