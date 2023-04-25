import { User } from "../user.entity";

export default interface IFriend {
    following_user: User;
    followed_user: User;
    date_created: Date;
}