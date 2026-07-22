import { Schema, model } from "mongoose";

/** Authorization roles. Admins manage inventory; customers browse and purchase. */
const Role = {
    CUSTOMER: "CUSTOMER",
    ADMIN: "ADMIN",
} as const;

type Role = (typeof Role)[keyof typeof Role];

interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.CUSTOMER,
        },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            // API responses expose `id` and must never leak the password hash.
            transform(_doc, ret: Record<string, unknown>) {
                ret["id"] = String(ret["_id"]);
                delete ret["_id"];
                delete ret["passwordHash"];
                return ret;
            },
        },
    }
);

const User = model<IUser>("User", userSchema);

export { User, Role };
export type { IUser };
