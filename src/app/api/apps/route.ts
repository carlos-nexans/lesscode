import {NextAppRouterHandler} from "@auth0/nextjs-auth0";
import connectToDatabase from "@/lib/mongodb";

export const GET: NextAppRouterHandler = async (req, {params}) => {
    const { db } = await connectToDatabase()
    const apps = await db.collection('Application').find().toArray();
    return Response.json({apps});
}