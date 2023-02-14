import { Router, Response } from "express";
import Request from "../../types/Request";

import Course, { ICourse, IFilteredDoc } from "../../models/Course";
import { SERVER_ERROR } from "../../utils";
import auth from "../../middleware/auth";

const router: Router = Router();

// @route   GET api/course/all
// @desc    Get all courses with it's modules and lessons
// return   all courses
router.get("/all", auth, async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   GET api/course/allCourseNames
// @desc    Get all courseName with _id
// return   all courses
router.get("/allCourseNames", auth, async (req: Request, res: Response) => {
  try {
    const courses: ICourse[] = await Course.find();
    const filteredCourseDoc: IFilteredDoc[] = courses.map((item: ICourse) => {
      return { _id: item._id, courseName: item.courseName };
    });
    res.json(filteredCourseDoc);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   GET api/course/getCourse
// @desc    Get a particular course given courseName
// return   course with it's modules & lessons
router.get("/getCourse", auth, async (req: Request, res: Response) => {
  const id = req.query.id;
  try {
    const course = await Course.findById(id);
    res.json(course);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/course/addCourse
// @desc    Add course given courseName
// return   200 if the course is successfully saved in db.
router.post("/addCourse", auth, async (req: Request, res: Response) => {
  const courseName = req.query.courseName;
  try {
    Course.create({ courseName }, (err) => {
      if (err) throw err;
      res.status(200).send();
    });
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/course/updateCourse
// @desc    Update courseName given id
// return   updated doc if the course is successfully updated in db.
router.post("/updateCourse", auth, async (req: Request, res: Response) => {
  const id = req.query.id;
  const newCourseName = req.query.newCourseName;

  console.log({ id, newCourseName });

  try {
    const update = await Course.findByIdAndUpdate(
      id,
      { courseName: newCourseName },
      { new: true }
    );
    res.json(update);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/course/deleteCourse
// @desc    Delete course given id
// return   200 if the course is successfully deleted from db.
router.post("/deleteCourse", auth, async (req: Request, res: Response) => {
  const id = req.query.id;
  try {
    await Course.findByIdAndRemove(id);
    res.status(200).send();
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   GET api/course/module/allModuleNames
// @desc    Get all moduleName with course id
// return   all courses
router.get(
  "/module/allModuleNames",
  auth,
  async (req: Request, res: Response) => {
    const id = req.query.id as string;
    try {
      const params = { _id: 0, courseName: 0, "modules.lessons": 0 };
      const modules: ICourse = await Course.findById(id, params);
      res.json(modules);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

// @route   POST api/course/module/addModule
// @desc    Add module given courseName & module
// return   updated doc if the module is successfully saved in db.
router.post("/module/addModule", auth, async (req: Request, res: Response) => {
  const id = req.query.id;
  const module = req.query.module;
  try {
    const update = await Course.findByIdAndUpdate(
      id,
      { $push: { modules: { moduleName: module } } },
      { new: true }
    );
    res.json(update);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/course/module/updateModule
// @desc    Update moduleName given courseName & prevModuleName
// return   updated doc if the module is successfully updated in db.
router.post(
  "/module/updateModule",
  auth,
  async (req: Request, res: Response) => {
    const courseId = req.query.courseId;
    const moduleId = req.query.moduleId;
    const newModuleName = req.query.newModuleName;
    try {
      const update = await Course.findByIdAndUpdate(
        courseId,
        { $set: { "modules.$[modulesFilter].moduleName": newModuleName } },
        {
          arrayFilters: [
            {
              "modulesFilter._id": moduleId,
            },
          ],
          new: true,
        }
      );
      res.json(update);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

// @route   POST api/course/module/deleteModule
// @desc    Delete module given courseName & module
// return   updated doc if the module is successfully deleted from db.
router.post(
  "/module/deleteModule",
  auth,
  async (req: Request, res: Response) => {
    const courseId = req.query.courseId;
    const moduleId = req.query.moduleId;
    try {
      const update = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { modules: { _id: moduleId } } },
        { new: true }
      );
      res.json(update);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

// @route   GET api/course/module/lesson
// @desc    Get all lessons under a specific module with _id
// return   all courses
router.get("/module/lesson", auth, async (req: Request, res: Response) => {
  const module_id = req.query.module_id as string;
  try {
    const modules: ICourse = await Course.findOne(
      { "modules._id": module_id },
      {
        _id: 0,
      }
    );

    let SelectedModule = modules.modules.filter(
      (module) => module._id.toString() === module_id
    );

    // @ts-ignore
    SelectedModule.push({ courseName: modules.courseName });
    res.json(SelectedModule);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/course/module/lesson/addLesson
// @desc    Add Lesson given courseName & moduleName
// return   updated doc if the lesson has been successfully added from db.
router.post(
  "/module/lesson/addLesson",
  auth,
  async (req: Request, res: Response) => {
    const courseId = req.body.courseId;
    const moduleId = req.body.moduleId;
    // lesson
    const title = req.body.title;
    const objectives = req.body.objectives;
    const overview = req.body.overview;
    const keyTerms = req.body.keyTerms;
    const content = req.body.content;

    try {
      const update = await Course.findByIdAndUpdate(
        courseId,
        {
          $push: {
            "modules.$[modulesFilter].lessons": {
              title,
              objectives,
              overview,
              keyTerms,
              content,
            },
          },
        },
        {
          arrayFilters: [
            {
              "modulesFilter._id": moduleId,
            },
          ],
          new: true,
        }
      );
      res.json(update);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

function removeEmpty(obj: { [s: string]: unknown } | ArrayLike<unknown>) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(obj).filter(([_, v]) => v.length > 0)
  );
}

// @route   POST api/course/updateLesson
// @desc    Update module given courseName & module
// return   updated doc if the lesson has been successfully added from db.
router.post(
  "/module/lesson/updateLesson",
  auth,
  async (req: Request, res: Response) => {
    const module_id = req.body.module_id;
    const lesson_id = req.body.lesson_id;
    // lesson
    const title = req.body.title;
    const objectives = req.body.objectives;
    const overview = req.body.overview;
    const keyTerms = req.body.keyTerms;
    const content = req.body.content;

    const lesson = { title, objectives, overview, keyTerms, content };
    const filteredLesson = removeEmpty(lesson);
    let update;

    try {
      if (title) {
        update = await Course.findOneAndUpdate(
          { "modules.lessons._id": lesson_id },
          {
            $set: {
              "modules.$[modulesFilter].lessons.$[lessonsFilter].title":
                filteredLesson.title,
            },
          },
          {
            arrayFilters: [
              {
                "modulesFilter._id": module_id,
              },
              {
                "lessonsFilter._id": lesson_id,
              },
            ],
            new: true,
          }
        );
      }

      if (objectives) {
        update = await Course.findOneAndUpdate(
          { "modules.lessons._id": lesson_id },
          {
            $set: {
              "modules.$[modulesFilter].lessons.$[lessonsFilter].objectives":
                filteredLesson.objectives,
            },
          },
          {
            arrayFilters: [
              {
                "modulesFilter._id": module_id,
              },
              {
                "lessonsFilter._id": lesson_id,
              },
            ],
            new: true,
          }
        );
      }

      if (overview) {
        update = await Course.findOneAndUpdate(
          { "modules.lessons._id": lesson_id },
          {
            $set: {
              "modules.$[modulesFilter].lessons.$[lessonsFilter].overview":
                filteredLesson.overview,
            },
          },
          {
            arrayFilters: [
              {
                "modulesFilter._id": module_id,
              },
              {
                "lessonsFilter._id": lesson_id,
              },
            ],
            new: true,
          }
        );
      }

      if (keyTerms) {
        update = await Course.findOneAndUpdate(
          { "modules.lessons._id": lesson_id },
          {
            $set: {
              "modules.$[modulesFilter].lessons.$[lessonsFilter].keyTerms":
                filteredLesson.keyTerms,
            },
          },
          {
            arrayFilters: [
              {
                "modulesFilter._id": module_id,
              },
              {
                "lessonsFilter._id": lesson_id,
              },
            ],
            new: true,
          }
        );
      }

      if (content) {
        update = await Course.findOneAndUpdate(
          { "modules.lessons._id": lesson_id },
          {
            $set: {
              "modules.$[modulesFilter].lessons.$[lessonsFilter].content":
                filteredLesson.content,
            },
          },
          {
            arrayFilters: [
              {
                "modulesFilter._id": module_id,
              },
              {
                "lessonsFilter._id": lesson_id,
              },
            ],
            new: true,
          }
        );
      }

      res.json(update);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

// @route   POST api/course/addLesson
// @desc    Delete module given courseName & module
// return   updated doc if the lesson has been successfully added from db.
router.post(
  "/module/lesson/deleteLesson",
  auth,
  async (req: Request, res: Response) => {
    const module_id = req.body.module_id;
    const lesson_id = req.body.lesson_id;
    try {
      const update = await Course.findOneAndUpdate(
        { "modules.lessons._id": lesson_id },
        {
          $pull: {
            "modules.$[modulesFilter].lessons": {
              _id: lesson_id,
            },
          },
        },
        {
          arrayFilters: [
            {
              "modulesFilter._id": module_id,
            },
          ],
        }
      );

      const modules: ICourse = await Course.findOne(
        { "modules._id": module_id },
        {
          _id: 0,
        }
      );

      let SelectedModule = modules.modules.filter(
        (module) => module._id.toString() === module_id
      );

      // @ts-ignore
      SelectedModule.push({ courseName: modules.courseName });
      res.json(SelectedModule);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

export default router;
