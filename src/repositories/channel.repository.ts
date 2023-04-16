// Packages
import { Entity, Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { injectable } from 'inversify'
// Imports
import { Channel } from '../entities/channel.entity';
import IRepository from './interfaces/repository.interface';

@injectable()
@Entity({ customRepository: () => Channel })
export default class ChannelRepository extends EntityRepository<Channel> implements IRepository<Channel>  {

    // TODO: Custom methods 

    async save(entity: Channel): Promise<Channel> {
        try {
            const res = this.create(entity);
            await this.persistAndFlush(res);
            return res;
        }
        catch (error) {
            throw new Error("Method not implemented.");
        }
    };

    async update(entity: Channel, data: any): Promise<any> {
        try {
            const res = this.assign(entity, data, { updateByPrimaryKey: false });
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async deleteByID(entity: Channel, id: number): Promise<any> {
        throw new Error("Method not implmented.");
    };

    async findByID(id: number): Promise<Loaded<Channel, never> | null> {
        try {
            const res = await this.findOne(id);
            return res;
        }
        catch (error) {
            throw new Error("ID Not found");
        }
    };

    async getAll(): Promise<Loaded<Channel, never>[]> {
        try {
            const res = this.findAll({ orderBy: { id: QueryOrder.ASC } });
            return res;
        }
        catch (error) {
            throw new Error("Method not implmented.");
        }
    };
}