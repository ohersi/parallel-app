import express, { Application, Request, Response } from 'express';
import { AbstractSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';
import init from './mikro-orm';
import IController from './controllers/interfaces/controller.interface';
import ErrorMiddleware from './middleware/error.middleware';
import { MikroORM } from '@mikro-orm/core';

export const DI = {} as {
    orm: MikroORM;
    db: SqlEntityManager<AbstractSqlDriver>;
}

export class App {

    public express: Application;
    public port: number;
    // What type?
    public database: Promise<SqlEntityManager<AbstractSqlDriver>>;

    constructor(port: number, controllers: IController[]) {
        this.express = express();
        this.port = port;
        this.initalizeMiddleware();
        this.initalizeControllers(controllers);
        this.initalizeErrorHandling();
        this.database = this.initalizeDatabase();
    };

    // Initalize Database //
    private async initalizeDatabase(): Promise<SqlEntityManager<AbstractSqlDriver>> {
        const mikrOrm = await init();
        DI.orm = mikrOrm;
        // May cause issues, fallback return just DI.orm (type: Promise<MikroORM<PostgreSqlDriver>>);
        const fork = mikrOrm.em.fork();
        DI.db = fork;
        return fork;
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

};
