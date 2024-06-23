import {createManagementClient} from "@/lib/auth0";

export const DELETE = async function (req, { params }) {
    const id = params.id;
    const management = createManagementClient();
    const rolesResponse = await management.users.getRoles({id});
    if (rolesResponse.status !== 200) {
        console.log('Cannot delete user not found')
        return new Response(JSON.stringify({message: 'User not found'}), {
            status: 404,
            headers: {'Content-Type': 'application/json'}
        });
    }

    if (rolesResponse.data.filter((role) => role.name === 'admin').length > 0) {
        console.log('Cannot delete an admin user')
        return new Response(JSON.stringify({message: 'Cannot delete an admin user'}), {
            status: 400,
            headers: {'Content-Type': 'application/json'}
        });
    }

    const deleteResponse = await management.users.delete({id});
    if (deleteResponse.status !== 204) {
        console.log('Failed to delete user')
        return new Response(JSON.stringify({message: 'Failed to delete user'}), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }

    return new Response(JSON.stringify({message: 'User deleted'}), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });
}
