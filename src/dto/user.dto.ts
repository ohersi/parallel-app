export default class UserDTO {

    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    avatar_url?: string;
    role?: string;
    token?: string;

    constructor(
        id?: number,
        first_name?: string,
        last_name?: string,
        email?: string,
        password?:string,
        avatar_url?: string,
        role?: string,
        token?: string,
    ) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.avatar_url = avatar_url;
        this.role = role;
        this.token = token;
    }
}