import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ChatService } from "./chat.service";

const createChat = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const otherUser = req.params.id;
  const data = req.body;
  const participants = [user?.id, otherUser];
  const chat = await ChatService.createChatToDB(participants, data, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Create Chat Successfully",
    data: chat,
  });
});

const getChat = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const search = req.query.search as string;
  const chatList = await ChatService.getChatFromDB(user, search);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chat Retrieve Successfully",
    data: chatList,
  });
});

const getSingleChat = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const chat = await ChatService.getSingleChatFromDB(id, req.user!.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chat Retrieve Successfully",
    data: chat,
  });
});

const blockUserFromChat = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user!.id;
  const payload = req.body;
  const chat = await ChatService.blockUserFromChatIntoDB(id, userId, payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User Blocked from Chat Successfully",
    data: chat,
  });
});

export const ChatController = {
  createChat,
  getChat,
  getSingleChat,
  blockUserFromChat,
};
