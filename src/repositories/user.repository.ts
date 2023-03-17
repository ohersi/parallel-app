// Packages
import { Entity, Loaded } from '@mikro-orm/core';
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

    updateByID(entity: User, id: number): Promise<any> {
        throw new Error("Method not implemented.");
    }

    deleteByID(entity: User, id: number): Promise<any> {
        throw new Error("Method not implmented.");
    };

    async findByID(id: number): Promise<Loaded<User, never> | null> {
        // TODO: find return type of res
        try {
            const res = await this.findOne({ id } as any);
            return res;
        }
        catch (error) {
            throw new Error("ID Not found");
        }
    };

    getAll(): Promise<Loaded<User, never>[]> {
        try {
            const res = this.findAll();
            return res;
        }
        catch (error) {
            throw new Error("Method not implmented.");
        }
    };
}