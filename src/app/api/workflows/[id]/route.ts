import {getWorkflowDefinition, storeWorkflowDefinition, storeWorkflowDefinitionStr} from "@/repository/workflows";

export const GET = async function (req, { params }) {
    const id = params.id;
    const workflow = await getWorkflowDefinition(id);
    return Response.json({workflow})
}

export const PUT = async function (req, { params }) {
    const id = params.id;
    const data = req.body;
    await storeWorkflowDefinitionStr(id, data);
    const workflow = await getWorkflowDefinition(id);
    return Response.json({workflow})
}