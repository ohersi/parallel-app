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

    async getBlockAndItsChannels(id: number): Promise<Loaded<Block, "channels">[]> {
        try {
            const res = await this.find({ id: id }, { populate: ['channels']});
            return res;
        } 
        catch (error: any) {
            throw new Error(error);
        }
    }
}