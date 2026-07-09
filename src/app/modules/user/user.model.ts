import { model, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IUser, UserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import { genderEnum } from "../../../enums/gender";
import { educationEnum } from "../../../enums/education";
import { relationStatusEnum } from "../../../enums/relationStatus";
import { livingWithEnum } from "../../../enums/living";

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email!",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      select: 0,
      minlength: 8,
    },
    onboardingComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      default: USER_ROLES.USER,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DEACTIVE"],
      required: true,
      default: "ACTIVE",
    },
    phone: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      default: "/image.png",
    },


    //updated data for profile
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      required: false,
    },
    lookingFor: {
      type: String,
      enum: Object.values(genderEnum),
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },

    zidCode: {
      type: Number,
      required: false,
    },
    nationality: {
      type: String,
      required: false,
    },
    DOB: {
      type: String,
      required: false,
    },
    livingWith: {
      type: String,
      enum: Object.values(livingWithEnum),
      required: false,
    },
    displayName: {
      type: String,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
    weight: {
      type: Number,
      required: false,
    },
    occupation: {
      type: String,
      required: false,
    },
    education: {
      type: String,
      enum: Object.values(educationEnum),
      required: false,
    },
    relationStatus: {
      type: String,
      enum: Object.values(relationStatusEnum),
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    // authentication: {
    //   type: {
    //     isResetPassword: {
    //       type: Boolean,
    //       default: false,
    //     },
    //     oneTimeCode: {
    //       type: Number,
    //       default: null,
    //     },
    //     expireAt: {
    //       type: Date,
    //       default: null,
    //     },
    //   },
    //   select: 0,
    // },
    accountInformation: {
      status: {
        type: Boolean,
        default: false,
      },
      stripeAccountId: {
        type: String,
      },
      externalAccountId: {
        type: String,
      },
      currency: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// for fast lookup
// userSchema.index({ email: 1 });
// if filtering by role often
userSchema.index({ role: 1 });
//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//account check
userSchema.statics.isAccountCreated = async (id: string) => {
  const isUserExist: any = await User.findById(id);
  return isUserExist.accountInformation.status;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre("save", async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exist!");
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config?.bcrypt_salt_rounds || 10),
  );
  next();
});
export const User = model<IUser, UserModal>("User", userSchema);
