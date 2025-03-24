const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    mattermostTeamId: { type: String, required: true, unique: true }, // Ensuring uniqueness
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["Admin", "Member"], default: "Member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Adds createdAt & updatedAt automatically
);

// Indexing for better performance
communitySchema.index({ mattermostTeamId: 1 });

module.exports = mongoose.model("Community", communitySchema);
