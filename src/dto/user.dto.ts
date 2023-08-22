export default class UserDTO {

    id?: number;
    slug?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    password?: string;
    avatar?: string;
    following_count?: number;
    follower_count?: number;
    role?: string;
    enabled?: boolean;
    locked?: boolean;
    token?: string;

    constructor(
        id?: number,
        slug?: string,
        first_name?: string,
        last_name?: string,
        full_name?: string,
        email?: string,
        password?:string,
        avatar?: string,
        following_count?: number,
        follower_count?: number,
        role?: string,
        enabled?: boolean,
        locked?: boolean,
        token?: string,
    ) {
        this.id = id;
        this.slug = slug;
        this.first_name = first_name;
        this.last_name = last_name;
        this.full_name = full_name;
        this.email = email;
        this.password = password;
        this.avatar = avatar;
        this.following_count = following_count;
        this.follower_count = follower_count;
        this.role = role;
        this.enabled = enabled;
        this.locked = locked;
        this.token = token;
    }
}