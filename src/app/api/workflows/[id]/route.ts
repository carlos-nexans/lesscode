import {getWorkflowDefinition} from "@/repository/workflows";

export const GET = async function (req, { params }) {
    const id = params.id;
    const workflow = await getWorkflowDefinition(id);
    return Response.json({workflow})
}