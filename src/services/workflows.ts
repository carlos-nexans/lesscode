export const getWorkflowDefinition = async (id: string): Promise<any> => {
    const res = await fetch(`/api/workflows/${id}`)
    return res.json()
}