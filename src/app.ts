import express, { Application, Request, Response } from 'express';
import config from './mikro-orm.config';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Users } from './models/user.entity';
import { PostgreSqlDriver } from '@mikro-orm/postgresql/PostgreSqlDriver';

export default class App {

    public express: Application;
    public port: number;
    public orm!: MikroORM<IDatabaseDriver<Connection>>

    constructor(port: number) {
        this.express = express();
        this.port = port;
        this.initalizeMiddleware();
        this.init();
    };


    private initalizeMiddleware() : void {
        this.express.use(express.json());
    };

    public async init() : Promise<void> {
        const orm = await MikroORM.init<PostgreSqlDriver>(config);
        const fork = orm.em.fork();
        const users =  fork.find(Users, 1);

        this.express.get("/user", async (req: Request, res: Response) => {

            const text = [];
            for (const user of await users) {
               text.push(user);
            }
            res.send(text);
        });

    }



    public listen() : void {
        this.express.listen(this.port, () => console.log(`app listening on port ${this.port}`));
    }

    public default(): void {
        this.express.get("/", (req: Request, res: Response) => {
            res.send("Hello World");
        });
    }
    

};
