// Runtime Decorator Metadata Insertion
import 'reflect-metadata';
// Packages
import express, { Application, NextFunction } from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Connection, EntityManager, IDatabaseDriver, MikroORM, RequestContext } from '@mikro-orm/core';
// Imports
import ErrorMiddleware from './middleware/error.middleware';
import initContainer from './di-container';
import { TYPES } from './types';

export const DI = {} as {
    orm: MikroORM;
    db: EntityManager<IDatabaseDriver<Connection>>;
}

export class App {

    public port: number;
    public container: Promise<Container>;

    constructor(port: number) {
        this.port = port;
        this.container = initContainer();
        this.start();
    };

    private start() {

        this.container.then((container: Container) => {

            const server = new InversifyExpressServer(container);

            server.setConfig((app: Application) => {
                // Initalize Error Handling
                app.use(ErrorMiddleware);

                // Initalize JSON Parser
                app.use(express.json());

                // Create Different Instances For Each Request
                app.use((_req, _res, next: NextFunction): void => {
                    const connection = container.get<MikroORM<IDatabaseDriver<Connection>>>
                        (TYPES.DATABASE_CONNECTION);
                    RequestContext.create(connection.em, next);
                });

                // Start server on part
                app.listen(this.port, () => console.log(`app listening on port ${this.port}`));
            });

            // Initialize Application
            server.build();
        });
    }

};
