import {Application} from "@/repository/apps";

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

export const addEndpoint = async (id: string, data: any): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}/endpoints`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json()
}

export const editEndpoint = async (id: string, endpointId: string, data: any): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}/endpoints/${endpointId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json()
}

export const addDatabase = async (id: string, data: any): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}/databases`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json()
}

export const editDatabase = async (id: string, databaseId: string, data: any): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}/databases/${databaseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json()
}