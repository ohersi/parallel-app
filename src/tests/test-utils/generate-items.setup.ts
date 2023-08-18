// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { User } from "../../entities/user.entity";
import { Channel } from "../../entities/channel.entity";
import { Block } from "../../entities/block.entity";
import { Friend } from "../../entities/friend.entity";
import UserRepository from "../../repositories/user.repository";
import ChannelRepository from "../../repositories/channel.repository";
import BlockRepository from "../../repositories/block.repository";
import FriendRepository from "../../repositories/friend.repository";
import { TYPES_ENUM } from "../../utils/types/enum";

export const generateItems = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
    let users: UserRepository;
    let channels: ChannelRepository;
    let blocks: BlockRepository;
    let friends: FriendRepository;

    users = orm.em.getRepository<User>(User);
    channels = orm.em.getRepository<Channel>(Channel);
    blocks = orm.em.getRepository<Block>(Block);
    friends = orm.em.getRepository<Friend>(Friend);

    for (let i = 1; i <= 3; i++) {
        let user = new User(
            `first-name-${i}`,
            `FirstName${i}`,
            `LastName${i}`,
            `FirstName${i} LastName${i}`,
            `${i}email@email.com`,
            "password",
            "avatar",
            0,
            0,
            TYPES_ENUM.USER
        );

        let channel = new Channel(
            1,
            `channel title ${i}`,
            `channel description ${i}`,
            `channel-title-${i}`,
            0,
            new Date(),
            new Date(),
        );

        let block = new Block(
            1,
            `block title ${i}`,
            `block description ${i}`,
            "source_url",
            "image_url",
            new Date(),
            new Date()
        )

        orm.em.persist(user);
        orm.em.persist(channel);
        orm.em.persist(block);
        // Add to collection
        block.channels.add(channel);
    }

    await orm.em.flush();
}

