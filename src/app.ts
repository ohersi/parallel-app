import express from 'express';
import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { AbstractSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql';
import init from './mikro-orm';
import IController from './controllers/interfaces/controller.interface';
import ErrorMiddleware from './middleware/error.middleware';
import { MikroORM } from '@mikro-orm/core';
import { container } from './di-container';

export const DI = {} as {
    orm: MikroORM;
    db: SqlEntityManager<AbstractSqlDriver>;
}

export class App {

    public server: InversifyExpressServer;
    public port: number;
    // What type?
    public database: Promise<SqlEntityManager<AbstractSqlDriver>>;

    constructor(port: number) {
        this.server = new InversifyExpressServer(container);
        this.port = port;
        this.setup();
        this.initalizeMiddleware();
        // this.initalizeControllers(controllers);
        this.initalizeErrorHandling();
        this.database = this.initalizeDatabase();

    };

    // Initalize Inversify Container //
    private setup() {
        this.server.build();
    }

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
        this.server.setConfig((app) => {
            app.use(ErrorMiddleware);
        });
    }

    // Initialize Repositories //


    // Initalize of Controllers //
    private initalizeControllers(controllers: IController[]): void {
        controllers.forEach((controller: IController) => {
            this.server.setConfig((app) => {
                app.use('/api', controller.router);
            });
        });
    };

    // Initalize Routes //


    // Initalize Middleware
    private initalizeMiddleware(): void {
        this.server.setConfig((app) => {
            app.use(express.json());
        });
    };

    //////////////////////////////////////////////////

    public listen(): void {
        this.server.setConfig((app) => {
            app.listen(this.port, () => console.log(`app listening on port ${this.port}`));
        });
    }

};
