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
        catch (error: any) {
            throw new Error(error);
        }
    };

    async update(entity: Channel, data: any): Promise<any> {
        try {
            const res = this.assign(entity, data, { updateByPrimaryKey: false });
            await this.persistAndFlush(res);
            return res;
        }
        catch (error: any) {
            throw new Error(error);
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
        catch (error: any) {
            throw new Error(error);
        }
    };

    async findByUserIDAndTitle(id: number, name: string): Promise<Loaded<Channel, never> | null> {
        try {
            const res = await this.findOne({ user: id, title: name });
            return res;
        } 
        catch (error: any) {
            throw new Error(error);
        }
    };
    
    // Get all channels tied to user (order by most recently updated)
    async getAllByUserID(id: number): Promise<Loaded<Channel, never>[]> {
        try {
            const res = await this.find({ user: id }, { orderBy: { date_updated: QueryOrder.DESC } })
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async getAll(): Promise<Loaded<Channel, never>[]> {
        try {
            const res = this.findAll({ orderBy: { id: QueryOrder.ASC } });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };
}