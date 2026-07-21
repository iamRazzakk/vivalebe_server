import { z } from "zod";
import { USER_ROLES } from "../../../enums/user";
import { genderEnum } from "../../../enums/gender";
import { educationEnum } from "../../../enums/education";
import { relationStatusEnum } from "../../../enums/relationStatus";
import { livingWithEnum } from "../../../enums/living";

const createUserZodSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: "Name is required" }),
      email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" }),
      password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" }),
      role: z
        .enum(Object.values(USER_ROLES) as [string, ...string[]], {
          required_error: "Role is required",
        })
        .optional(),
      confirmPassword: z
        .string({ required_error: "Confirm password is required" })
        .optional(),
      profile: z.string({ required_error: "Profile is required" }).optional(),
      protectedImages: z
        .string({ required_error: "Protected images is required" })
        .optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.confirmPassword === undefined ||
        data.password === data.confirmPassword,
      {
        message: "Password and confirm password do not match",
        path: ["confirmPassword"],
      },
    ),
});

const onboardingCompleteZodSchema = z.object({
  body: z
    .object({
      email: z.string().optional(),
      gender: z.enum(Object.values(genderEnum) as [string, ...string[]], {
        required_error: "Gender is required",
      }),
      lookingFor: z.enum(Object.values(genderEnum) as [string, ...string[]], {
        required_error: "Looking for is required",
      }),
      country: z.string({ required_error: "Country is required" }),
      state: z.string({ required_error: "State is required" }),
      zidCode: z.number({ required_error: "ZID code is required" }),
      nationality: z.string({ required_error: "Nationality is required" }),
      DOB: z.string({ required_error: "Date of birth is required" }).datetime({
        message: "Invalid date of birth format",
      }),
      livingWith: z.enum(
        Object.values(livingWithEnum) as [string, ...string[]],
        {
          required_error: "Living with is required",
        },
      ),
      displayName: z.string({ required_error: "Display name is required" }),
      height: z.number({ required_error: "Height is required" }),
      weight: z.number({ required_error: "Weight is required" }),
      occupation: z.string({ required_error: "Occupation is required" }),
      education: z.enum(Object.values(educationEnum) as [string, ...string[]], {
        required_error: "Education is required",
      }),
      relationStatus: z.enum(
        Object.values(relationStatusEnum) as [string, ...string[]],
        {
          required_error: "Relation status is required",
        },
      ),
      bio: z.string({ required_error: "Bio is required" }),
    })
    .strict()
    .refine((data) => !data.email, {
      message: "Email cannot be updated after account creation",
      path: ["email"],
    }),
});

const updateProfileZodSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
      role: z
        .enum(Object.values(USER_ROLES) as [string, ...string[]])
        .optional(),
      onboardingComplete: z.boolean().optional(),
      status: z
        .enum(Object.values(["ACTIVE", "DEACTIVE"]) as [string, ...string[]])
        .optional(),
      phone: z.string().optional(),
      profile: z.string().optional(),
      gender: z
        .enum(Object.values(genderEnum) as [string, ...string[]])
        .optional(),
      lookingFor: z
        .enum(Object.values(genderEnum) as [string, ...string[]])
        .optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      zidCode: z.number().optional(),
      nationality: z.string().optional(),
      DOB: z.date().optional(),
      livingWith: z
        .enum(Object.values(livingWithEnum) as [string, ...string[]])
        .optional(),
      displayName: z.string().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      occupation: z.string().optional(),
      education: z
        .enum(Object.values(educationEnum) as [string, ...string[]])
        .optional(),
      relationStatus: z
        .enum(Object.values(relationStatusEnum) as [string, ...string[]])
        .optional(),
      bio: z.string().optional(),
      verified: z.boolean().optional(),
      isBanned: z.boolean().optional(),
      tokenVersion: z.number().optional(),
    })
    .strict()
    .refine((data) => !data.email, {
      message: "Email cannot be changed",
      path: ["email"],
    }),
});

export const UserValidation = {
  createUserZodSchema,
  onboardingCompleteZodSchema,
  updateProfileZodSchema,
};
