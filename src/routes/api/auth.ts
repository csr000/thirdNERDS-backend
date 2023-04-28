import bcrypt from 'bcryptjs';
import { Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';

import auth from '../../middleware/auth';
import User, { IUser } from '../../models/User';
import Payload from '../../types/Payload';
import Request from '../../types/Request';

const router: Router = Router();

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response) => {
  try {
    const user: IUser = await User.findById(req.userId).select("-password");
    const userInfo = {
      email: user.email,
      permission: user.permission,
    };
    res.json(userInfo);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/auth
// @desc    Login user and get token
// @access  Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user: IUser = await User.findOne({ email });

      if (!user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "Invalid Credentials",
            },
          ],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "Invalid Credentials",
            },
          ],
        });
      }

      const payload: Payload = {
        userId: user.id,
      };

      jwt.sign(
        payload,
        process.env.accessSecret,
        { expiresIn: process.env.accessExpiration },
        (err, accessToken) => {
          if (err) throw err;
          res.json({ accessToken });
        }
      );
      
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
  }
);

export default router;
