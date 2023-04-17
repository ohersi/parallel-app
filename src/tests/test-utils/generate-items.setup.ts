// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { memOrm } from "./init-db.setup";
// Imports
import { User } from "../../entities/user.entity";
import { Channel } from "../../entities/channel.entity";
import UserRepository from "../../repositories/user.repository";
import ChannelRepository from "../../repositories/channel.repository";
import { TYPES_ENUM } from "../../utils/types/enum";


export const generateItems = async (): Promise<MikroORM<IDatabaseDriver<Connection>>> => {

    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;
    let channels: ChannelRepository;

    // Setup database and repos
    orm = await memOrm;
    users = orm.em.getRepository<User>(User);

    for (let i = 1; i <= 3; i++) {
        let user = new User(
            `FirstName${i}`,
            `LastName${i}`,
            `${i}email@email.com`,
            "password",
            "avatar",
            TYPES_ENUM.USER
        );

        let channel = new Channel(
            1,
            `channel title ${i}`,
            `channel description ${i}`,
            new Date(),
            new Date(),
        );

        orm.em.persist(user);
        orm.em.persist(channel);
    }

    await orm.em.flush();


    return orm;
}

