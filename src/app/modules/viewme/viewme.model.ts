import { Schema, model } from 'mongoose';
import { IViewme, ViewmeModel } from './viewme.interface';

const viewmeSchema = new Schema<IViewme, ViewmeModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viewedUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

viewmeSchema.index(
  {
    user: 1,
    viewedUser: 1,
  },
  {
    unique: true,
  }
);

export const Viewme = model<IViewme, ViewmeModel>('Viewme', viewmeSchema);
