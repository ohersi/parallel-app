// Packages
import { MikroORM } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { newDb } from 'pg-mem';

export const setupConnection = async () => {

    // Create an instance of pg-mem
    const memDb = newDb();

    // Bind an instance of mikro-orm to our pg-mem instance
    const memOrm: MikroORM = await memDb.adapters.createMikroOrm({
        type: 'postgresql',
        entities: ['dist/**/*.entity.js'],
        entitiesTs: ['src/**/*.entity.ts'],
        debug: true,
        metadataProvider: TsMorphMetadataProvider,
    })
    
    // Create schema
    await memOrm.getSchemaGenerator().createSchema();

    // Return in-memory pg-orm
    return memOrm;
};