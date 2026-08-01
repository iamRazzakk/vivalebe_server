import { Model } from "mongoose";

export type IContact = {
  name: string;
  subject: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactModel = Model<IContact>;
