export const getWorkflowDefinition = async (id: string): Promise<any> => {
    const res = await fetch(`/api/workflows/${id}`)
    return res.json()
}

export const saveWorkflowDefinition = async (id: string, data: any): Promise<any> => {
    const res = await fetch(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res.json()
}