import { Options } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";


const config: Options = {
    type: 'postgresql',
    host: "localhost",
    dbName: "test",
    port: 5432,
    user: "postgres",
    password: "bioman30",
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    metadataProvider: TsMorphMetadataProvider,
};

export default config;