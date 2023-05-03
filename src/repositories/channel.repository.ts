// Packages
import { Entity, Loaded, QueryOrder } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Channel } from '../entities/channel.entity';
import { Block } from '../entities/block.entity';
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
    async getAllByUserID(userID: number, limit: number): Promise<any[]> {
        try {

            const channels = await this.find({ user: userID });
            let res: any[] = [];
            
            for (const channel of channels) {
                // Initalize channel blocks and get total amount
                const init = await channel?.blocks.init();
                const total_blocks = init?.count();
                // Paginate populated items
                const blocks = await init?.matching({
                    limit: limit,
                    orderBy: { date_updated: QueryOrder.DESC }
                });
                res.push( { channel, blocks, total_blocks } );
            }

            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async getChannelAndBlocks(channelID: number, last_id: number, limit: number): Promise<[
        Loaded<Channel, never> | null,
        Loaded<Loaded<Block, never>, never>[] | undefined,
        number | undefined
    ]> {
        try {
            const channel = await this.findOne({ id: channelID });
            // Initalize channel blocks and get total amount
            const blocks = await channel?.blocks.init();
            const count = blocks?.count();
            // Paginate populated items
            const items = await blocks?.matching({
                where: { id: { $gte: last_id } },
                limit: limit,
                orderBy: { date_updated: QueryOrder.DESC }
            });

            return [channel, items, count];
        }
        catch (error: any) {
            throw new Error(error);
        }
    }
}