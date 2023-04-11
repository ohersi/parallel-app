export default class UserDTO {

    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    profileimg?: string;
    role?: string;
    token?: string;

    constructor(
        id?: number,
        first_name?: string,
        last_name?: string,
        email?: string,
        password?:string,
        profileimg?: string,
        role?: string,
        token?: string,
    ) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.profileimg = profileimg;
        this.role = role;
        this.token = token;
    }
}