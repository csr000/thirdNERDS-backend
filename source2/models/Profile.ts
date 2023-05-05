import { Document, model, Schema } from "mongoose";
import { IUser } from "./User";

/**
 * Interface to model the Profile Schema for TypeScript.
 * @param user:ref => User._id
 * @param firstName:string
 * @param lastName:string
 * @param email:string
 * @param platform:string
 * @param git:string
 * @param linkedIn:string
 */

export interface IProfile extends Document {
  user: IUser["_id"];
  firstName: string;
  lastName: string;
  email: string;
  platform: string;
  git: string;
  linkedIn: string;
}

const profileSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  platform: {
    type: String,
  },
  git: {
    type: String,
  },
  linkedIn: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
