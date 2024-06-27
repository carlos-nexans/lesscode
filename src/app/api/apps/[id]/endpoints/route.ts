import {addEndpoint, addWorkflow, editEndpoint} from "@/repository/apps";
import {Workflow} from "executable-workflows";
import {storeWorkflowDefinition} from "@/repository/workflows";

export const POST = async function (req, { params }) {
    const id = params.id;
    const data = await req.json()
    const endpoint = await addEndpoint(id, data);
    return Response.json({endpoint})
}