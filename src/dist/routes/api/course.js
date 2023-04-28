"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Course_1 = __importDefault(require("../../models/Course"));
const utils_1 = require("../../utils");
const auth_1 = __importDefault(require("../../middleware/auth"));
const Assessment_1 = __importDefault(require("../../models/Assessment"));
const Grade_1 = __importDefault(require("../../models/Grade"));
const router = (0, express_1.Router)();
// @route   GET api/course/all
// @desc    Get all courses with it's modules and lessons
// return   all courses
router.get("/all", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.default.find();
        res.json(courses);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   GET api/course/allCourseNames
// @desc    Get all courseName with _id
// return   all courses
router.get("/allCourseNames", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.default.find();
        const filteredCourseDoc = courses.map((item) => {
            return { _id: item._id, courseName: item.courseName };
        });
        res.json(filteredCourseDoc);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   GET api/course/getCourse
// @desc    Get a particular course given courseName
// return   course with it's modules & lessons
router.get("/getCourse", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const course = yield Course_1.default.findById(id);
        res.json(course);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/addCourse
// @desc    Add course given courseName
// return   200 if the course is successfully saved in db.
router.post("/addCourse", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseName = req.query.courseName;
    try {
        Course_1.default.create({ courseName }, (err) => {
            if (err)
                throw err;
            res.status(200).send();
        });
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/updateCourse
// @desc    Update courseName given id
// return   updated doc if the course is successfully updated in db.
router.post("/updateCourse", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const newCourseName = req.query.newCourseName;
    console.log({ id, newCourseName });
    try {
        const update = yield Course_1.default.findByIdAndUpdate(id, { courseName: newCourseName }, { new: true });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/deleteCourse
// @desc    Delete course given id
// return   200 if the course is successfully deleted from db.
router.post("/deleteCourse", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        yield Course_1.default.findByIdAndRemove(id);
        res.status(200).send();
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   GET api/course/module/allModuleNames
// @desc    Get all moduleName with course id
// return   all moduleNames
router.get("/module/allModuleNames", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const params = { _id: 0, courseName: 0, "modules.lessons": 0 };
        let modules = yield Course_1.default.findById(id, params);
        modules = modules.modules;
        (0, utils_1.writelog)("modules ", modules.modules);
        // Find all assessments and grades that correspond to the modules
        modules = yield Promise.all(modules.map((module) => __awaiter(void 0, void 0, void 0, function* () {
            const assessments = yield Assessment_1.default.find({
                moduleId: { $in: module._id },
            });
            const grades = yield Grade_1.default.find({ moduleId: { $in: module._id } });
            if (assessments.length !== grades.length) {
                (0, utils_1.writelog)("Arrays are not the same");
            }
            else if (!assessments.length || !grades.length) {
                (0, utils_1.writelog)("assessment or grade does not exist");
            }
            else if (!grades.every((item) => item.approved)) {
                (0, utils_1.writelog)("not all are approved");
            }
            else {
                // Check if the objects in each array are the same
                const isEqual = assessments.every((obj, index) => {
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
        })));
        (0, utils_1.writelog)("modules ", modules);
        // writelog("assessments ", assessments);
        // writelog("grades ", grades);
        // // Check if the number of assessments and grades match
        // if (assessments.length !== grades.length) {
        //   // The number of assessments and grades do not match, assign completed to false
        //   modules = modules.map((module: any) => ({
        //     ...module,
        //     completed: false,
        //   }));
        // } else {
        //   // The number of assessments and grades match, check if the ids are the same
        //   const assessmentIdsSet = new Set(
        //     assessments.map((assessment) => assessment._id.toString())
        //   );
        //   const gradeIdsSet = new Set(
        //     grades.map((grade: any) => grade._id.toString())
        //   );
        //   const idsMatch = [...assessmentIdsSet].every((id) =>
        //     gradeIdsSet.has(id)
        //   );
        //   console.log(idsMatch);
        //   // Assign completed to true or false based on whether the ids match
        //   modules = modules.map((module: any) => ({
        //     ...module,
        //     completed: idsMatch,
        //   }));
        // }
        res.json(modules);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/module/addModule
// @desc    Add module given courseName & module
// return   updated doc if the module is successfully saved in db.
router.post("/module/addModule", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const module = req.query.module;
    try {
        const update = yield Course_1.default.findByIdAndUpdate(id, { $push: { modules: { moduleName: module } } }, { new: true });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/module/updateModule
// @desc    Update moduleName given courseName & prevModuleName
// return   updated doc if the module is successfully updated in db.
router.post("/module/updateModule", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.query.courseId;
    const moduleId = req.query.moduleId;
    const newModuleName = req.query.newModuleName;
    try {
        const update = yield Course_1.default.findByIdAndUpdate(courseId, { $set: { "modules.$[modulesFilter].moduleName": newModuleName } }, {
            arrayFilters: [
                {
                    "modulesFilter._id": moduleId,
                },
            ],
            new: true,
        });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/module/deleteModule
// @desc    Delete module given courseName & module
// return   updated doc if the module is successfully deleted from db.
router.post("/module/deleteModule", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.query.courseId;
    const moduleId = req.query.moduleId;
    try {
        const update = yield Course_1.default.findByIdAndUpdate(courseId, { $pull: { modules: { _id: moduleId } } }, { new: true });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   GET api/course/module/lesson
// @desc    Get all lessons under a specific module with _id
// return   all courses
router.get("/module/lesson", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const module_id = req.query.module_id;
    try {
        const modules = yield Course_1.default.findOne({ "modules._id": module_id }, {
            _id: 0,
        });
        let SelectedModule = modules.modules.filter((module) => module._id.toString() === module_id);
        // @ts-ignore
        SelectedModule.push({ courseName: modules.courseName });
        res.json(SelectedModule);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/module/lesson/addLesson
// @desc    Add Lesson given courseName & moduleName
// return   updated doc if the lesson has been successfully added from db.
router.post("/module/lesson/addLesson", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.body.courseId;
    const moduleId = req.body.moduleId;
    // lesson
    const title = req.body.title;
    const objectives = req.body.objectives;
    const overview = req.body.overview;
    const keyTerms = req.body.keyTerms;
    const content = req.body.content;
    try {
        const update = yield Course_1.default.findByIdAndUpdate(courseId, {
            $push: {
                "modules.$[modulesFilter].lessons": {
                    title,
                    objectives,
                    overview,
                    keyTerms,
                    content,
                },
            },
        }, {
            arrayFilters: [
                {
                    "modulesFilter._id": moduleId,
                },
            ],
            new: true,
        });
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
function removeEmpty(obj) {
    return Object.fromEntries(
    // @ts-ignore
    Object.entries(obj).filter(([_, v]) => v.length > 0));
}
// @route   POST api/course/updateLesson
// @desc    Update module given courseName & module
// return   updated doc if the lesson has been successfully added from db.
router.post("/module/lesson/updateLesson", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            update = yield Course_1.default.findOneAndUpdate({ "modules.lessons._id": lesson_id }, {
                $set: {
                    "modules.$[modulesFilter].lessons.$[lessonsFilter].title": filteredLesson.title,
                },
            }, {
                arrayFilters: [
                    {
                        "modulesFilter._id": module_id,
                    },
                    {
                        "lessonsFilter._id": lesson_id,
                    },
                ],
                new: true,
            });
        }
        if (objectives) {
            update = yield Course_1.default.findOneAndUpdate({ "modules.lessons._id": lesson_id }, {
                $set: {
                    "modules.$[modulesFilter].lessons.$[lessonsFilter].objectives": filteredLesson.objectives,
                },
            }, {
                arrayFilters: [
                    {
                        "modulesFilter._id": module_id,
                    },
                    {
                        "lessonsFilter._id": lesson_id,
                    },
                ],
                new: true,
            });
        }
        if (overview) {
            update = yield Course_1.default.findOneAndUpdate({ "modules.lessons._id": lesson_id }, {
                $set: {
                    "modules.$[modulesFilter].lessons.$[lessonsFilter].overview": filteredLesson.overview,
                },
            }, {
                arrayFilters: [
                    {
                        "modulesFilter._id": module_id,
                    },
                    {
                        "lessonsFilter._id": lesson_id,
                    },
                ],
                new: true,
            });
        }
        if (keyTerms) {
            update = yield Course_1.default.findOneAndUpdate({ "modules.lessons._id": lesson_id }, {
                $set: {
                    "modules.$[modulesFilter].lessons.$[lessonsFilter].keyTerms": filteredLesson.keyTerms,
                },
            }, {
                arrayFilters: [
                    {
                        "modulesFilter._id": module_id,
                    },
                    {
                        "lessonsFilter._id": lesson_id,
                    },
                ],
                new: true,
            });
        }
        if (content) {
            update = yield Course_1.default.findOneAndUpdate({ "modules.lessons._id": lesson_id }, {
                $set: {
                    "modules.$[modulesFilter].lessons.$[lessonsFilter].content": filteredLesson.content,
                },
            }, {
                arrayFilters: [
                    {
                        "modulesFilter._id": module_id,
                    },
                    {
                        "lessonsFilter._id": lesson_id,
                    },
                ],
                new: true,
            });
        }
        res.json(update);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
// @route   POST api/course/addLesson
// @desc    Delete module given courseName & module
// return   updated doc if the lesson has been successfully added from db.
router.post("/module/lesson/deleteLesson", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const module_id = req.body.module_id;
    const lesson_id = req.body.lesson_id;
    try {
        const update = yield Course_1.default.findOneAndUpdate({ "modules.lessons._id": lesson_id }, {
            $pull: {
                "modules.$[modulesFilter].lessons": {
                    _id: lesson_id,
                },
            },
        }, {
            arrayFilters: [
                {
                    "modulesFilter._id": module_id,
                },
            ],
        });
        const modules = yield Course_1.default.findOne({ "modules._id": module_id }, {
            _id: 0,
        });
        let SelectedModule = modules.modules.filter((module) => module._id.toString() === module_id);
        // @ts-ignore
        SelectedModule.push({ courseName: modules.courseName });
        res.json(SelectedModule);
    }
    catch (err) {
        (0, utils_1.SERVER_ERROR)(res, err);
    }
}));
exports.default = router;
//# sourceMappingURL=course.js.map