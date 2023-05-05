import bcrypt from "bcryptjs";
import { Response, Router } from "express";
import { check, validationResult } from "express-validator";
import gravatar from "gravatar";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import auth from "../../middleware/auth";
import User, { IUser } from "../../models/User";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import { sendResetPasswordEmail } from "./utils";

const router: Router = Router();

// @route   POST api/users
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
        .send(errors.array()[0].msg);
    }

    const { email, password, permission } = req.body;
    try {
      let user: IUser = await User.findOne({ email });

      if (user) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json("User already exists");
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

// @route   GET api/users
// @desc    Get all users or specific users if specified
// @access  Private
router.get("/", auth, async (req: Request, res: Response) => {
  const permission = req.query.permission;
  try {
    if (permission) {
      const users = await User.find({ permission }, { email: 1, permission: 1 })
        .populate({ path: "enrolledCourse", select: "enrolledCourses" })
        .exec();
      return res.json(users);
    }

    const users = await User.find({}, { email: 1, permission: 1 })
      .populate({ path: "enrolledCourse", select: "enrolledCourses" })
      .exec();
    return res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/users/update-password
// @desc    Update user password
// @access  Public
router.post("/update-password", auth, async (req: Request, res: Response) => {
  const prevPassword = req.body.prevPassword as string;
  const newPassword = req.body.newPassword as string;
  const confirmPassword = req.body.confirmPassword as string;
  let user: IUser = await User.findById(req.userId);

  try {
    if (newPassword !== confirmPassword) {
      throw new Error("New Password & Confirm Password not matching.");
    }

    const isMatch = await bcrypt.compare(prevPassword, user.password);

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
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
});

// @route   POST api/users/reset-password
// @desc    Update user password
// @access  Public
router.post("/reset-password", async (req: Request, res: Response) => {
  const email = req.body.email as string;
  let user: IUser = await User.findOne({ email });

  try {
    if (!user) {
      throw new Error("User does not exist");
    }

    if (!user.hash) {
      const salt = await bcrypt.genSalt(10);
      const hash = user._id.toString()
      await User.findByIdAndUpdate(user._id.toString(), { hash });
      // refetch user
      user = await User.findOne({ email });
    }

    sendResetPasswordEmail(email, user.hash);

    res.status(200).json({message: "ok"});
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
});

// @route   POST api/users/verify-hash
// @desc    Verifies user hash
// @access  Public
router.post("/verify-hash/:hash", async (req: Request, res: Response) => {
  const hash = req.params.hash as string;
  let user: IUser = await User.findOne({ hash });

  console.log({ hash });
  console.log({ user });

  try {
    if (!user) {
      throw new Error("Hash does not exist");
    }
    res.status(200).send();
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
});

// @route   POST api/users/verify-hash
// @desc    Verifies user hash
// @access  Public
router.put(
  "/confirm-reset-password/:hash",
  async (req: Request, res: Response) => {
    const hash = req.params.hash as string;
    let password = req.body.password as string;

    // hash password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    console.log({ hash, password });

    try {
      await User.findOneAndUpdate({ hash }, { password });

      res.status(200).json({message: "ok"});
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
    }
  }
);

export default router;
