// declare metadata by @controller annotation
import * as controllers from '@/utils/ioc/imports/controllers-imports';
// Packages
import { AsyncContainerModule, interfaces } from 'inversify';
import { DatabaseClient } from "../orm/mikro-orm";
import { Connection, GetRepository, IDatabaseDriver, MikroORM, EntityRepository } from '@mikro-orm/core';
// Imports
import { TYPES } from '@/utils/types'
import { User } from '@/entities/user.entity';
import { Channel } from '@/entities/channel.entity';
import { Block } from '@/entities/block.entity';
import { Connection as Connections } from '@/entities/connection.entity';
import { Friend } from '@/entities/friend.entity';
import { Follow } from '@/entities/follow.entity';

// Classes w/ @controller need to be imported one unique time then it can be declared
// Bulk import only  works if the module w/ all the imports is invoked
// So controllers is assigned to controllerModule and the thing works... idk 
// More info: https://github.com/inversify/inversify-express-utils#important-information-about-the-controller-decorator //
let controllerModules = controllers;

// Initalize Database & bindings

const bindEntityToRepository = <T extends { [k: string]: any;[k: number]: any;[k: symbol]: any; }, U>(
    bind: interfaces.Bind,
    binding: symbol,
    connection: MikroORM<IDatabaseDriver<Connection>>,
    entity: { new(...args: string[] & U): T; }
): void => {
    bind<GetRepository<T, EntityRepository<T>>>(binding)
        .toDynamicValue((): GetRepository<T, EntityRepository<T>> => {
            return connection.em.getRepository<T>(entity);
        })
        .inRequestScope();
};

export const bindings = new AsyncContainerModule(async (bind): Promise<void> => {
    // Initialize Database Client Connection
    const databaseClient: DatabaseClient = new DatabaseClient();
    const connection = await databaseClient.init();
    if (connection) {

        // Connection Bindings
        bind<MikroORM<IDatabaseDriver<Connection>>>(TYPES.DATABASE_CONNECTION)
            .toConstantValue(connection);

        // Repository Bindings
        bindEntityToRepository(bind, TYPES.USER_REPOSITORY, connection, User);
        bindEntityToRepository(bind, TYPES.CHANNEL_REPOSITORY, connection, Channel);
        bindEntityToRepository(bind, TYPES.BLOCK_REPOSITORY, connection, Block);
        bindEntityToRepository(bind, TYPES.CONNECTION_REPOSITORY, connection, Connections);
        bindEntityToRepository(bind, TYPES.FRIEND_REPOSITORY, connection, Friend);
        bindEntityToRepository(bind, TYPES.FOLLOW_REPOSITORY, connection, Follow);
    }

});