import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    firebaseUid: string;
    name?: string;
    email?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        avatar: {
            type: String,
        },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

