import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContent extends Document {
    key: string;
    value: string; // Stored as JSON string
}

const ContentSchema: Schema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: String, required: true },
    },
    { timestamps: true }
);

const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;
