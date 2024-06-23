import {createManagementClient} from "@/lib/auth0";

export const GET = async function (req) {
    const management = createManagementClient();
    const allUsers = [];
    let page = 0;
    while (true) {
        const {
            data: {users, total},
        } = await management.users.getAll({
            include_totals: true,
            page: page++,
        });
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const {data: roles} = await management.users.getRoles({id: user.user_id})
            return {...user, roles}
        }))
        allUsers.push(...usersWithRoles);
        if (allUsers.length === total) {
            break;
        }
    }

    return Response.json({users: allUsers})
};

export const POST = async function (req, res) {
    const body = await req.json()
    const management = createManagementClient();
    const userResponse = await management.users.create({
        email: body.email,
        password: body.password,
        connection: 'Username-Password-Authentication',
        name: body.name,
    });

    if (userResponse.status > 399) {
        return Response.json({message: 'Error creando usuario'}, {status: 500})
    }

    const userId = userResponse.data.user_id;

    const rolesResponse = await management.roles.assignUsers(
        {id: body.role},
        {users: [userId]}
    );

    if (rolesResponse.status > 399) {
        return Response.json({message: 'Error asignando rol'}, {status: 500})
    }

    return Response.json({message: 'Usuario creado'})
}