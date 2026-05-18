import mongoose, { Document, Schema, Types } from 'mongoose';


export interface ISubscription extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  plan_id: Types.ObjectId;
  start_date: Date;
  end_date: Date;
  status : 'active' | 'inactive';
  payment_method: 'cash' | 'online';
  isCustom : boolean;
}

const SubscriptionSchema: Schema = new Schema({
  user_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'User id is required'],
  },
  plan_id: {
    type: Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan id is required'],
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  payment_method: {
    type: String,
    enum: ['cash', 'online'],
    default: 'cash'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

SubscriptionSchema.index({ user_id: 1 });
SubscriptionSchema.index({ plan_id: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);