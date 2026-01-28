import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
}

export interface IUser extends Document {
    email: string;
    password?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional if using OAuth later, but required for email/pass
        role: { type: String, enum: Object.values(UserRole), default: UserRole.ADMIN },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
