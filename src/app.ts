// Runtime Decorator Metadata Insertion - Needs to be at top of file
import 'reflect-metadata';
// Register path aliases - Needs to be at top of file
import 'module-alias/register';
// Packages
import { Connection, IDatabaseDriver, MikroORM, RequestContext } from '@mikro-orm/core';
import express, { Application, NextFunction } from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import { Redis } from 'ioredis';
import RedisStore from 'connect-redis';
import session from 'express-session';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
// Imports
import ErrorMiddleware from '@/middleware/error.middleware';
import initContainer from '@/utils/ioc/di-container';
import { TYPES } from '@/utils/types';

export const redisContainer = {} as {
    redis: Redis
}

export const start = async (port: Number) => {

    //Initalize Redis client
    const redisClient = process.env.REDIS_DB ? new Redis(process.env.REDIS_DB) : new Redis();
    // Export redis for entire application
    redisContainer.redis = redisClient;
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
        const allowedOrigins = process.env.WHITELIST_ORIGINS;

        const options: cors.CorsOptions = {
            origin: allowedOrigins,
            optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
            credentials: true
        };
        app.use(cors(options));

        app.set('trust proxy', 1); // Nginx reverse proxy

        // Check for secret key & setup session
        if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY env variable is missing");
        app.use(session({
            store: redisStore,
            secret: process.env.SECRET_KEY,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: true, // true = set only https
                sameSite: 'none',
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

    return server;
}
