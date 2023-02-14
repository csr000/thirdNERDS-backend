"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const profileSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    platform: {
        type: String,
    },
    git: {
        type: String,
    },
    linkedIn: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Profile = (0, mongoose_1.model)("Profile", profileSchema);
exports.default = Profile;
//# sourceMappingURL=Profile.js.map