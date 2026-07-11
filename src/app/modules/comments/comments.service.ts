import { JwtPayload } from 'jsonwebtoken';
import { IComments } from './comments.interface';
import { Comments } from './comments.model';

const createCommentsIntoDB = async (payload: IComments, user: JwtPayload) => {
    payload.userId = user.id;
    const comment = await Comments.create(payload);
    return comment;
}

const updateCommentsInDB = async (id: string, payload: IComments, user: JwtPayload) => {
    payload.userId = user.id;
    const comment = await Comments.findByIdAndUpdate(id, payload, { new: true });
    return comment;
}



export const CommentsServices = {};
