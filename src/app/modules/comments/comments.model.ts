import { Schema, model } from 'mongoose';
import { IComments, CommentsModel } from './comments.interface';

const commentsSchema = new Schema<IComments, CommentsModel>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  comment: { type: String, required: true },
}, { timestamps: true });


commentsSchema.index({ postId: 1 }, { unique: true });
export const Comments = model<IComments, CommentsModel>('Comments', commentsSchema);
