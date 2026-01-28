import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPopup extends Document {
    image: string;
    text: string; // Optional text overlay
    location: 'home' | 'cart';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PopupSchema: Schema = new Schema(
    {
        image: { type: String, required: true },
        text: { type: String },
        location: { type: String, enum: ['home', 'cart'], default: 'home' },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Force model rebuild in dev
if (process.env.NODE_ENV !== 'production') {
    delete mongoose.models.Popup;
}

const Popup: Model<IPopup> = mongoose.models.Popup || mongoose.model<IPopup>('Popup', PopupSchema);

export default Popup;
