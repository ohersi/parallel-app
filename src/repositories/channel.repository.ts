// Packages
import { Entity, Loaded, QueryOrder } from '@mikro-orm/core';
import { injectable } from 'inversify';
// Imports
import { Channel } from '@/entities/channel.entity';
import { Block } from '@/entities/block.entity';
import IRepository from '@/repositories/interfaces/repository.interface';
import BaseRepository from '@/repositories/base.repository';

@injectable()
@Entity({ customRepository: () => Channel })
export default class ChannelRepository extends BaseRepository<Channel> implements IRepository<Channel>  {

    async findBySlug(slug: string, last_id: string, limit: number): Promise<[
        Loaded<Channel, never> | null,
        Loaded<Loaded<Block, never>, never>[] | undefined,
        number | undefined
    ]> {
        try {
            const channel = await this.findOne({ slug: slug });
            // Initalize channel blocks and get total amount
            const blocks = await channel?.blocks.init();
            const count = blocks?.count();
            // Paginate populated items
            const items = await blocks?.matching({
                // Get all blocks with timestamp less than last_id timestamp
                where: { date_updated: { $lt: new Date(last_id) } },
                limit: limit,
                orderBy: { date_updated: QueryOrder.DESC }
            });

            return [channel, items, count];
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
                res.push({ channel, blocks, total_blocks });
            }

            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async getChannelAndBlocks(channelID: number, last_id: string, limit: number): Promise<[
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
                where: { date_updated: { $lt: new Date(last_id) } },
                limit: limit,
                orderBy: { date_updated: QueryOrder.DESC }
            });

            return [channel, items, count];
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async searchChannelsMatchingTitle(title: string): Promise<Loaded<Channel, never>[]> {
        try {
            const res = await this.find(
                // Regex search
                { title: { $re: '(?i)^.*' + title + '.*$' } },
                // Full text search
                // { searchableTitle: { $fulltext: title } },
                { orderBy: { date_updated: QueryOrder.DESC } }
            );
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async getAllChannelsOffset(last_id: string, limit: number) {
        try {
            const qb = this.createQueryBuilder();

            qb.select('*')
                .where({ date_updated: { $lt: new Date(last_id) } })
                .limit(limit)
                .orderBy({ date_updated: QueryOrder.DESC });

            const [channels, count] = await qb.getResultAndCount();

            return { channels, count }
        }
        catch (error: any) {
            throw new Error(error);
        }
    }
}