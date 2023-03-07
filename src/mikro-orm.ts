import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config";


export default async function init() : Promise<MikroORM<PostgreSqlDriver>> {
    const orm = await MikroORM.init<PostgreSqlDriver>(config);
    return orm;
}