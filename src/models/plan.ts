import mongoose, { Document, Schema, Types } from 'mongoose';


export interface IPlan extends Document {
    _id: Types.ObjectId;
    name: string;
    price: number;
    status: 'active' | 'inactive';
    billing_cycle: 'monthly' | 'yearly';
    description: string;
}

const PlanSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    billing_cycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

PlanSchema.index({ name: 1 });
PlanSchema.index({ status: 1 });
PlanSchema.index({ billing_cycle: 1 });
PlanSchema.index({ price: 1 });

export default mongoose.model<IPlan>('Plan', PlanSchema);