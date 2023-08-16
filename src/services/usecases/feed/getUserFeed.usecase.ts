// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Loaded } from "@mikro-orm/core";
// Imports
import { redisContainer } from "@/app";
import { Channel } from "@/entities/channel.entity";
import ChannelRepository from "@/repositories/channel.repository";
import BlockRepository from "@/repositories/block.repository";
import UserRepository from "@/repositories/user.repository";
import { ActivityData } from "@/services/usecases/feed/addToFeed.usecase";
import { ACTIVITY } from "@/utils/types/enum";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a user feed
// WHEN: find all info based on id's in db
// THEN: return updated feed

@provide(TYPES.GET_USER_FEED_USECASE)
export default class GetUserFeedUsecase {

    private channelRepository: ChannelRepository;
    private blockRepository: BlockRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.channelRepository = channelRepository;
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

//  TODO: Make sure to update redis cache for when block, user, channel is updated

    public execute = async (feed: ActivityData[]): Promise<ActivityData[]> => {
        try {

            const redisClient = redisContainer.redis;

            for (const item of feed) {

                if (item.action_type === ACTIVITY.ACTION.CREATED) {
                    // USER
                    const user = await this.userRepository.findByID(item.user.id);

                    if (!user) throw new Error(`User with id [${item.user.id}] could not be found.`);
                    // Add sanitized user info
                    item.user = {
                        id: user.id,
                        full_name: user.full_name,
                        slug: user.slug,
                    }

                    // Created channel
                    if (item.data_type === ACTIVITY.DATA.CHANNEL) {
                        // Check cache first
                        const cachedChannel = await redisClient.get(`channel:${item.data.id}`);
                        if (!cachedChannel) {
                            // Get Channel Data
                            const channel = await this.channelRepository.findByID(item.data.id);
                            item.data = channel;
                        }
                        else {
                            // Get data user data
                            item.data = JSON.parse(cachedChannel);
                        }
                    }
                }

                if (item.action_type === ACTIVITY.ACTION.FOLLOWED) {
                    // USER either...
                    const user = await this.userRepository.findByID(item.user.id);

                    if (!user) throw new Error(`User with id [${item.user.id}] could not be found.`);
                    // Add sanitized user info
                    item.user = {
                        id: user.id,
                        full_name: user.full_name,
                        slug: user.slug,
                    }

                    // Followed another user or...
                    if (item.data_type === ACTIVITY.DATA.USER) {
                        // Check cache first
                        const cachedUser = await redisClient.get(`user:${item.data.id}`);
                        if (!cachedUser) {
                            // Get User Data
                            const followedUser = await this.userRepository.findByID(item.data.id);
                            // Return sanitized user info
                            item.data = {
                                id: followedUser?.id,
                                slug: followedUser?.slug,
                                first_name: followedUser?.first_name,
                                last_name: followedUser?.last_name,
                                full_name: followedUser?.full_name
                            };
                        }
                        else {
                            const userObj = JSON.parse(cachedUser);
                            let userInfo = {
                                id: userObj?.id,
                                slug: userObj?.slug,
                                first_name: userObj?.first_name,
                                last_name: userObj?.last_name,
                                full_name: userObj?.full_name
                            }
                            // Return sanitized user info
                            item.data = userInfo;
                        }
                    }

                    // Followed a channel
                    if (item.data_type === ACTIVITY.DATA.CHANNEL) {

                        let channel: Loaded<Channel, never> | string;

                        // Check cache first
                        const cachedChannel = await redisClient.get(`channel:${item.data.id}`);

                        if (!cachedChannel) {
                            // Get Channel Data
                            const channelData = await this.channelRepository.findByID(item.data.id);
                            if (!channelData) throw new Error(`Channel with id [${item.data.id}] could not be found.`);
                            channel = channelData;
                        }
                        else {
                            channel = cachedChannel;
                        }

                        // // Add channel user info
                        const channelObj = typeof channel == 'string' ? JSON.parse(channel) : channel;
                        const channelUser = await this.userRepository.findByID(channelObj.user);

                        let updatedChannel: any;
                        updatedChannel = Object.assign({}, channelObj);

                        let channelUserInfo = {
                            id: channelUser?.id,
                            slug: channelUser?.slug,
                            first_name: channelUser?.first_name,
                            last_name: channelUser?.last_name,
                            full_name: channelUser?.full_name
                        };
                        updatedChannel.user = { ...updatedChannel.user, ...channelUserInfo };

                        // Update channel data
                        item.data = updatedChannel;
                    }
                }

                if (item.action_type === ACTIVITY.ACTION.CONNECTED) {
                    // USER
                    const user = await this.userRepository.findByID(item.user.id);

                    if (!user) throw new Error(`User with id [${item.user.id}] could not be found.`);
                    // Add sanitized user info
                    item.user = {
                        id: user.id,
                        full_name: user.full_name,
                        slug: user.slug,
                    }

                    // CHANNEL
                    let channel: Loaded<Channel, never> | string;

                    // Check cache first
                    const cachedChannel = await redisClient.get(`channel:${item.data.channel.id}`);

                    if (!cachedChannel) {
                        // Get Channel Data
                        const channelData = await this.channelRepository.findByID(item.data.channel.id);
                        if (!channelData) throw new Error(`Channel with id [${item.data.channel.id}] could not be found.`);
                        channel = channelData;
                    }
                    else {
                        channel = cachedChannel;
                    }

                    // // Add channel user info
                    const channelObj = typeof channel == 'string' ? JSON.parse(channel) : channel;
                    const channelUser = await this.userRepository.findByID(channelObj.user);

                    let updatedChannel: any;
                    updatedChannel = Object.assign({}, channelObj);

                    let channelUserInfo = {
                        id: channelUser?.id,
                        slug: channelUser?.slug,
                        first_name: channelUser?.first_name,
                        last_name: channelUser?.last_name,
                        full_name: channelUser?.full_name
                    };
                    updatedChannel.user = { ...updatedChannel.user, ...channelUserInfo };

                    // Update channel data
                    item.data.channel = updatedChannel;


                    // BLOCK
                    const cachedBlock = await redisClient.get(`block:${item.data.block.id}`);
                    if (!cachedBlock) {
                        // Get Block Data
                        const block = await this.blockRepository.findByID(item.data.block.id);
                        item.data.block = block;
                    }
                    else {
                        item.data.block = JSON.parse(cachedBlock);
                    }
                }
            }

            return feed;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}