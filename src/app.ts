import express, { Application, Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Users } from './models/user.entity';
import { PostgreSqlDriver } from '@mikro-orm/postgresql/PostgreSqlDriver';
import init from './mikro-orm';
import IController from './controllers/interfaces/controller.interface';
import ErrorMiddleware from './middleware/error.middleware';

export default class App {

    public express: Application;
    public port: number;
    // What type?
    public db;

    constructor(port: number, controllers: IController[]) {
        this.express = express();
        this.port = port;
        this.initalizeMiddleware();
        this.initalizeControllers(controllers);
        this.db = this.initalizeDatabase();
    };

    // Initalize Database //
    // What return type for MikroORM<PostgreSqlDriver> ?
    private async initalizeDatabase(): Promise<MikroORM<PostgreSqlDriver>> {
        const orm = await init();
        return orm;
    }

    // Initalize Error Handling
    private initalizeErrorHandling(): void {
        this.express.use(ErrorMiddleware);
    }

    // Initialize Repositories //


    // Initalize of Controllers //
    private initalizeControllers(controllers: IController[]): void {
        controllers.forEach((controller: IController) => {
            this.express.use('/api', controller.router);
        });
    };

    // Initalize Routes //


    // Initalize Middleware
    private initalizeMiddleware(): void {
        this.express.use(express.json());
    };

    //////////////////////////////////////////////////

    public listen(): void {
        this.express.listen(this.port, () => console.log(`app listening on port ${this.port}`));
    }

    public testExpress(): void {
        this.express.get("/", (req: Request, res: Response) => {
            res.send("Hello World");
        });
    }

    public async testMikroConnection(): Promise<void> {
        const database = await this.db;
        const fork = database.em.fork();
        //TODO: get collection of repo's
        // Create user repo 
        const repo = fork.getRepository(Users);
        const user = repo.findByID(3);

        this.express.get("/user", async (req: Request, res: Response) => {

            // const text = [];
            // for (const user of await user) {
            //    text.push(user);
            // }
            const text = await user;
            res.send(text);
        });
    }

};
