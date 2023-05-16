import { Channel } from "@/entities/channel.entity";
import { User } from "@/entities/user.entity";

export default interface IFollow {
    user: User;
    followed_channel: Channel;
    date_created: Date;
}