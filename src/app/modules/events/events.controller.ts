import { Request, Response, NextFunction } from "express";
import { EventsServices } from "./events.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.createEventIntoDB(
    req.body,
    req.user as JwtPayload,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Event created successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.updateEventsIntoDB(
    req.params.id,
    req.body,
    req.user as JwtPayload,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.deleteEventsFromDB(
    req.params.id,
    req.user as JwtPayload,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event deleted successfully",
    data: result,
  });
});

const retrieveEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.retrieveEventFromDBForAdminSecurity(
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event retrieved successfully",
    data: result,
  });
});

const myEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.myEventsFromDB(req.user as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "My events retrieved successfully",
    data: result,
  });
});

const getAllEventsForPublic = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EventsServices.getAllEventsForPublicFromDB(req.query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "All events for public retrieved successfully",
      pagination: result.meta,
      data: result.data,
    });
  },
);

const singleEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.singleEventFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event retrieved successfully",
    data: result,
  });
});


const deleteEventAsUser = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.deleteEventFromDBAsUser(
    req.params.id,
    req.user as JwtPayload,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event deleted successfully",
    data: result,
  });
});
const deleteEventAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await EventsServices.deleteEventFromDBForAdminSecurity(
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event deleted successfully",
    data: result,
  });
});

export const EventsController = {
  createEvent,
  updateEvent,
  deleteEvent,
  retrieveEvent,
  myEvents,
  getAllEventsForPublic,
  singleEvent,
  deleteEventAsUser,
  deleteEventAsAdmin,
};
