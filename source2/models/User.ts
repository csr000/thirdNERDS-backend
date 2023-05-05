import { Document, model, Schema } from "mongoose";

/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param password:string
 * @param permission:string
 * @param avatar:string
 * @param enrolledCourse:Schema.Types.ObjectId
 * @param hash:string
 * @param date:Schema.Types.Date
 */

export interface IUser extends Document {
  email: string;
  password: string;
  permission: string;
  avatar: string;
  enrolledCourse: Schema.Types.ObjectId;
  hash: string;
  date: Schema.Types.Date;
}

export interface IFilteredUsersDoc {
  email: string;
  permission: string;
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  permission: {
    type: String,
    required: true,
  },
  enrolledCourse: {
    type: Schema.Types.ObjectId,
    ref: "EnrolledCourse",
  },
  hash: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = model<IUser>("User", userSchema);

export default User;
