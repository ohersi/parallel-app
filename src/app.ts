// Runtime Decorator Metadata Insertion - Needs to be at top of file
import 'reflect-metadata';
// Packages
import express, { Application, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import { Redis } from 'ioredis';
import RedisStore from 'connect-redis';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Connection, IDatabaseDriver, MikroORM, RequestContext } from '@mikro-orm/core';
// Imports
import ErrorMiddleware from './middleware/error.middleware';
import initContainer from './utils/ioc/di-container';
import { TYPES } from './utils/types';

export const start = async (port: Number) => {

    //Initalize Redis client
    const redisClient = new Redis();
    // Initalize Redis store
    const redisStore = new RedisStore({
        client: redisClient
    })

    const container: Container = await initContainer();

    const server: InversifyExpressServer = new InversifyExpressServer(container);

    server.setConfig((app: Application) => {

        // Initalize JSON Parser
        app.use(express.json());

        // Initalize Compression
        app.use(compression());

        // Initalize Express Security - Helment
        app.use(helmet());

        // Initalize CORS
        //TODO: Set approved sites
        // app.use(cors());

        // Check for secret key & setup session
        if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY env variable is missing");
        app.use(session({
            store: redisStore,
            secret: process.env.SECRET_KEY,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : "auto",
                // sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax", 
                maxAge: 60 * 60 * 1000 // Expires in 1hr
            }
        }))

        // Create Different Instances For Each Request
        app.use((req, res, next: NextFunction): void => {
            const connection = container.get<MikroORM<IDatabaseDriver<Connection>>>
                (TYPES.DATABASE_CONNECTION);
            RequestContext.create(connection.em, next);

            // Initalize Error Handling
            app.use(ErrorMiddleware);
        });

        // Start server on part
        if (process.env.NODE_ENV !== 'test') {
            app.listen(port, () => console.log(`app listening on port ${port}`));
        }
    });

    // Initialize Application
    // server.build();

    return server;
}
