import {addWorkflow} from "@/repository/apps";
import {Workflow} from "executable-workflows";
import {storeWorkflow} from "@/repository/workflows";

export const POST = async function (req, { params }) {
    const id = params.id;
    const data = await req.json()
    const workflow = await addWorkflow(id, data);
    const emptyWorkflow = Workflow.empty();
    await storeWorkflow(workflow._id!, emptyWorkflow);
    return Response.json({workflow })
}