// @access  Private
import { Response, Router } from "express";
import { validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";

import Assessment, { IAssessment } from "../../models/Assessment";
import Grade, { IGrade } from "../../models/Grade";
import Request from "../../types/Request";
import { compareMCQs } from "./utils";

const router: Router = Router();

// @route   PUT api/grades
// @desc    Create or update grade by lessonId
router.put("/:lessonId", async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCodes.BAD_REQUEST).send(errors.array()[0].msg);
  }
  try {
    const moduleId = req.body.moduleId;
    const lessonId = req.body.lessonId;

    const grade = await Grade.findOneAndUpdate(
      { user: req.userId, moduleId, lessonId },
      { moduleId, lessonId },
      { new: true, upsert: true }
    );

    res.json(grade);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/grades
// @desc    Get all grades
router.get("/", async (req: Request, res: Response) => {
  try {
    if (req.query.approved === "false") {
      Grade.aggregate([
        {
          $lookup: {
            from: "assessments",
            localField: "lessonId",
            foreignField: "lessonId",
            as: "assessment",
          },
        },
        {
          $project: {
            _id: 1,
            lessonId: 1,
            moduleId: 1,
            user: 1,
            approved: 1,
            date: 1,
            theoryAnswer: 1,
            remarks: 1,
            assessment: { $arrayElemAt: ["$assessment.theory", 0] },
          },
        },
      ])
        .exec()
        .then((grades) => {
          grades = grades.filter((i) => i.approved === false);
          res.json(grades);
        })
        .catch((error) => {
          console.error(error);
        });
      return;
    }
    const grades: IGrade[] = await Grade.find();
    res.json(grades);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/grades
// @desc    Get all grades
router.get("/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;
  try {
    const grades: IGrade[] = await Grade.findOne({ lessonId });
    res.json(grades);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/grades
// @desc    Create grade and assign it to student
router.post("/", async (req: Request, res: Response) => {
  try {
    // const grades: IGrade[] = await Grade.find();
    // res.json(grades);

    const quiz: IAssessment = JSON.parse(req.body.quiz);

    const lessonId = quiz.lessonId;
    const moduleId = quiz.moduleId;

    const incomingMcq = quiz.mcq;
    const theoryAnswer = quiz.theory;
    const questionsFromDB: IAssessment = await Assessment.findOne(
      { lessonId },
      { mcq: 1 }
    );
    const mcqFromDB = questionsFromDB.mcq;

    const { approved, incomingMCQs } = compareMCQs(incomingMcq, mcqFromDB);

    if (approved) {
      if (!theoryAnswer.trim()) {
        await Grade.findOneAndUpdate(
          { user: req.userId, moduleId, lessonId },
          { user: req.userId, moduleId, lessonId, approved },
          { upsert: true }
        );
      } else {
        await Grade.findOneAndUpdate(
          { user: req.userId, moduleId, lessonId },
          {
            user: req.userId,
            moduleId,
            lessonId,
            theoryAnswer,
            approved: false,
          },
          { upsert: true }
        );
      }
    }

    res.json({ approved, incomingMCQs });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   POST api/grades/approve
// @desc    Approve grade by lessonId
router.post("/approve", async (req: Request, res: Response) => {
  const info: any = JSON.parse(req.body.info);

  const moduleId = info.moduleId;
  const lessonId = info.lessonId;
  const remarks = info.remarks;

  console.log("/approve ", info);
  try {
    await Grade.findOneAndUpdate(
      {
        user: req.userId,
        moduleId,
        lessonId,
      },
      { approved: true, remarks }
    );
    res.json({ message: "ok" });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/grades/:userId
// @desc    Get grade by userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const grade: IGrade = await Grade.findOne({
      user: req.params.userId,
    }).populate("user", ["email"]);

    res.json(grade);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

export default router;
