import { Request, Response } from "express";
import { EventBookingServices } from "./eventbooking.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const payload = req.body;

  const result = await EventBookingServices.createEventBookingInDB(
    user,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Event booking created successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await EventBookingServices.getAllEventBookingsDataFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event bookings fetched successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;

  const result = await EventBookingServices.getMyEventBookingsFromDB(user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "My event bookings fetched successfully",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req;

  const result = await EventBookingServices.getSingleBookingFromDB(id, user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Booking fetched successfully",
    data: result,
  });
});

const updateBookingRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req;
  const payload = req.body;

  const result = await EventBookingServices.bookingRequestUpdateInDB(
    id,
    payload,
    user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Event booking request updated successfully",
    data: result,
  });
});

export const EventBookingController = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getSingleBooking,
  updateBookingRequest,
};
