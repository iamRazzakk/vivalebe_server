import { NextFunction, Request, Response, Router } from "express";
import { RuleController } from "./rule.controller";

import { RuleValidation } from "./rule.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
const router = Router();

const validateRuleQuery = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = RuleValidation.getRuleQueryZodSchema.safeParse({
    query: req.query,
  });

  if (!result.success) {
    next(result.error);
    return;
  }

  next();
};

//create rule
router
  .route("/")
  .post(
    auth(USER_ROLES.SUPER_ADMIN),
    validateRequest(RuleValidation.createRuleZodSchema),
    RuleController.createRule,
  )
  .get(validateRuleQuery, RuleController.getRule);

export const ruleRoutes = router;
