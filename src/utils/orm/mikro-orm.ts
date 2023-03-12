// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import config from "./mikro-orm.config";

export class DatabaseClient {
    public init = async (): Promise<MikroORM<IDatabaseDriver<Connection>>> => {
        return MikroORM.init(config);
    }
}
