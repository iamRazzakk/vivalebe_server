import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";
import { SearchController } from "./search.controller";

const router = express.Router();

router.get(
  "/",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  requirePremiumMembership,
  SearchController.getMySearches,
);

export const SearchRoutes = router;
