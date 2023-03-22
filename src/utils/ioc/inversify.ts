// declare metadata by @controller annotation
import '../../controllers/user.controller'
import '../../controllers/createUser.controller'
// Packages
import { AsyncContainerModule, interfaces } from 'inversify';
import { DatabaseClient } from "../orm/mikro-orm";
import { Connection, GetRepository, IDatabaseDriver, MikroORM, EntityRepository } from '@mikro-orm/core';
// Imports
import { TYPES } from '../types'
import { User } from '../../entities/user.entity';


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
    }

});