// Packages
import { Entity, Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Follow } from '../entities/follow.entity';
import IRepository from './interfaces/repository.interface';
import BaseRepository from './base.repository';

@injectable()
@Entity({ customRepository: () => Follow })
export default class FollowRepository extends BaseRepository<Follow> implements IRepository<Follow>  {

    async findIfFollowsChannel(following_id: number, channel_id: number): Promise<Loaded<Follow, never> | null> {
        try {
            const res = await this.findOne({ user: following_id, followed_channel: channel_id });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async findAllUserFollowingChannel(channel_id: number): Promise<Loaded<Follow, "user">[]> {
        try {
            const res = this.find({ followed_channel: channel_id }, { populate: ['user'] });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }
};