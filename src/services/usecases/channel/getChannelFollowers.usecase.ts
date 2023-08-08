// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Follow } from "@/entities/follow.entity";
import FollowRepository from "@/repositories/follow.repository";
import ChannelRepository from "@/repositories/channel.repository";
import FollowException from "@/utils/exceptions/follow.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: channel id
// WHEN: find all users following channel
// THEN: return all users following channel

@provide(TYPES.GET_CHANNEL_FOLLOWERS_USECASE)
export default class GetChannelFollowersUsecase {

    private followRepository: FollowRepository;
    private channelRepository: ChannelRepository;

    constructor(
        @inject(TYPES.FOLLOW_REPOSITORY) followRepository: FollowRepository,
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository
    ) {
        this.followRepository = followRepository;
        this.channelRepository = channelRepository;
    }

    public execute = async (slug: string): Promise<Loaded<Follow, "user">[]> => {
        try {
            // Find channel
            const foundChannel = await this.channelRepository.findBySlugMini(slug);
            if (!foundChannel) {
                throw new FollowException(`No channel found matching that id.`);
            }
            const channelFollowers = await this.followRepository.findAllUserFollowingChannel(foundChannel.id);
            return channelFollowers;
        }
        catch (err: any) {
            throw new FollowException(err.message);
        }
    }
}