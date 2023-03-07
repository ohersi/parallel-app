import express, { Application, Request, Response } from 'express';
import config from './mikro-orm.config';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

export default class App {

    public express: Application;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;
        this.initalizeMiddleware();
    };


    private initalizeMiddleware() : void {
        this.express.use(express.json());
    };

    public async init() : Promise<void> {
        const orm = await MikroORM.init(config);
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
