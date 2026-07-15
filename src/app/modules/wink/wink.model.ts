import { Schema, model } from 'mongoose';
import { IWink, WinkModel } from './wink.interface';

const winkSchema = new Schema<IWink, WinkModel>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});




export const Wink = model<IWink, WinkModel>('Wink', winkSchema);
