import mongosee from "mongoose"


async function connectDB(){
    try {
        await mongosee.connect(process.env.MONGODB_URI as string)
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error)
    }
}

export {connectDB}
