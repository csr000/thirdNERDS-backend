"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = __importDefault(require("./routes/api/auth"));
const user_1 = __importDefault(require("./routes/api/user"));
const profile_1 = __importDefault(require("./routes/api/profile"));
const course_1 = __importDefault(require("./routes/api/course"));
const enrolledcourse_1 = __importDefault(require("./routes/api/enrolledcourse"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Connect to MongoDB
(0, database_1.default)();
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
app.use("/api/enrolledcourse", enrolledcourse_1.default);
app.use("/api/course", course_1.default);
const port = app.get("port");
const server = app.listen(port, () => console.log(`Server started on port ${port}`));
exports.default = server;
//# sourceMappingURL=server.js.map