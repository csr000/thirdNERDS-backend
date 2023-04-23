import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";

import auth from "../../middleware/auth";

import Request from "../../types/Request";

import { IAssessment } from "../../models/Assessment";
import Assessment from "../../models/Assessment";
import { SERVER_ERROR, writelog } from "../../utils";

const router: Router = Router();

// // @route   GET api/enrolledcourse/me
// // @desc    Get current user's enrolledcourses
// // @access  Private
// router.get("/me", auth, async (req: Request, res: Response) => {
//   try {
//     const enrolledcourse: IEnrolledCourse = await EnrolledCourse.findOne({
//       user: req.userId,
//     }).populate("enrolledCourses");
//     if (!enrolledcourse) {
//       res.json([{}]);
//     }

//     res.json(enrolledcourse);
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });

// @route   GET api/assessment
// @desc    Get all assessments
// @access  Public
router.get("/", async (_req: Request, res: Response) => {
  try {
    const assessments: IAssessment[] = await Assessment.find();
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/assessment/:lessonId
// @desc    Get assessment by lessonId
// @access  Public
router.get("/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;

  try {
    const assessment: IAssessment = await Assessment.findOne(
      { lessonId },
      { "mcq.answer": 0 }
    );

    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// // @route   GET api/assessment/:lessonId
// // @desc    Get assessment by lessonId
// // @access  Public
router.get("/withAnswers/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;

  writelog(lessonId);
  try {
    const assessment: IAssessment = await Assessment.findOne({ lessonId });

    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// // // @route   POST api/assessment
// // // @desc    Create assessment
// // // @access  Private
// router.post("/", auth, async (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res
//       .status(HttpStatusCodes.BAD_REQUEST)
//       .json({ errors: errors.array() });
//   }
//   const moduleId = req.body.moduleId;
//   const lessonId = req.body.lessonId;
//   const mcq = req.body.mcq;
//   const theory = req.body.theory;

//   console.log({ moduleId, lessonId });

//   try {
//     Assessment.create(
//       { user: req.userId, moduleId, lessonId, mcq, theory },
//       (err) => {
//         if (err) throw err;
//         res.status(200).send();
//       }
//     );
//   } catch (err) {
//     SERVER_ERROR(res, err);
//   }
// });

// @route   UPDATE api/assessments
// @desc    Update assessment given lesson id
// return   updated doc if the assessment is successfully updated in db.
router.put("/:lessonId", auth, async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;

  const quiz = JSON.parse(req.body.quiz);
  const moduleId = quiz.moduleId;

  const mcq = quiz.mcq;
  const theory = quiz.theory;

  console.log("lessonid => ", lessonId, moduleId, mcq);

  try {
    const update = await Assessment.findOneAndUpdate(
      { moduleId, lessonId },
      { moduleId, lessonId, mcq, theory },
      { upsert: true }
    );
    res.json(update);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   DELETE api/assessment
// @desc    Delete assessment given lesson id
// return   deleted doc if the assessment is successfully deleted in db.
router.delete("/:lessonId", auth, async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;
  try {
    const update = await Assessment.findOneAndRemove({ lessonId });
    res.json(update);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

export default router;
