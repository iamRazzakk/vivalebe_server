import { Model, Types } from "mongoose";

export type IGuest = {
  userId: Types.ObjectId;
};

export type IEvents = {
  eventName: string;
  type: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  details: string;
  guests: IGuest[];

  visibility: "private" | "public";
  status: "upcoming" | "completed" | "cancelled";

  isDeleted: boolean;
  eventOwner: Types.ObjectId;
};

export type EventsModel = Model<IEvents>;
