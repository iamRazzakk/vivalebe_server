import { Model, Types } from "mongoose";

export type IPrivateFileAccess = {
  requestedUserId: Types.ObjectId;
  providedUserId: Types.ObjectId;
  isAccessGranted: boolean;
  message: string;
};

export type PrivateFileAccessModel = Model<IPrivateFileAccess>;
