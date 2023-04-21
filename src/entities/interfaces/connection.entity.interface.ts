import { Block } from "../block.entity";
import { Channel } from "../channel.entity";

export default interface IConnection {
    block: Block;
    connected_channel: Channel;
    date_created: Date;
}