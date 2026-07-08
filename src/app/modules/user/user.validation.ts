import { z } from "zod";
import { USER_ROLES } from "../../../enums/user";
import { genderEnum } from "../../../enums/gender";
import { educationEnum } from "../../../enums/education";
import { relationStatusEnum } from "../../../enums/relationStatus";
import { livingWithEnum } from "../../../enums/living";

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" }),
    role: z.enum(Object.values(USER_ROLES) as [string, ...string[]], {
      required_error: "Role is required",
    }),
  }),
});

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" }),
    confirmPassword: z.string({ required_error: "Confirm password is required" }),
    onboardingComplete: z.boolean({ required_error: "Onboarding complete is required" }),
    role: z.enum(Object.values(USER_ROLES) as [string, ...string[]], {
      required_error: "Role is required",
    }),
    profile: z.string({ required_error: "Profile is required" }).optional(),
  }).strict(),
});


const onboardingCompleteZodSchema = z.object({
  body: z.object({
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
    DOB: z.string({ required_error: "Date of birth is required" }),
    livingWith: z.enum(Object.values(livingWithEnum) as [string, ...string[]], {
      required_error: "Living with is required",
    }),
    displayName: z.string({ required_error: "Display name is required" }),
    height: z.number({ required_error: "Height is required" }),
    weight: z.number({ required_error: "Weight is required" }),
    profile: z.string({ required_error: "Profile is required" }),
    occupation: z.string({ required_error: "Occupation is required" }),
    education: z.enum(Object.values(educationEnum) as [string, ...string[]], {
      required_error: "Education is required",
    }),
    relationStatus: z.enum(Object.values(relationStatusEnum) as [string, ...string[]], {
      required_error: "Relation status is required",
    }),
    bio: z.string({ required_error: "Bio is required" }),
  }).strict(),
});



export const UserValidation = { createAdminZodSchema, createUserZodSchema };
