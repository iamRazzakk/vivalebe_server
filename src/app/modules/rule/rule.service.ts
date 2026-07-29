import { StatusCodes } from "http-status-codes";
import { IRule } from "./rule.interface";
import { RuleModel } from "./rule.model";
import { RULE_TYPE } from "../../../enums/rule";

//create rule in db
const createRuleInToDB = async (
  payload: IRule,
): Promise<{ message: string; result: IRule | null }> => {
  const existingRule = await RuleModel.findOne({
    type: payload.type,
  });
  if (existingRule) {
    await RuleModel.findOneAndUpdate(
      { type: payload.type },
      { content: payload.content },
    );
    return {
      message: `${payload.type} updated successfully`,
      result: existingRule,
    };
  }
  const result = await RuleModel.create({
    content: payload.content,
    type: payload.type,
  });
  return { message: `${payload.type} created successfully`, result };
};

const getRuleFromDB = async ({
  type,
}: {
  type: RULE_TYPE;
}): Promise<IRule | null> => {
  const result = await RuleModel.findOne({ type });
  if (!result) {
    return null;
  }
  return result.toObject();
};

export const RuleService = {
  createRuleInToDB,
  getRuleFromDB,
};
