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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const gravatar_1 = __importDefault(require("gravatar"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = (0, express_1.Router)();
// @route   POST api/user
// @desc    Register user given their email and password, returns the token upon successful registration
// @access  Public
router.post("/", [
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
    (0, express_validator_1.check)("permission").isLength({ min: 5 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res
            .status(http_status_codes_1.default.BAD_REQUEST)
            .json({ errors: errors.array() });
    }
    const { email, password, permission } = req.body;
    try {
        let user = yield User_1.default.findOne({ email });
        if (user) {
            return res.status(http_status_codes_1.default.BAD_REQUEST).json({
                errors: [
                    {
                        msg: "User already exists",
                    },
                ],
            });
        }
        const options = {
            s: "200",
            r: "pg",
            d: "mm",
        };
        const avatar = gravatar_1.default.url(email, options);
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashed = yield bcryptjs_1.default.hash(password, salt);
        // Build user object based on IUser
        const userFields = {
            email,
            password: hashed,
            permission,
            avatar,
        };
        user = new User_1.default(userFields);
        yield user.save();
        const payload = {
            userId: user.id,
        };
        jsonwebtoken_1.default.sign(payload, process.env.accessSecret, { expiresIn: process.env.accessExpiration }, (err, accessToken) => {
            if (err)
                throw err;
            res.json({ accessToken });
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   GET api/user/all
// @desc    Get all users
// @access  Public
router.get("/all", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        User_1.default.find({}, { email: 1, permission: 1 })
            .populate({ path: "enrolledCourse", select: "enrolledCourses" })
            .exec((err, users) => {
            if (err) {
                throw err;
            }
            else {
                console.log("users", users);
                res.json(users);
            }
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
// @route   POST api/user/update-password
// @desc    Update user password
// @access  Public
router.post("/update-password", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prevPassword = req.body.prevPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    let user = yield User_1.default.findById(req.userId);
    console.log({ prevPassword, newPassword, confirmPassword });
    console.log({ user });
    try {
        if (newPassword !== confirmPassword) {
            throw new Error("New Password & Confirm Password not matching.");
        }
        const isMatch = yield bcryptjs_1.default.compare(prevPassword, user.password);
        console.log({ isMatch });
        if (!isMatch) {
            throw new Error("Invalid Current Password.");
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashed = yield bcryptjs_1.default.hash(newPassword, salt);
        user = yield User_1.default.findOneAndUpdate({ _id: user._id }, { $set: { password: hashed } }, { new: true });
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}));
exports.default = router;
//# sourceMappingURL=user.js.map