// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { setupConnection } from "./pg-mem.setup";

export const memOrm: Promise<MikroORM<IDatabaseDriver<Connection>>> = setupConnection();

