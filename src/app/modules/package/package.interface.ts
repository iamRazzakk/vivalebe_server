import { Model, Types } from "mongoose";

export type IPackage = {
  title: String;
  price: Number;
  duration: "1 month" | "3 months" | "6 months";
  paymentType: "Monthly";
  productId?: String;
  paymentLink?: string;
  status: "Active" | "Delete";
  priceId?: string;
  user: Types.ObjectId;
};

export type PackageModel = Model<IPackage, Record<string, unknown>>;
