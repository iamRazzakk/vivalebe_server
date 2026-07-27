import { Schema, model } from "mongoose";
import {
  IPrivateFileAccess,
  PrivateFileAccessModel,
} from "./privateFileAccess.interface";

const privateFileAccessSchema = new Schema<
  IPrivateFileAccess,
  PrivateFileAccessModel
>(
  {
    requestedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAccessGranted: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

privateFileAccessSchema.index(
  { requestedUserId: 1, providedUserId: 1 },
  { unique: true },
);

export const PrivateFileAccess = model<
  IPrivateFileAccess,
  PrivateFileAccessModel
>("PrivateFileAccess", privateFileAccessSchema);
