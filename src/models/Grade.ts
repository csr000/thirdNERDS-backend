import { Document, model, Schema } from "mongoose";
import { IUser } from "./User";

/**
 * Interface to model the Grade Schema for TypeScript.
 * @param user:ref => User._id
 * @param grades: ref => IGrade._id;
 */

export interface IGrade extends Document {
  user: IUser["_id"];
  grades: Array<IScore>;
}

interface IScore {
  [key: string]: {
    mcq: string;
    theory: string;
  };
}

const gradeSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  moduleId: { type: Schema.Types.ObjectId },
  lessonId: { type: Schema.Types.ObjectId },
  theoryAnswer: { type: String},
  remarks: { type: String},
  approved: { type: Boolean },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Grade = model<IGrade>("Grade", gradeSchema);

export default Grade;

// {
//   lessonId: String,
//   score: {
//     mcq: String,
//     theory: String,
//   }
