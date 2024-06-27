import {editDatabase} from "@/repository/apps";

export const PUT = async function (req, {params}) {
    const id = params.id;
    const endpointId = params.endpointId;
    const data = await req.json();
    const result = await editDatabase(id, endpointId, data);
    return Response.json({endpoint: result})
}