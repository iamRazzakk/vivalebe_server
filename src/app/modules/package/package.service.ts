import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPackage } from "./package.interface";
import { Package } from "./package.model";
import mongoose, { Types } from "mongoose";
import { createSubscriptionProduct } from "../../../helpers/createSubscriptionProductHelper";
import stripe from "../../../config/stripe";
import { JwtPayload } from "jsonwebtoken";

const createPackageToDB = async (
  payload: IPackage,
  user: JwtPayload,
): Promise<IPackage | null> => {
  payload.user = new Types.ObjectId(user?.id);
  const productPayload = {
    title: payload.title,
    price: Number(payload.price),

    duration: payload.duration,
  };

  const product = await createSubscriptionProduct(productPayload);

  if (!product) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create subscription product",
    );
  }

  if (product) {
    payload.paymentLink = product.paymentLink;
    payload.productId = product.productId;
    payload.priceId = (product as any).priceId;
  }

  const result = await Package.create(payload);
  if (!result) {
    await stripe.products.del(product.productId);
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Package");
  }

  return result;
};

const updatePackageToDB = async (
  id: string,
  payload: IPackage,
): Promise<IPackage | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result = await Package.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Update Package");
  }

  return result;
};

const getPackageFromDB = async (paymentType: string): Promise<IPackage[]> => {
  const query: any = {
    status: "Active",
  };
  if (paymentType) {
    query.paymentType = paymentType;
  }

  const result = await Package.find(query);
  return result;
};

const getPackageDetailsFromDB = async (
  id: string,
): Promise<IPackage | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }
  const result = await Package.findById(id);
  return result;
};

const deletePackageToDB = async (id: string): Promise<IPackage | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const result = await Package.findByIdAndUpdate(
    { _id: id },
    { status: "Delete" },
    { new: true },
  );

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to deleted Package");
  }

  return result;
};

export const PackageService = {
  createPackageToDB,
  updatePackageToDB,
  getPackageFromDB,
  getPackageDetailsFromDB,
  deletePackageToDB,
};
