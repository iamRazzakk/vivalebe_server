import { JwtPayload } from "jsonwebtoken";
import { IEventBooking } from "./eventbooking.interface";
import { EventBooking } from "./eventbooking.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { Events } from "../events/events.model";
import { User } from "../user/user.model";
import stripe from "../../../config/stripe";
import config from "../../../config";
import Stripe from "stripe";
import { USER_ROLES } from "../../../enums/user";

const createEventBookingInDB = async (
  user: JwtPayload,
  payload: Partial<IEventBooking>,
) => {
  const event = await Events.findOne({
    _id: payload.eventId,
    isDeleted: false,
  }).select("price eventName eventOwner status");

  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Event not found");
  }

  if (event.status !== "upcoming") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Only upcoming events can be booked",
    );
  }

  if (event.eventOwner.toString() === user.id) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You cannot book your own event",
    );
  }

  const existingBooking = await EventBooking.findOne({
    eventId: payload.eventId,
    userId: user.id,
    isDeleted: false,
    paymentStatus: { $ne: "failed" },
  });

  if (existingBooking) {
    if (
      existingBooking.paymentStatus === "pending" &&
      existingBooking.checkoutSessionId
    ) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingBooking.checkoutSessionId,
      );

      if (existingSession.status === "open" && existingSession.url) {
        return {
          booking: existingBooking,
          checkoutUrl: existingSession.url,
        };
      }
    }

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You already have a booking for this event",
    );
  }

  const dbUser = await User.findById(user.id).select("email name");
  if (!dbUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const booking = await EventBooking.create({
    eventId: payload.eventId,
    userId: user.id,
    paymentAmount: event.price,
    currency: "usd",
    paymentStatus: "pending",
    paymentDate: null,
    bookingRequest: "pending",
  });

  if (!booking) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create event booking",
    );
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: dbUser.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.eventName,
            metadata: {
              type: "event_booking",
              bookingId: String(booking._id),
              eventId: String(payload.eventId),
              userId: String(user.id),
            },
          },
          unit_amount: Math.round(event.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "event_booking",
      bookingId: String(booking._id),
      eventId: String(payload.eventId),
      userId: String(user.id),
    },
    success_url: `${config.stripe.paymentSuccess}?bookingId=${booking._id}&status=success`,
    cancel_url: `${config.stripe.paymentSuccess}?bookingId=${booking._id}&status=cancelled`,
  };
  const eventOwner = await User.findById(event.eventOwner).select(
    "accountInformation",
  );

  if (eventOwner?.accountInformation?.stripeAccountId) {
    sessionParams.payment_intent_data = {
      application_fee_amount: Math.round(event.price * 100 * 0.1),
      transfer_data: {
        destination: eventOwner.accountInformation.stripeAccountId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    await EventBooking.findByIdAndDelete(booking._id);
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create Stripe checkout session",
    );
  }

  const updatedBooking = await EventBooking.findByIdAndUpdate(
    booking._id,
    {
      checkoutSessionId: session.id,
      customerId:
        typeof session.customer === "string" ? session.customer : undefined,
    },
    { new: true },
  );

  return {
    booking: updatedBooking,
    checkoutUrl: session.url,
  };
};

const getAllEventBookingsDataFromDB = async (eventId: string) => {
  const result = await EventBooking.find({
    eventId,
    isDeleted: false,
  })
    .populate({
      path: "userId",
      select: "name email profile",
    })
    .populate({
      path: "eventId",
      select: "eventName details price startDate endDate",
    })
    .sort({ createdAt: -1 })
    .lean();

  return result;
};

const getMyEventBookingsFromDB = async (userId: string) => {
  const result = await EventBooking.find({
    userId,
    isDeleted: false,
  })
    .populate({
      path: "eventId",
      select: "eventName details price startDate endDate status eventOwner",
    })
    .sort({ createdAt: -1 })
    .lean();

  return result;
};

const getSingleBookingFromDB = async (id: string, userId: string) => {
  const result = await EventBooking.findOne({
    _id: id,
    userId,
    isDeleted: false,
  })
    .populate({
      path: "eventId",
      select: "eventName details price startDate endDate status",
    })
    .lean();

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  return result;
};

const bookingRequestUpdateInDB = async (
  id: string,
  payload: Partial<IEventBooking>,
  userId: string,
) => {
  const booking = await EventBooking.findById(id).populate({
    path: "eventId",
    select: "eventOwner",
  });

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  //   const eventOwner = (booking.eventId as any)?.eventOwner?.toString();
  //   if (eventOwner !== userId) {
  //     throw new ApiError(
  //       StatusCodes.FORBIDDEN,
  //       "Only event owner can update booking request",
  //     );
  //   }

  if (booking.paymentStatus !== "paid") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cannot update request before payment is completed",
    );
  }

  const result = await EventBooking.findByIdAndUpdate(id, payload, {
    new: true,
  })
    .populate({
      path: "userId",
      select: "name email profile",
    })
    .populate({
      path: "eventId",
      select: "eventName details",
    });

  return result;
};

// admin can reject booking request
const updateBookingRequestInDB = async (
  user: JwtPayload,
  id: string,
  payload: Partial<IEventBooking>,
) => {
  if (user.role !== USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only admin can update booking request",
    );
  }
  const booking = await EventBooking.findById(id).populate({
    path: "eventId",
    select: "eventOwner",
  });

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }
  const result = await EventBooking.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

export const EventBookingServices = {
  createEventBookingInDB,
  getAllEventBookingsDataFromDB,
  getMyEventBookingsFromDB,
  getSingleBookingFromDB,
  bookingRequestUpdateInDB,
  updateBookingRequestInDB,
};
