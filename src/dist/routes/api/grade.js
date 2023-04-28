"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const Grade_1 = __importDefault(require("../../models/Grade"));
const Assessment_1 = __importDefault(require("../../models/Assessment"));
const utils_1 = require("./utils");
const router = (0, express_1.Router)();
// @route   PUT api/grades
// @desc    Create or update user's enrolledcourse
// @access  Private
router.put("/:lessonId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res
            .status(http_status_codes_1.default.BAD_REQUEST)
            .json({ errors: errors.array() });
    }
    try {
        const moduleId = req.body.moduleId;
        const lessonId = req.body.lessonId;
        // const mcq = req.body.mcq;
        // const theory = req.body.theory;
        const grade = yield Grade_1.default.findOneAndUpdate({ user: req.userId, moduleId, lessonId }, { moduleId, lessonId }, { new: true, upsert: true });
        res.json(grade);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   GET api/grades
// @desc    Get all grades
// @access  Public
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const grades = yield Grade_1.default.find();
        res.json(grades);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   POST api/grades
// @desc    Create grade and assign it to user
// @access  Public
router.post("/", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const grades: IGrade[] = await Grade.find();
        // res.json(grades);
        const quiz = JSON.parse(req.body.quiz);
        const lessonId = quiz.lessonId;
        const moduleId = quiz.moduleId;
        console.log("aa ", lessonId, moduleId);
        const incomingMcq = quiz.mcq;
        const questionsFromDB = yield Assessment_1.default.findOne({ lessonId }, { mcq: 1 });
        const mcqFromDB = questionsFromDB.mcq;
        // console.log("incomingMcq ", incomingMcq);
        // console.log("mcqFromDB ", mcqFromDB);
        const { approved, incomingMCQs } = (0, utils_1.compareMCQs)(incomingMcq, mcqFromDB);
        console.log("req.userId ", req.userId);
        if (approved) {
            yield Grade_1.default.findOneAndUpdate({ user: req.userId, moduleId, lessonId }, { user: req.userId, moduleId, lessonId, approved }, { upsert: true });
        }
        res.json(incomingMCQs);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   GET api/grades/:userId
// @desc    Get grade by userId
// @access  Public
router.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const grade = yield Grade_1.default.findOne({
            user: req.params.userId,
        }).populate("user", ["email"]);
        res.json(grade);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// // @route   DELETE api/enrolledcourse
// // @desc    Delete enrolledcourse and user
// // @access  Private
// router.delete("/", auth, async (req: Request, res: Response) => {
//   try {
//     // Remove enrolledcourse
//     await EnrolledCourse.findOneAndRemove({ user: req.userId });
//     // Remove user
//     await User.findOneAndRemove({ _id: req.userId });
//     res.json({ msg: "User removed" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });
exports.default = router;
//# sourceMappingURL=grade.js.map