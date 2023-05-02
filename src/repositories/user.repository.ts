// Packages
import { Entity, Loaded, QueryOrder } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { User } from '../entities/user.entity';
import IRepository from './interfaces/repository.interface';
import BaseRepository from './base.repository';

@injectable()
@Entity({ customRepository: () => User })
export default class UserRepository extends BaseRepository<User> implements IRepository<User>  {

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

    async findByEmail(email: string): Promise<Loaded<User, never> | null> {
        try {
            const res = await this.findOne({ email } as any);
            return res;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    };

    async findAllFriends(id: number) {
        try {
            const res = await this.find({ id: id }, { populate: ['friends'] });
            return res;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async findAllByLastID(last_id: number, limit: number): Promise<[Loaded<User, never>[], number]> {
        try {
            const count = await this.count({});
            const res = await this.find({id: { $gte: last_id }}, { limit: limit });
            return [res, count];
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
}