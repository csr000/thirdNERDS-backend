"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/api/auth"));
const user_1 = __importDefault(require("./routes/api/user"));
const profile_1 = __importDefault(require("./routes/api/profile"));
const course_1 = __importDefault(require("./routes/api/course"));
const enrolledCourse_1 = __importDefault(require("./routes/api/enrolledCourse"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
// Express configuration
app.set("port", process.env.PORT || 5000);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb" }));
// @route   GET /
// @desc    Test Base API
// @access  Public
app.get("/", (_req, res) => {
    res.send("API Running");
});
app.use("/api/auth", auth_1.default);
app.use("/api/user", user_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/enrolledcourse", enrolledCourse_1.default);
app.use("/api/course", course_1.default);
const port = app.get("port");
(0, database_1.default)().then(() => {
    app.listen(port, () => console.log(`Server started on port ${port}`));
});
//# sourceMappingURL=server.js.map