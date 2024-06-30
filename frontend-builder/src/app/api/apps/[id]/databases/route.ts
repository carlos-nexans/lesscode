import {addDatabase} from "@/repository/apps";

export const POST = async function (req, {params}) {
    const id = params.id;
    const data = await req.json()
    const database = await addDatabase(id, data);
    return Response.json({database})
}