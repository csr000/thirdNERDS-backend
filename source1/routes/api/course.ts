// @access  Private
import { Router, Response } from "express";
import Request from "../../types/Request";

import Course, { ICourse, IFilteredDoc } from "../../models/Course";
import { SERVER_ERROR, writelog } from "../../utils";

import Assessment from "../../models/Assessment";
import Grade from "../../models/Grade";

const router: Router = Router();

// @route   GET api/courses
// @desc    Get all courses with it's modules and lessons
// return   all courses
router.get("/", async (req: Request, res: Response) => {
  try {
    const courses = await Course.find().select({ _id: 1, courseName: 1 });
    res.json(courses);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   GET api/courses/allCourseNames
// @desc    Get all courseName with _id
// return   all courses
router.get("/allCourseNames", async (req: Request, res: Response) => {
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

// @route   GET api/courses/getCourse
// @desc    Get a particular course given courseName
// return   course with it's modules & lessons
router.get("/getCourse", async (req: Request, res: Response) => {
  const id = req.query.id;
  try {
    const course = await Course.findById(id);
    res.json(course);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/courses/addCourse
// @desc    Add course given courseName
// return   200 if the course is successfully saved in db.
router.post("/addCourse", async (req: Request, res: Response) => {
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

// @route   POST api/courses/updateCourse
// @desc    Update courseName given id
// return   updated doc if the course is successfully updated in db.
router.post("/updateCourse", async (req: Request, res: Response) => {
  const id = req.query.id;
  const newCourseName = req.query.newCourseName;

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

// @route   POST api/courses/deleteCourse
// @desc    Delete course given id
// return   200 if the course is successfully deleted from db.
router.post("/deleteCourse", async (req: Request, res: Response) => {
  const id = req.query.id;
  try {
    await Course.findByIdAndRemove(id);
    res.status(200).send();
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   GET api/courses/:courseId/modules
// @desc    Get all moduleName with course id
// return   all moduleNames
router.get("/:courseId/modules", async (req: Request, res: Response) => {
  const id = req.params.courseId as string;
  const isCompleted =
    req.query.isCompleted && JSON.parse(req.query.isCompleted as string);
  try {
    const params = { _id: 0, courseName: 0, "modules.lessons": 0 };
    let modules: any = await Course.findById(id, params);
    modules = modules.modules;

    if (isCompleted) {
      // Find all assessments and grades that correspond to the modules
      modules = await Promise.all(
        modules.map(async (module: any) => {
          const assessments = await Assessment.find({
            moduleId: { $in: module._id },
          });
          const grades: any = await Grade.find({
            moduleId: { $in: module._id },
          });

          if (assessments.length !== grades.length) {
            writelog("Arrays are not the same");
          } else if (!assessments.length || !grades.length) {
            writelog("assessment or grade does not exist");
          } else if (!grades.every((item: any) => item.approved)) {
            writelog("not all are approved");
          } else {
            // Check if the objects in each array are the same
            const isEqual = assessments.every((obj: any, index: any) => {
              const otherObj = grades[index];
              return JSON.stringify(obj) === JSON.stringify(otherObj);
            });
            if (isEqual) {
              console.log("Arrays are the same");
            }
            return {
              _id: module._id,
              moduleName: module.moduleName,
              completed: true,
            };
          }
          return {
            _id: module._id,
            moduleName: module.moduleName,
            completed: false,
          };
        })
      );
    }
    res.json(modules);
  } catch (err) {
    SERVER_ERROR(res, err);
  }
});

// @route   POST api/courses/module/addModule
// @desc    Add module given courseName & module
// return   updated doc if the module is successfully saved in db.
router.post("/module/addModule", async (req: Request, res: Response) => {
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

// @route   POST api/courses/module/updateModule
// @desc    Update moduleName given courseName & prevModuleName
// return   updated doc if the module is successfully updated in db.
router.post(
  "/module/updateModule",

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

// @route   POST api/courses/module/deleteModule
// @desc    Delete module given courseName & module
// return   updated doc if the module is successfully deleted from db.
router.post(
  "/module/deleteModule",

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

// @route   GET api/courses/module/lesson
// @desc    Get all lessons under a specific module with _id
// return   all courses
router.get(
  "/modules/:moduleId/lessons",
  async (req: Request, res: Response) => {
    const module_id = req.params.moduleId as string;
    try {
      const modules: ICourse = await Course.findOne({
        "modules._id": module_id,
      }).select("modules.lessons");

      // let SelectedModule = modules.modules.filter(
      //   (module) => module._id.toString() === module_id
      // );

      // // @ts-ignore
      // SelectedModule.push({ courseName: modules.courseName });
      res.json(modules.modules[0].lessons);
    } catch (err) {
      SERVER_ERROR(res, err);
    }
  }
);

// @route   POST api/courses/module/lesson/addLesson
// @desc    Add Lesson given courseName & moduleName
// return   updated doc if the lesson has been successfully added from db.
router.post("/module/lesson/addLesson", async (req: Request, res: Response) => {
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
});

function removeEmpty(obj: { [s: string]: unknown } | ArrayLike<unknown>) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(obj).filter(([_, v]) => v.length > 0)
  );
}

// @route   POST api/courses/updateLesson
// @desc    Update module given courseName & module
// return   updated doc if the lesson has been successfully added from db.
router.post(
  "/module/lesson/updateLesson",
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

// @route   POST api/courses/addLesson
// @desc    Delete module given courseName & module
// return   updated doc if the lesson has been successfully added from db.
router.post(
  "/module/lesson/deleteLesson",

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
