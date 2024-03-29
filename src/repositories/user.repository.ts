// Packages
import { Entity, Loaded } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { User } from '@/entities/user.entity';
import IRepository from '@/repositories/interfaces/repository.interface';
import BaseRepository from '@/repositories/base.repository';

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
    
    async findBySlug(slug: string): Promise<Loaded<User, never> | null> {
        try {
            const res = await this.findOne({ slug: slug });
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

    async findAllFriends(id: number): Promise<Loaded<User, "friends">[]> {
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
            const res = await this.find({ id: { $gte: last_id } }, { limit: limit });
            return [res, count];
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async searchUsersMatchingName(name: string): Promise<Loaded<User, never>[]> {
        try {
            const res = await this.find(
                // Regex search
                { full_name: { $re: '(?i)^.*' + name + '.*$' } },
                // Full text search
                // { searchableTitle: { $fulltext: name } },
            );
            return res;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
}