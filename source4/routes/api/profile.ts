import { Response, Router } from 'express';
import { validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';

import auth from '../../middleware/auth';
import Profile, { IProfile } from '../../models/Profile';
import User, { IUser } from '../../models/User';
import Request from '../../types/Request';

const router: Router = Router();

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    const profile: IProfile = await Profile.findOne({
      user: req.userId,
    }).populate("user", ["avatar", "email"]);

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/profile
// @desc    Create or update user's profile
// @access  Private
router.post("/", auth, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCodes.BAD_REQUEST).send(errors.array()[0].msg);
  }

  const { firstName, lastName, email, platform, git, linkedIn } = req.body;

  // Build profile object based on IProfile
  const profileFields = {
    user: req.userId,
    firstName,
    lastName,
    email,
    platform,
    git,
    linkedIn,
  };

  try {
    let user: IUser = await User.findOne({ _id: req.userId });

    if (!user) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: "User not registered",
          },
        ],
      });
    }

    let profile: IProfile = await Profile.findOne({ user: req.userId });
    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        { $set: profileFields },
        { new: true }
      );

      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Private
router.get("/", auth, async (_req: Request, res: Response) => {
  try {
    const profiles: IProfile[] = await Profile.find().populate("user", [
      "avatar",
      "email",
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/profile/user/:userId
// @desc    Get profile by userId
// @access  Public
router.get("/user/:userId", auth, async (req: Request, res: Response) => {
  try {
    const profile: IProfile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", ["avatar", "email"]);

    if (!profile)
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ msg: "Profile not found" });
    }
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   DELETE api/profile
// @desc    Delete profile and user
// @access  Private
router.delete("/", auth, async (req: Request, res: Response) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.userId });
    // Remove user
    await User.findOneAndRemove({ _id: req.userId });

    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

export default router;
