import { Schema, model } from "mongoose";

/** A message sent from the public contact form. */
interface IContactMessage {
    name: string;
    email: string;
    subject?: string;
    message: string;
}

const contactMessageSchema = new Schema<IContactMessage>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        subject: { type: String, trim: true },
        message: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform(_doc, ret: Record<string, unknown>) {
                ret["id"] = String(ret["_id"]);
                delete ret["_id"];
                return ret;
            },
        },
    }
);

// The admin inbox reads newest first.
contactMessageSchema.index({ createdAt: -1 });

const ContactMessage = model<IContactMessage>(
    "ContactMessage",
    contactMessageSchema
);

export { ContactMessage };
export type { IContactMessage };
