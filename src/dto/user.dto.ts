export default class UserDTO {

    id?: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    profileimg?: string;

    constructor(
        id?: number,
        firstname?: string,
        lastname?: string,
        email?: string,
        password?:string,
        profileimg?: string
    ) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.profileimg = profileimg;
    }
}