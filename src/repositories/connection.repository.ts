// Packages
import { Entity, Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Connection } from '../entities/connection.entity';
import IRepository from './interfaces/repository.interface';
import { EntityRepository } from '@mikro-orm/postgresql';

@injectable()
@Entity({ customRepository: () => Connection })
export default class ConnectionRepository extends EntityRepository<Connection> implements IRepository<Connection>  {

    async save(entity: Connection): Promise<Connection> {
        try {
            const res = this.create(entity);
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async update(entity: Connection, data: any): Promise<Connection> {
        try {
            const res = this.assign(entity, data, { updateByPrimaryKey: false });
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async delete(entity: Connection): Promise<any> {
        try {
            await this.removeAndFlush(entity);
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async findByID(id: number): Promise<Loaded<Connection, never> | null> {
        try {
            const res = await this.findOne({ id: id } as any);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async getAll(): Promise<Loaded<Connection, never>[]> {
        try {
            const res = this.findAll({ orderBy: { id: QueryOrder.ASC } as any});
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };
}