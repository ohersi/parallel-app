// Packages
import { Entity, Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { injectable } from 'inversify'
// Imports
import { User } from '../entities/user.entity';
import IRepository from './interfaces/repository.interface';

@injectable()
@Entity({ customRepository: () => User })
export default class UserRepository extends EntityRepository<User> implements IRepository<User>  {

    // TODO: Custom methods 

    async save(entity: User): Promise<User> {
        try {
            const res = this.create(entity);
            await this.persistAndFlush(res);
            return res;
        }
        catch (error) {
            throw new Error("Method not implemented.");
        }
    };

    async update(entity: User, data: any): Promise<any> {
        try {
            const res = this.assign(entity, data, { updateByPrimaryKey: false });
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateEnabled(entity: User): Promise<any> {
        try {
            const res = this.assign(entity, { enabled: true }, { updateByPrimaryKey: false });
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async deleteByID(entity: User, id: number): Promise<any> {
        throw new Error("Method not implmented.");
    };

    async findByID(id: number): Promise<Loaded<User, never> | null> {
        try {
            const res = await this.findOne(id);
            return res;
        }
        catch (error) {
            throw new Error("ID Not found");
        }
    };

    async findByEmail(email: string): Promise<Loaded<User, never> | null> {
        try {
            const res = await this.findOne({ email } as any);
            return res;
        }
        catch (error) {
            throw new Error("ID Not found");
        }
    };

    async getAll(): Promise<Loaded<User, never>[]> {
        try {
            const res = this.findAll({ orderBy: { id: QueryOrder.ASC } });
            return res;
        }
        catch (error) {
            throw new Error("Method not implmented.");
        }
    };
}