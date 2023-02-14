import { Document, model, Schema } from "mongoose";
import { IUser } from "./User";
import { ICourse } from "./Course";

/**
 * Interface to model the EnrolledCourse Schema for TypeScript.
 * @param user:ref => User._id
 * @param enrolledCourses: ref => ICourse._id;
 */

export interface IEnrolledCourse extends Document {
  user: IUser["_id"];
  enrolledCourses: Array<string>;
}

const enrolledCourseSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  enrolledCourses: {
    type: Array,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const EnrolledCourse = model<IEnrolledCourse>(
  "EnrolledCourse",
  enrolledCourseSchema
);

export default EnrolledCourse;
