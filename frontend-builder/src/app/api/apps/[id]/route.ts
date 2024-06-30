import {getApplicationById, updateApplication} from "@/repository/apps";

export const GET = async function (req, { params }) {
    const id = params.id;
    const app = await getApplicationById(id);
    if (!app) {
        return new Response(JSON.stringify({message: 'Application not found'}), {
            status: 404,
            headers: {'Content-Type': 'application/json'}
        });
    }

    return Response.json({app})
}

export const PATCH = async function (req, { params }) {
    const id = params.id;
    const data = await req.json()
    const app = await updateApplication(id, data);
    return Response.json({app})
}