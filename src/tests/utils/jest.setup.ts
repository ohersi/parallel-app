// Packages
import "reflect-metadata";
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { memOrm } from "./init-db.setup";

let orm: MikroORM<IDatabaseDriver<Connection>>;

beforeAll(async () => {
    
});

afterAll(async () => {
    // close 
    orm = await memOrm;
    orm.close();
});