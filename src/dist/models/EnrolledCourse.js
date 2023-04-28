"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enrolledCourseSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    enrolledCourses: {
        type: Array,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const EnrolledCourse = (0, mongoose_1.model)("EnrolledCourse", enrolledCourseSchema);
exports.default = EnrolledCourse;
//# sourceMappingURL=EnrolledCourse.js.map