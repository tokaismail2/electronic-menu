import mongoose, { Document, Schema, Types } from 'mongoose';


export interface IUser extends Document {
  _id: Types.ObjectId;
  user_name: string;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

const UserSchema: Schema = new Schema({
  user_name: {
    type: String,
    required: [true, 'User name is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UserSchema.index({ user_name: 1 }, { unique: true });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);