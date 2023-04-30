import { Channel } from "../channel.entity";
import { User } from "../user.entity";

export default interface IFollow {
    user: User;
    followed_channel: Channel;
    date_created: Date;
}