import { Document, model, Schema } from "mongoose";
import { IUser } from "./User";

export interface IAssessment extends Document {
  moduleId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  mcq: [
    {
      question: String;
      options: { a: String; b: String; c: String; d: String };
      answer: String;
      _id?: string;
      incorrect?: boolean;
    }
  ];
  theory: String;
  dateCreated: Date;
}

const assessmentSchema: Schema = new Schema({
  moduleId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  mcq: {
    type: [
      {
        question: String,
        options: { a: String, b: String, c: String, d: String },
        answer: String,
      },
    ],
  },
  theory: {
    type: String,
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Assessment = model<IAssessment>("Assessment", assessmentSchema);

export default Assessment;
