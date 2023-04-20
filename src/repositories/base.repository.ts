// Packages
import { Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { injectable } from 'inversify'
// Imports
import IRepository from './interfaces/repository.interface';
import BaseEntity from 'src/entities/base.entity';

@injectable()
export default class BaseRepository<T extends BaseEntity> extends EntityRepository<T> implements IRepository<T>  {

    async save(entity: T): Promise<T> {
        try {
            const res = this.create(entity);
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async update(entity: T, data: any): Promise<T> {
        try {
            const res = this.assign(entity, data, { updateByPrimaryKey: false });
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async delete(entity: T): Promise<any> {
        try {
            await this.removeAndFlush(entity);
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async findByID(id: number): Promise<Loaded<T, never> | null> {
        try {
            const res = await this.findOne({ id: id } as any);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async getAll(): Promise<Loaded<T, never>[]> {
        try {
            const res = this.findAll({ orderBy: { id: QueryOrder.ASC } as any});
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };
}