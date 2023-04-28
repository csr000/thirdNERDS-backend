"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const lessonSchema = new mongoose_1.Schema({
    title: String,
    content: String,
    objectives: String,
    overview: String,
    keyTerms: String,
});
const moduleSchema = new mongoose_1.Schema({
    moduleName: String,
    lessons: [lessonSchema],
});
const courseSchema = new mongoose_1.Schema({
    courseName: String,
    modules: [moduleSchema],
});
const Course = (0, mongoose_1.model)("Course", courseSchema);
exports.default = Course;
//# sourceMappingURL=Course.js.map