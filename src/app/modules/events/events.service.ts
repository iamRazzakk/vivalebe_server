import { JwtPayload } from "jsonwebtoken";
import { IEvents } from "./events.interface";
import { Events } from "./events.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/queryBuilder";

const createEventIntoDB = async (payload: IEvents, user: JwtPayload) => {
  payload.eventOwner = user.id;
  const result = await Events.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create event",
    );
  }
  return result;
};

const updateEventsIntoDB = async (
  id: string,
  payload: IEvents,
  user: JwtPayload,
) => {
  const event = await Events.findById(id, { isDeleted: false }).lean();
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }
  if (event.eventOwner.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this event",
    );
  }
  const result = await Events.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteEventsFromDB = async (id: string, user: JwtPayload) => {
  const event = await Events.findById(id);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }
  if (event.eventOwner.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this event",
    );
  }
  const result = await Events.findByIdAndDelete(id);
  return result;
};

const myEventsFromDB = async (user: JwtPayload) => {
  const events: IEvents[] = await Events.find({ eventOwner: user.id }).lean();
  if (events.some((event) => event.isDeleted)) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Admin restricted to see deleted events",
    );
  }
  return events ? events : [];
};

const getAllEventsForPublicFromDB = async (queue: Record<string, unknown>) => {
  const qb = new QueryBuilder(
    Events.find({ visibility: "public", isDeleted: false }),
    queue,
  )
    .fields()
    .filter()
    .sort()
    .cursorPaginate()
    .populate(["eventOwner"], {
      eventOwner: "name email profile nationality country state",
    });
  const [data, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return { data, meta };
};

const deleteEventFromDBForAdminSecurity = async (id: string) => {
  const event = await Events.findById(id).lean();
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }
  if (event.isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event is already deleted");
  }
  const result = await Events.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

const retrieveEventFromDBForAdminSecurity = async (id: string) => {
  const event = await Events.findById(id).lean();
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }
  const result = await Events.findByIdAndUpdate(
    id,
    { isDeleted: false },
    { new: true },
  );
  return result;
};

const deleteEventFromDBAsUser = async (id: string, user: JwtPayload) => {
  const event = await Events.findById(id).lean();
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }
  if (event.eventOwner.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this event",
    );
  }
  const result = await Events.findByIdAndDelete(id);
  return result;
};

const singleEventFromDB = async (id: string) => {
  const event = await Events.findById(id).lean();
  if (event?.isDeleted!) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Admin restricted to see deleted events",
    );
  }
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }
  return event;
};

export const EventsServices = {
  createEventIntoDB, //
  updateEventsIntoDB, //
  deleteEventsFromDB, //
  myEventsFromDB, //
  getAllEventsForPublicFromDB, //
  deleteEventFromDBForAdminSecurity,
  deleteEventFromDBAsUser,
  retrieveEventFromDBForAdminSecurity,
  singleEventFromDB, //
};
