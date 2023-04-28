"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assessmentSchema = new mongoose_1.Schema({
    moduleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    lessonId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    mcq: {
        type: [
            {
                question: String,
                options: { a: String, b: String, c: String, d: String },
                answer: String,
            },
        ],
    },
    theory: {
        type: String,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});
const Assessment = (0, mongoose_1.model)("Assessment", assessmentSchema);
exports.default = Assessment;
//# sourceMappingURL=Assessment.js.map