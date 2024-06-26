import {Application} from "@/app/repository/apps";

export const getApplication = async (id): Promise<{app: Application}> => {
    const res = await fetch(`/api/apps/${id}`)
    return res.json()
}