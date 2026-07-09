import { Model, Types } from 'mongoose';

export type IViewme = {
  user: Types.ObjectId;
  viewedUser: Types.ObjectId;
};

export type ViewmeModel = Model<IViewme>;
