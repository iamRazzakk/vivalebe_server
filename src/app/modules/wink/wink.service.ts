import { JwtPayload } from 'jsonwebtoken';
import { IWink, WinkModel } from './wink.interface';
import { Wink } from './wink.model';
import { Types } from 'mongoose';
import { sendNotificationToQueue } from '../../../helpers/notificationQueueHelper';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';



const createWinkIntoDB = async (payload: IWink, user: JwtPayload) => {
    const wink = await Wink.create({
        ...payload,
        senderId: new Types.ObjectId(user.id),
    });
    const sender = await User.findById(new Types.ObjectId(user.id)).lean();
    if (!sender) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    // sending notificaiton using queue
    await sendNotificationToQueue({
        text: `${sender?.name || 'Someone'} winked at you`,
        receiver: new Types.ObjectId(payload.receiverId),
        referenceId: wink._id.toString(),
        read: false,
    });

    return wink;
};



const getSingleWinkFromDB = async (id: string) => {
    const wink = await Wink.findById(new Types.ObjectId(id)).lean();
    return wink;
};


export const WinkServices = { createWinkIntoDB, getSingleWinkFromDB };
