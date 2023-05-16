// Packages
import { Entity, Loaded, QueryOrder } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Friend } from '@/entities/friend.entity';
import IRepository from '@/repositories/interfaces/repository.interface';
import BaseRepository from '@/repositories/base.repository';

@injectable()
@Entity({ customRepository: () => Friend })
export default class FriendRepository extends BaseRepository<Friend> implements IRepository<Friend>  {

    async findFriendsConnection(following_id: number, followed_id: number): Promise<Loaded<Friend, never> | null> {
        try {
            const res = await this.findOne({ following_user: following_id, followed_user: followed_id });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async findAllFollowers(followed_id: number): Promise<Loaded<Friend, "following_user">[]> {
        try {
            const res = this.find(
                { followed_user: followed_id },
                {
                    populate: ['following_user'],
                    orderBy: { date_created: QueryOrder.DESC }
                });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async findAllFollowing(following_id: number): Promise<Loaded<Friend, "followed_user">[]> {
        try {
            const res = this.find(
                { following_user: following_id },
                {
                    populate: ['followed_user'],
                    orderBy: { date_created: QueryOrder.DESC }
                });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }
};