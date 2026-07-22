import { Schema, model } from "mongoose";

interface IVehicle {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
}

const vehicleSchema = new Schema<IVehicle>(
    {
        make: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        price: {
            type: Number,
            required: true,
            min: [0.01, "price must be greater than zero"],
        },
        quantity: {
            type: Number,
            default: 0,
            min: [0, "quantity cannot be negative"],
        },
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

// The search endpoint filters by make, model, category, and price range.
vehicleSchema.index({ make: 1 });
vehicleSchema.index({ model: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ price: 1 });

const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);

export { Vehicle };
export type { IVehicle };
