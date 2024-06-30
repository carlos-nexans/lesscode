import {Workflow} from "executable-workflows";
import {put, list, del} from "@vercel/blob";

const getWorkflowMetadata = async (id: string): Promise<any> => {
    const lookup = await list({
        prefix: `workflows/${id}.json`,
        limit: 1
    })

    if (lookup.blobs.length === 0) {
        return null;
    }

    return lookup.blobs[0]
}


export const storeWorkflowDefinitionStr = async (id: string, workflow: string): Promise<void> => {
    const metadata = await getWorkflowMetadata(id)
    if (metadata) {
        await del(metadata.url)
    }
    await put(`workflows/${id}.json`, workflow, { access: 'public', addRandomSuffix: false, cacheControlMaxAge: 0 })
}

export const storeWorkflowDefinition = async (id: string, workflow: Workflow): Promise<void> => {
    await storeWorkflowDefinitionStr(id, workflow.dump())
}

export const getWorkflowDefinition = async (id: string): Promise<any> => {
    const metadata = await getWorkflowMetadata(id)
    if (!metadata) {
        throw new Error(`Workflow ${id} not found`)
    }
    const url = metadata.url
    const workflow = await fetch(url, {
        cache: 'no-cache'
    });
    return workflow.json()
}

export const getWorkflowDefinitionString = async (id: string): Promise<any> => {
    const metadata = await getWorkflowMetadata(id)
    if (!metadata) {
        throw new Error(`Workflow ${id} not found`)
    }
    const url = metadata.url
    const workflow = await fetch(url, {
        cache: 'no-cache'
    });
    return workflow.text()
}