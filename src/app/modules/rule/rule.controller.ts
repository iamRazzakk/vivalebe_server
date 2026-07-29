import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RuleService } from "./rule.service";
import catchAsync from "../../../shared/catchAsync";
import { IRule } from "./rule.interface";
import sendResponse from "../../../shared/sendResponse";
import { RULE_TYPE } from "../../../enums/rule";
import ApiError from "../../../errors/ApiErrors";

//create rule
const createRule = catchAsync(async (req: Request, res: Response) => {
  const result = await RuleService.createRuleInToDB(req.body as IRule);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result,
  });
});

const getRule = catchAsync(async (req: Request, res: Response) => {
  const type = req.query.type as RULE_TYPE;
  if (!type) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rule type is required");
  }

  const result = await RuleService.getRuleFromDB({ type });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `${type} retrieved successfully`,
    data: result,
  });
});

export const RuleController = {
  createRule,
  getRule,
};
