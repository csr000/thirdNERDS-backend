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
const EnrolledCourse_1 = __importDefault(require("../../models/EnrolledCourse"));
const User_1 = __importDefault(require("../../models/User"));
const Course_1 = __importDefault(require("../../models/Course"));
const router = (0, express_1.Router)();
// @route   GET api/enrolledcourse/me
// @desc    Get current user's enrolledcourses
// @access  Private
router.get("/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enrolledcourse = yield EnrolledCourse_1.default.findOne({
            user: req.userId,
        }).populate("enrolledCourses");
        if (!enrolledcourse) {
            return res.status(http_status_codes_1.default.BAD_REQUEST).json({
                errors: [
                    {
                        msg: "There is no enrolledcourse for this user",
                    },
                ],
            });
        }
        res.json(enrolledcourse);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   POST api/enrolledcourse
// @desc    Create or update user's enrolledcourse
// @access  Private
router.post("/", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res
            .status(http_status_codes_1.default.BAD_REQUEST)
            .json({ errors: errors.array() });
    }
    const { enrolledCourseId } = req.body;
    console.log("enrolledCourseId", enrolledCourseId);
    // Build enrolledcourse object based on IEnrolledcourse
    let NewEnrolledCourse = yield Course_1.default.findById(enrolledCourseId);
    const enrolledCourseFields = {
        _id: enrolledCourseId,
        courseName: NewEnrolledCourse.courseName,
    };
    try {
        // prepare enrolledcourseArrayFields for NewEnrolledCourse
        let enrolledcourse = yield EnrolledCourse_1.default.findOne({
            user: req.userId,
        });
        if (enrolledcourse) {
            // Update
            enrolledcourse = yield EnrolledCourse_1.default.findOneAndUpdate({ user: req.userId }, {
                $addToSet: { enrolledCourses: enrolledCourseFields },
            }, { new: true });
            const update = yield Course_1.default.findByIdAndUpdate(req.userId, {
                enrolledCourse: enrolledcourse._id,
            }, { new: true });
            console.log("update", update);
            return res.json(enrolledcourse);
        }
        const initEnrolledCourse = {
            user: req.userId,
            enrolledCourses: [enrolledCourseFields],
        };
        // Create
        enrolledcourse = new EnrolledCourse_1.default(initEnrolledCourse);
        yield User_1.default.findByIdAndUpdate(req.userId, {
            enrolledCourse: enrolledcourse._id,
        });
        yield enrolledcourse.save();
        res.json(enrolledcourse);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   GET api/enrolledcourse
// @desc    Get all enrolledcourses
// @access  Public
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enrolledcourses = yield EnrolledCourse_1.default.find().populate("user", ["avatar", "email"]);
        res.json(enrolledcourses);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   GET api/enrolledcourse/user/:userId
// @desc    Get enrolledcourse by userId
// @access  Public
router.get("/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enrolledcourse = yield EnrolledCourse_1.default.findOne({
            user: req.params.userId,
        }).populate("user", ["avatar", "email"]);
        if (!enrolledcourse)
            return res
                .status(http_status_codes_1.default.BAD_REQUEST)
                .json({ msg: "enrolledcourse not found" });
        res.json(enrolledcourse);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res
                .status(http_status_codes_1.default.BAD_REQUEST)
                .json({ msg: "enrolledcourse not found" });
        }
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   DELETE api/enrolledcourse
// @desc    Delete enrolledcourse and user
// @access  Private
router.delete("/", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove enrolledcourse
        yield EnrolledCourse_1.default.findOneAndRemove({ user: req.userId });
        // Remove user
        yield User_1.default.findOneAndRemove({ _id: req.userId });
        res.json({ msg: "User removed" });
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
exports.default = router;
//# sourceMappingURL=enrolledCourse.js.map