import {addWorkflow} from "@/app/repository/apps";

export const POST = async function (req, { params }) {
    const id = params.id;
    const body = await req.json()
    const result = await addWorkflow(id, body);
    return Response.json({app: result})
}