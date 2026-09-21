import { Request, Response, NextFunction } from "express";
import { ContactServices } from "./contact.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const contact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, subject, email, phone, message, language } = req.body;
    const contact = await ContactServices.contactWithAdmin(
      {
        name,
        subject,
        email,
        phone,
        message,
      },
      language,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Contact created successfully",
      data: contact,
    });
  },
);

export const ContactController = {
  contact,
};
