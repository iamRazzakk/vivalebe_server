import { Schema, model } from 'mongoose';
import { IPosts, PostsModel } from './posts.interface';

const postsSchema = new Schema<IPosts, PostsModel>({
  description: {
    type: String,
    required: true,
  },
  content: {
    type: [String],
    required: true,
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["IMAGE", "VIDEO"],
    required: true,
  },
}, {
  timestamps: true,
});

postsSchema.index({ user: 1, createdAt: -1 });
postsSchema.index({ user: 1, type: 1, createdAt: -1, _id: -1 });

export const Posts = model<IPosts, PostsModel>('Posts', postsSchema);
