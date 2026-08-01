import express from "express";
import { ContactController } from "./contact.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ContactValidations } from "./contact.validation";

const router = express.Router();

router.post(
  "/",
  validateRequest(ContactValidations.createContactZodSchema),
  ContactController.contact,
);

export const ContactRoutes = router;
