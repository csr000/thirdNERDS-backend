import express from "express";

import connectDB from "./config/database";
import auth from "./routes/api/auth";
import user from "./routes/api/user";
import profile from "./routes/api/profile";
import course from "./routes/api/course";
import enrolledcourse from "./routes/api/enrolledCourse";
import assessment from "./routes/api/assessment";
import grade from "./routes/api/grade";
import cors from "cors";

const app = express();
// require('dotenv').config();
// Connect to MongoDB
connectDB();

// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", process.env.PORT || 5000);
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// @route   GET /
// @desc    Test Base API
// @access  Public
app.get("/", (_req, res) => res.send("API Running"));

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/profile", profile);
app.use("/api/enrolledcourse", enrolledcourse);
app.use("/api/course", course);
app.use("/api/assessments", assessment);
app.use("/api/grades", grade);

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;
