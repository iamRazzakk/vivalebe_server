import { z } from "zod";
import { RULE_TYPE } from "../../../enums/rule";

const createRuleZodSchema = z.object({
  body: z.object({
    content: z.string({ message: "Rule content is required" }),
    type: z.nativeEnum(RULE_TYPE, { message: "Rule type is required" }),
  }),
});

const getRuleQueryZodSchema = z.object({
  query: z.object({
    type: z.nativeEnum(RULE_TYPE),
  }),
});

export const RuleValidation = {
  createRuleZodSchema,
  getRuleQueryZodSchema,
};
