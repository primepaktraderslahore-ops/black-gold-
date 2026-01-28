import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferralCode extends Document {
    code: string;
    discountPercentage: number;
    maxUses?: number; // Infinite if null
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReferralCodeSchema: Schema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        discountPercentage: { type: Number, required: true, min: 0, max: 100 },
        maxUses: { type: Number },
        usedCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const ReferralCode: Model<IReferralCode> = mongoose.models.ReferralCode || mongoose.model<IReferralCode>('ReferralCode', ReferralCodeSchema);

export default ReferralCode;
