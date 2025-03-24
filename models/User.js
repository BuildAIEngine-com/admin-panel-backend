//community users Model
const mongoose = require("mongoose");

const communityUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { type: String, enum: ["Admin", "Member"], default: "Member" },
  status: { type: String, enum: ["Pending", "Active"], default: "Pending" }, // Pending = Invited, Active = Joined
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" }, // Which community they belong to
  mattermostUserId: { type: String }, // Store Mattermost user ID after registration
  joinedAt: { type: Date },
});

const CommunityUser = mongoose.model("CommunityUser", communityUserSchema);

module.exports = CommunityUser;
