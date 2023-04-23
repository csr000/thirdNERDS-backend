import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";

import auth from "../../middleware/auth";
import EnrolledCourse, { IEnrolledCourse } from "../../models/EnrolledCourse";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import Course, { IFilteredDoc } from "../../models/Course";

const router: Router = Router();

// @route   GET api/enrolledcourse/me
// @desc    Get current user's enrolledcourses
// @access  Private
router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    const enrolledcourse: IEnrolledCourse = await EnrolledCourse.findOne({
      user: req.userId,
    }).populate("enrolledCourses");
    if (!enrolledcourse) {
      return res.json([{}]);
    }

    res.json(enrolledcourse);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/enrolledcourse
// @desc    Create or update user's enrolledcourse
// @access  Private
router.post("/", auth, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ errors: errors.array() });
  }

  const { enrolledCourseId } = req.body;
  console.log("enrolledCourseId", enrolledCourseId);

  // Build enrolledcourse object based on IEnrolledcourse
  let NewEnrolledCourse = await Course.findById(enrolledCourseId);
  const enrolledCourseFields = {
    _id: enrolledCourseId,
    courseName: NewEnrolledCourse.courseName,
  };

  try {
    // prepare enrolledcourseArrayFields for NewEnrolledCourse
    let enrolledcourse: IEnrolledCourse = await EnrolledCourse.findOne({
      user: req.userId,
    });

    if (enrolledcourse) {
      // Update
      enrolledcourse = await EnrolledCourse.findOneAndUpdate(
        { user: req.userId },
        {
          $addToSet: { enrolledCourses: enrolledCourseFields },
        },
        { new: true }
      );

      const update = await Course.findByIdAndUpdate(
        req.userId,
        {
          enrolledCourse: enrolledcourse._id,
        },
        { new: true }
      );

      console.log("update", update);

      return res.json(enrolledcourse);
    }

    const initEnrolledCourse = {
      user: req.userId,
      enrolledCourses: [enrolledCourseFields],
    };

    // Create
    enrolledcourse = new EnrolledCourse(initEnrolledCourse);

    await User.findByIdAndUpdate(req.userId, {
      enrolledCourse: enrolledcourse._id,
    });

    await enrolledcourse.save();

    res.json(enrolledcourse);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/enrolledcourse
// @desc    Get all enrolledcourses
// @access  Public
router.get("/", async (_req: Request, res: Response) => {
  try {
    const enrolledcourses: IEnrolledCourse[] =
      await EnrolledCourse.find().populate("user", ["avatar", "email"]);
    res.json(enrolledcourses);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/enrolledcourse/user/:userId
// @desc    Get enrolledcourse by userId
// @access  Public
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const enrolledcourse: IEnrolledCourse = await EnrolledCourse.findOne({
      user: req.params.userId,
    }).populate("user", ["avatar", "email"]);

    if (!enrolledcourse)
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ msg: "enrolledcourse not found" });

    res.json(enrolledcourse);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ msg: "enrolledcourse not found" });
    }
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   DELETE api/enrolledcourse
// @desc    Delete enrolledcourse and user
// @access  Private
router.delete("/", auth, async (req: Request, res: Response) => {
  try {
    // Remove enrolledcourse
    await EnrolledCourse.findOneAndRemove({ user: req.userId });
    // Remove user
    await User.findOneAndRemove({ _id: req.userId });

    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

export default router;
