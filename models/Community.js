const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  mattermostTeamId: { type: String, required: true }, // Store Mattermost team ID
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Community", CommunitySchema);
