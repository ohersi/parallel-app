// Packages
import { Entity, Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Channel } from '../entities/channel.entity';
import IRepository from './interfaces/repository.interface';
import BaseRepository from './base.repository';

@injectable()
@Entity({ customRepository: () => Channel })
export default class ChannelRepository extends BaseRepository<Channel> implements IRepository<Channel>  {

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
}