import { Schema, model } from "mongoose";

const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC"] as const;
type FuelType = (typeof FUEL_TYPES)[number];

interface IVehicle {
    make: string;
    model: string;
    category: string;
    fuelType: FuelType;
    preLaunch: boolean;
    price: number;
    quantity: number;
    imageUrl?: string;
    images: string[];
}

const vehicleSchema = new Schema<IVehicle>(
    {
        make: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        fuelType: { type: String, enum: FUEL_TYPES, default: "PETROL" },
        preLaunch: { type: Boolean, default: false },
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
        imageUrl: { type: String, trim: true },
        // Extra gallery photos (interior, seats, details) beyond the
        // main imageUrl.
        images: { type: [String], default: [] },
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
vehicleSchema.index({ fuelType: 1 });
vehicleSchema.index({ preLaunch: 1 });
vehicleSchema.index({ price: 1 });

const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);

export { Vehicle, FUEL_TYPES };
export type { IVehicle, FuelType };
