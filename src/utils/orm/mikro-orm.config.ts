import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import '../env';


const config: Options<PostgreSqlDriver> = {
    type: 'postgresql',
    host: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    port: parseInt(process.env.PG_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    debug: true,
    metadataProvider: TsMorphMetadataProvider,
};

export default config;