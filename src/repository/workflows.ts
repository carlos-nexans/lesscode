import {Workflow} from "executable-workflows";
import {put, list} from "@vercel/blob";

export const storeWorkflowDefinition = async (id: string, workflow: Workflow): Promise<void> => {
    await put(`workflows/${id}.json`, workflow.dump(), { access: 'public' })
}

export const getWorkflowDefinition = async (id: string): Promise<any> => {
    const lookup = await list({
        prefix: `workflows/${id}`,
        limit: 1
    })

    if (lookup.blobs.length === 0) {
        throw new Error(`Workflow ${id} not found`)
    }

    const url = lookup.blobs[0].url
    const workflow = await fetch(url)
    return workflow.json()
}