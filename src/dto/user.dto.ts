export default class UserDTO {

    id?: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    profileimg?: string;
    role?: string;

    constructor(
        id?: number,
        firstname?: string,
        lastname?: string,
        email?: string,
        password?:string,
        profileimg?: string,
        role?: string,
    ) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.profileimg = profileimg;
        this.role = role;
    }
}