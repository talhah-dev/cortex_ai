import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFile {
    name: string;
    content: string;
}

export interface IArtifact {
    id: number;
    type: string;
    title: string;
    files: IFile[];
}

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    images?: string[];
    artifacts?: IArtifact[];
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
    {
        name: { type: String, required: true },
        content: { type: String, default: "" },
    },
    { _id: false }
);

const artifactSchema = new Schema<IArtifact>(
    {
        id: { type: Number, required: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        files: [fileSchema],
    },
    { _id: false }
);

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        images: {
            type: [String],
            default: [],
        },
        artifacts: {
            type: [artifactSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;

