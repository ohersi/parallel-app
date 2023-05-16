import { Block } from "@/entities/block.entity";
import { Channel } from "@/entities/channel.entity";

export default interface IConnection {
    block: Block;
    connected_channel: Channel;
    date_created: Date;
}