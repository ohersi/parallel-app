// Packages
import { Entity, Loaded, QueryOrder } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Channel } from '../entities/channel.entity';
import IRepository from './interfaces/repository.interface';
import BaseRepository from './base.repository';

@injectable()
@Entity({ customRepository: () => Channel })
export default class ChannelRepository extends BaseRepository<Channel> implements IRepository<Channel>  {

    async findBySlug(slug: string): Promise<Loaded<Channel, "blocks"> | null> {
        try {
            const res = await this.findOne({ slug: slug }, { populate: ['blocks'] });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async findByUserIDAndTitle(id: number, title: string): Promise<Loaded<Channel, never> | null> {
        try {
            const res = await this.findOne({ user: id, title: title });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    // Get all channels tied to user (order by most recently updated)
    async getAllByUserID(id: number): Promise<Loaded<Channel, "blocks">[]> {
        try {
            const res = await this.find({ user: id }, { orderBy: { date_updated: QueryOrder.DESC }, populate: ['blocks'] })
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async getChannelAndBlocks(channelID: number): Promise<Loaded<Channel, "blocks"> | null> {
        try {
            const res = await this.findOne({ id: channelID }, { populate: ['blocks'] });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }
}