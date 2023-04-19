// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { setupConnection } from "./pg-mem.setup";
import { IMemoryDb } from "pg-mem";

export const memOrm: Promise<{
    memOrm: MikroORM<IDatabaseDriver<Connection>>;
    memDb: IMemoryDb;
}> = setupConnection();

