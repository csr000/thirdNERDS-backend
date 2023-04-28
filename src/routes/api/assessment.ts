// @access  Private
import { Response, Router } from 'express';
import HttpStatusCodes from 'http-status-codes';

import Assessment, { IAssessment } from '../../models/Assessment';
import Request from '../../types/Request';
import { SERVER_ERROR } from '../../utils';

const router: Router = Router();

// @route   GET api/assessment
// @desc    Get all assessments
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
// @desc    Get assessment by lessonId. It's without answers by default
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
// // @desc    Get assessment with answers by lessonId
router.get("/withAnswers/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;

  try {
    const assessment: IAssessment = await Assessment.findOne({ lessonId });
    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   PUT api/assessments
// @desc    Update assessment given lesson id
router.put("/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;

  const quiz = JSON.parse(req.body.quiz);
  const moduleId = quiz.moduleId;

  const mcq = quiz.mcq;
  const theory = quiz.theory;

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
router.delete("/:lessonId", async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId;
  try {
    const update = await Assessment.findOneAndRemove({ lessonId });
    res.json(update);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

export default router;
