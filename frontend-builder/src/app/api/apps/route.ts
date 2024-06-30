import {NextAppRouterHandler} from "@auth0/nextjs-auth0";
import {createApplication, getApplications} from "@/repository/apps";

export const GET: NextAppRouterHandler = async (req, {params}) => {
    const apps = await getApplications();
    return Response.json({apps});
}

export const POST: NextAppRouterHandler = async (req, {params}) => {
    const body = await req.json();
    const app = await createApplication(body);
    return Response.json({app});
}