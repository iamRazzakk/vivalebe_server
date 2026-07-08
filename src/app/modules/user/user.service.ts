import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailProducer } from "../../../services/email.producer";
import { randomUUID } from "crypto";
import { dataStoreToRedis } from "../../../redis/redis.store";


const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (
    payload?.confirmPassword !== undefined &&
    payload?.password !== payload?.confirmPassword
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and confirm password do not match",
    );
  }
  delete payload?.confirmPassword;

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };

  const emailJobId = randomUUID();
  const createAccountTemplate = emailTemplate.createAccount(values);
  const emailData = {
    jobId: emailJobId,
    to: createAccountTemplate.to,
    subject: createAccountTemplate.subject,
    html: createAccountTemplate.html,
    type: "create_account",
  };

  await emailProducer.sendEmailEvent(emailData);
  //save to DB

  // need to store this in redis not the DB
  await dataStoreToRedis(`authentication:${createUser._id.toString()}`, JSON.stringify({
    email: createUser.email,
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  }), 3 * 60000);

  // const authentication = {
  //   oneTimeCode: otp,
  //   expireAt: new Date(Date.now() + 3 * 60000),
  // };

  // await User.findOneAndUpdate(
  //   { _id: createUser._id },
  //   { $set: { authentication } },
  // );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser: any = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return updateDoc;
};



const updateOnboardingCompleteToDB = async (user: JwtPayload, payload: Partial<IUser>) => {
  const { id } = user;
  const isExistUser = await User.findOne({ _id: id }).lean();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateDoc = await User.findOneAndUpdate({ _id: id }, {
    ...payload,
    onboardingComplete: true,
    updatedAt: new Date(),
  }, {
    new: true,
  });
  return updateDoc;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  updateOnboardingCompleteToDB
};
