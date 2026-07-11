import { Schema, model } from 'mongoose';
import { ILike, LikeModel } from './like.interface';

const likeSchema = new Schema<ILike, LikeModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
}, {
  timestamps: true,
});
likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Like = model<ILike, LikeModel>('Like', likeSchema);
