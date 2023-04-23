import bcrypt from "bcryptjs";
import config from "config";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import gravatar from "gravatar";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IFilteredUsersDoc, IUser } from "../../models/User";
import auth from "../../middleware/auth";

const router: Router = Router();

// @route   POST api/user
// @desc    Register user given their email and password, returns the token upon successful registration
// @access  Public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("permission").isLength({ min: 5 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { email, password, permission } = req.body;
    try {
      let user: IUser = await User.findOne({ email });

      if (user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "User already exists",
            },
          ],
        });
      }

      const options: gravatar.Options = {
        s: "200",
        r: "pg",
        d: "mm",
      };

      const avatar = gravatar.url(email, options);

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      // Build user object based on IUser
      const userFields = {
        email,
        password: hashed,
        permission,
        avatar,
      };

      user = new User(userFields);

      await user.save();

      const payload: Payload = {
        userId: user.id,
      };

      jwt.sign(
        payload,
        process.env.accessSecret,
        { expiresIn: process.env.accessExpiration },
        (err, accessToken) => {
          if (err) throw err;
          return res.json({ accessToken });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
  }
);

// @route   GET api/user/all
// @desc    Get all users
// @access  Public
router.get("/all", auth, async (req: Request, res: Response) => {
  try {
    User.find({}, { email: 1, permission: 1 })
      .populate({ path: "enrolledCourse", select: "enrolledCourses" })
      .exec((err, users) => {
        if (err) {
          throw err;
        } else {
          // console.log("users", users);
          return res.json(users);
        }
      });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/user/update-password
// @desc    Update user password
// @access  Public
router.post("/update-password", auth, async (req: Request, res: Response) => {
  const prevPassword = req.body.prevPassword as string;
  const newPassword = req.body.newPassword as string;
  const confirmPassword = req.body.confirmPassword as string;
  let user: IUser = await User.findById(req.userId);

  console.log({ prevPassword, newPassword, confirmPassword });
  console.log({ user });

  try {
    if (newPassword !== confirmPassword) {
      throw new Error("New Password & Confirm Password not matching.");
    }

    const isMatch = await bcrypt.compare(prevPassword, user.password);
    console.log({ isMatch });

    if (!isMatch) {
      throw new Error("Invalid Current Password.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { password: hashed } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

export default router;
