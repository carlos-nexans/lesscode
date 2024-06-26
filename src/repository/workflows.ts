import {Workflow} from "executable-workflows";
import {put} from "@vercel/blob";

export const storeWorkflow = async (id: string, workflow: Workflow): Promise<void> => {
    await put(`/workflows/${id}`, JSON.stringify(workflow.dump()))
}
