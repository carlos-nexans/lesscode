import {Application} from "@/app/repository/apps";

export const getApplication = async (id): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}`)
    return res.json()
}

export const addWorkflow = async (id: string, data: any): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}/workflows`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json()
}