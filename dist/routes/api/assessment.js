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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const Assessment_1 = __importDefault(require("../../models/Assessment"));
const utils_1 = require("../../utils");
const router = (0, express_1.Router)();
// // @route   GET api/enrolledcourse/me
// // @desc    Get current user's enrolledcourses
// // @access  Private
// router.get("/me", auth, async (req: Request, res: Response) => {
//   try {
//     const enrolledcourse: IEnrolledCourse = await EnrolledCourse.findOne({
//       user: req.userId,
//     }).populate("enrolledCourses");
//     if (!enrolledcourse) {
//       res.json([{}]);
//     }
//     res.json(enrolledcourse);
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });
// @route   GET api/assessment
// @desc    Get all assessments
// @access  Public
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessments = yield Assessment_1.default.find();
        res.json(assessments);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   GET api/assessment/:lessonId
// @desc    Get assessment by lessonId
// @access  Public
router.get("/:lessonId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lessonId = req.params.lessonId;
    try {
        const assessment = yield Assessment_1.default.findOne({ lessonId }, { "mcq.answer": 0 });
        res.json(assessment);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// // @route   GET api/assessment/:lessonId
// // @desc    Get assessment by lessonId
// // @access  Public
// router.get("withAnswers/:lessonId", async (req: Request, res: Response) => {
//   const lessonId = req.params.lessonId;
//   writelog(lessonId);
//   try {
//     const assessment: IAssessment = await Assessment.findOne({ lessonId });
//     res.json(assessment);
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });
// // // @route   POST api/assessment
// // // @desc    Create assessment
// // // @access  Private
// router.post("/", auth, async (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res
//       .status(HttpStatusCodes.BAD_REQUEST)
//       .json({ errors: errors.array() });
//   }
//   const moduleId = req.body.moduleId;
//   const lessonId = req.body.lessonId;
//   const mcq = req.body.mcq;
//   const theory = req.body.theory;
//   console.log({ moduleId, lessonId });
//   try {
//     Assessment.create(
//       { user: req.userId, moduleId, lessonId, mcq, theory },
//       (err) => {
//         if (err) throw err;
//         res.status(200).send();
//       }
//     );
//   } catch (err) {
//     SERVER_ERROR(res, err);
//   }
// });
// @route   UPDATE api/assessments
// @desc    Update assessment given lesson id
// return   updated doc if the assessment is successfully updated in db.
router.put("/:lessonId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lessonId = req.params.lessonId;
    const quiz = JSON.parse(req.body.quiz);
    const moduleId = quiz.moduleId;
    const mcq = quiz.mcq;
    const theory = quiz.theory;
    console.log("lessonid => ", lessonId, moduleId);
    try {
        const update = yield Assessment_1.default.findOneAndUpdate({ moduleId, lessonId }, { moduleId, lessonId, mcq, theory }, { upsert: true });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   DELETE api/assessment
// @desc    Delete assessment given lesson id
// return   deleted doc if the assessment is successfully deleted in db.
router.delete("/:lessonId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lessonId = req.params.lessonId;
    try {
        const update = yield Assessment_1.default.findOneAndRemove({ lessonId });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
exports.default = router;
//# sourceMappingURL=assessment.js.map