export default interface IUser {
    id: number;
    slug: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    password: string;
    avatar: string;
    following_count: number;
    follower_count: number;
    role: string;
}