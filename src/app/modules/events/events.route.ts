import express from "express";
import { EventsController } from "./events.controller";
import validateRequest from "../../middlewares/validateRequest";
import { EventsValidations } from "./events.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router
  .route("/")
  //   create event as user or super admin
  .post(
    validateRequest(EventsValidations.createEventSchemaZodValidation),
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.createEvent,
  )
  //   get all events for public
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.getAllEventsForPublic,
  );

//   my events
router
  .route("/my")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.myEvents,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.singleEvent,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.updateEvent,
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.deleteEvent,
  );

//   remove event as user
router
  .route("/:id/remove")
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.deleteEventAsUser,
  );

router
  .route("/:id/private")
  .patch(auth(USER_ROLES.SUPER_ADMIN), EventsController.deleteEventAsAdmin);
router
  .route("/:id/retrieve")
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    EventsController.retrieveEvent,
  );
export const EventsRoutes = router;
