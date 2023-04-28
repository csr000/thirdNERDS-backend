import { Document, model, Schema } from "mongoose";

/**
 * Interface to model the Course Schema for TypeScript.
 * @param courseName:string
 * @param modules:IModule[]
 * @param lessons:ILesson[]
 */

interface ILesson extends Document {
  title: string;
  content: string;
}

interface IModule extends Document {
  moduleName: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  courseName: string;
  modules: IModule[];
}

export interface IFilteredDoc {
  _id: Schema.Types.ObjectId;
  courseName?: string;
  moduleName?: string;
}

const lessonSchema: Schema = new Schema({
  title: String,
  content: String,
  objectives: String,
  overview: String,
  keyTerms: String,
});

const moduleSchema: Schema = new Schema({
  moduleName: String,
  lessons: [lessonSchema],
});

const courseSchema: Schema = new Schema({
  courseName: String,
  modules: [moduleSchema],
});

const Course = model<ICourse>("Course", courseSchema);

export default Course;
