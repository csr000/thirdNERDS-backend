"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const gradeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    moduleId: { type: mongoose_1.Schema.Types.ObjectId },
    lessonId: { type: mongoose_1.Schema.Types.ObjectId },
    approved: { type: Boolean },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Grade = (0, mongoose_1.model)("Grade", gradeSchema);
exports.default = Grade;
// {
//   lessonId: String,
//   score: {
//     mcq: String,
//     theory: String,
//   }
//# sourceMappingURL=Grade.js.map