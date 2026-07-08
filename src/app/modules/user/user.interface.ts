import { Model } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { genderEnum } from "../../../enums/gender";
import { livingWithEnum } from "../../../enums/living";
import { educationEnum } from "../../../enums/education";
import { relationStatusEnum } from "../../../enums/relationStatus";
// Stripe account related sub-document
interface IStripeAccountInfo {
  status: string;
  stripeAccountId: string;
  externalAccountId: string;
  currency: string;
}

// Authentication related (OTP, password reset)
// interface IAuthenticationProps {
//   isResetPassword: boolean;
//   oneTimeCode: number;
//   expireAt: Date;
// }
// Main User interface
export type IUser = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: USER_ROLES;
  onboardingComplete: boolean;
  status: "ACTIVE" | "DEACTIVE";
  phone: string;

  // updated data interface
  gender: genderEnum;
  lookingFor: genderEnum;
  country: string;
  state: string;
  zidCode: number;
  nationality: string;
  DOB: string;
  livingWith: livingWithEnum;
  displayName: string;
  height: number;
  weight: number;
  profile: string;
  occupation: string;
  education: educationEnum;
  relationStatus: relationStatusEnum;
  bio: string;


  verified: boolean;
  isBanned: boolean;
  tokenVersion: number;
  // authentication?: IAuthenticationProps;
  accountInformation?: IStripeAccountInfo;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
