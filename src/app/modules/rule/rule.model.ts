import { IRule } from "./rule.interface";
import { RULE_TYPE } from "../../../enums/rule";
import { model, Schema } from "mongoose";

const ruleSchema = new Schema({
  content: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: RULE_TYPE },
});

export const RuleModel = model<IRule>("Rule", ruleSchema);
