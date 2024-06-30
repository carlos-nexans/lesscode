import {Workflow} from "executable-workflows";
import {addEndpoint} from "@/repository/apps";
export const POST = async function (req, { params }) {
    const id = params.id;
    const data = await req.json()
    const endpoint = await addEndpoint(id, data);
    return Response.json({endpoint})
}