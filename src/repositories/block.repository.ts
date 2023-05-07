// Packages
import { Entity, Loaded, QueryOrder } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Block } from '../entities/block.entity';
import IRepository from './interfaces/repository.interface';
import BaseRepository from './base.repository';

@injectable()
@Entity({ customRepository: () => Block })
export default class BlockRepository extends BaseRepository<Block> implements IRepository<Block>  {

    async getBlockAndItsChannels(id: number): Promise<Loaded<Block, "channels"> | null> {
        try {
            const res = await this.findOne({ id: id }, { populate: ['channels'] });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async searchBlocksMatchingTitle(title: string) {
        try {
            const res = await this.find(
                // Regex search
                { title: { $re: '(?i)^.*'+title+'.*$'} },
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
}