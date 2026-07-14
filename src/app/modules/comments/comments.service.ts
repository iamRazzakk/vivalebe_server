import { JwtPayload } from 'jsonwebtoken';
import { IComments } from './comments.interface';
import { Comments } from './comments.model';
import QueryBuilder from '../../builder/queryBuilder';

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


const deleteCommentsFromDB = async (id: string, user: JwtPayload) => {
    const comment = await Comments.findByIdAndDelete(id, { userId: user.id });
    return comment;
}

const getCommentsByPostId = async (id: string, query: Record<string, any>) => {
    const qb = new QueryBuilder(Comments.find({ postId: id }), query).filter().sort().paginate().populate(["userId"], { "userId": "name email profile" });
    const data = await qb.modelQuery.lean();
    const meta = await qb.getPaginationInfo();
    return {
        data,
        meta,
    }
}


export const CommentsServices = {
    createCommentsIntoDB,
    updateCommentsInDB,
    deleteCommentsFromDB,
    getCommentsByPostId,
};
