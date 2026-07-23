/**
 * Seeds the development database with example vehicles.
 *
 * Run with: npm run seed
 *
 * Idempotent: vehicles are upserted by make + model, so re-running updates
 * the samples instead of duplicating them. Users and purchases are never
 * touched.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/vehicle.models.js";

const img = (id: string) => `https://images.unsplash.com/${id}?w=600&q=70`;

const sampleVehicles = [
    {
        make: "Porsche",
        model: "911 Carrera",
        category: "Coupe",
        price: 18500000,
        quantity: 2,
        imageUrl: img("photo-1503376780353-7e6692767b70"),
    },
    {
        make: "BMW",
        model: "M4 Competition",
        category: "Coupe",
        price: 14800000,
        quantity: 3,
        imageUrl: img("photo-1617531653332-bd46c24f2068"),
    },
    {
        make: "Audi",
        model: "A6",
        category: "Sedan",
        price: 6500000,
        quantity: 5,
        imageUrl: img("photo-1502877338535-766e1452684a"),
    },
    {
        make: "Mercedes-Benz",
        model: "C-Class",
        category: "Sedan",
        price: 6000000,
        quantity: 4,
        imageUrl: img("photo-1549317661-bd32c8ce0db2"),
    },
    {
        make: "Jeep",
        model: "Wrangler",
        category: "SUV",
        price: 6700000,
        quantity: 6,
        imageUrl: img("photo-1568605117036-5fe5e7bab0b7"),
    },
    {
        make: "Ford",
        model: "Mustang GT",
        category: "Coupe",
        price: 7500000,
        quantity: 0,
        imageUrl: img("photo-1494976388531-d1058494cdd8"),
    },
    {
        make: "Tesla",
        model: "Model 3",
        category: "EV",
        price: 4000000,
        quantity: 8,
        imageUrl: img("photo-1533473359331-0135ef1b58bf"),
    },
    {
        make: "Toyota",
        model: "Fortuner",
        category: "SUV",
        price: 4200000,
        quantity: 5,
        imageUrl: img("photo-1541899481282-d53bffe3c35d"),
    },
    {
        make: "Honda",
        model: "City",
        category: "Sedan",
        price: 1200000,
        quantity: 7,
        imageUrl: img("photo-1605559424843-9e4c228bf1c2"),
    },
    {
        make: "Volkswagen",
        model: "Golf GTI",
        category: "Hatchback",
        price: 3500000,
        quantity: 3,
        imageUrl: img("photo-1552519507-da3b142c6e3d"),
    },
];

async function seed(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set — check backend/.env");
    }
    await mongoose.connect(uri);
    console.log(`Connected to ${uri}`);

    for (const vehicle of sampleVehicles) {
        const result = await Vehicle.updateOne(
            { make: vehicle.make, model: vehicle.model },
            { $set: vehicle },
            { upsert: true }
        );
        const action = result.upsertedCount > 0 ? "created" : "updated";
        console.log(`  ${action}: ${vehicle.make} ${vehicle.model}`);
    }

    const total = await Vehicle.countDocuments();
    console.log(`Done - ${total} vehicles in the database.`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
