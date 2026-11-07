import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
    userId: string;
    orderId: string;
    paymentId?: string;
    amount?: number;
    currency: string;
    credits?: number;
    plan?: string;
    status: "created" | "paid" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        paymentId: String,
        amount: Number,
        currency: {
            type: String,
            default: "INR",
        },
        credits: Number,
        plan: String,
        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
        },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> =
    mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;

