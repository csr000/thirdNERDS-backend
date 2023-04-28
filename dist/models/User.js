"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    permission: {
        type: String,
        required: true,
    },
    enrolledCourse: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "EnrolledCourse",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map