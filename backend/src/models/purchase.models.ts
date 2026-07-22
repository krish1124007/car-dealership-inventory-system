import { Schema, model, Types } from "mongoose";

/**
 * Immutable audit record of a completed purchase. purchasePrice snapshots
 * the vehicle price at purchase time so history stays accurate even if the
 * listing price changes later.
 */
interface IPurchase {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    quantity: number;
    purchasePrice: number;
    purchasedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
            index: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: [1, "quantity must be greater than zero"],
        },
        purchasePrice: { type: Number, required: true },
        purchasedAt: { type: Date, default: Date.now },
    },
    {
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

const Purchase = model<IPurchase>("Purchase", purchaseSchema);

export { Purchase };
export type { IPurchase };
