// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Follow } from "@/entities/follow.entity";
import FollowRepository from "@/repositories/follow.repository";
import UserRepository from "@/repositories/user.repository";
import ChannelRepository from "@/repositories/channel.repository";
import FollowException from "@/utils/exceptions/follow.exception";
import AddToFeedUsecase from "@/services/usecases/feed/addToFeed.usecase";
import { ACTIVITY } from "@/utils/types/enum";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: id's from logged in user and channel to follow
// WHEN: follow user to channel
// THEN: return follow connection

@provide(TYPES.FOLLOW_CHANNEL_USECASE)
export default class FollowChannelUsecase {

    private followRepository: FollowRepository;
    private userRepository: UserRepository;
    private channelRepository: ChannelRepository;
    private readonly usecase: AddToFeedUsecase;

    constructor(
        @inject(TYPES.FOLLOW_REPOSITORY) followRepository: FollowRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository,
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.ADD_TO_FEED_USECASE) addToFeedUsecase: AddToFeedUsecase
    ) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.channelRepository = channelRepository;
        this.usecase = addToFeedUsecase;
    }

    public execute = async (loggedInUserID: number, channelID: number): Promise<Follow> => {
        try {
            // Find channel & user
            const loggedInUser = await this.userRepository.findByID(loggedInUserID);
            const foundChannel = await this.channelRepository.findByID(channelID);

            if (!foundChannel || !loggedInUser) {
                throw new FollowException(`No channel or user found matching that id.`);
            }
            if (loggedInUser.id !== loggedInUserID) {
                throw new FollowException(`User logged and user trying to follow channel does not match.`);
            }
            if (foundChannel.user === loggedInUser.id) {
                throw new FollowException('User cannot follow their own channel.');
            }
            // Create follow entity
            let timestamp = new Date();

            const newFollow = new Follow(
                loggedInUser,
                foundChannel,
                timestamp
            );

            // Connect user and channel in pivot table, persist and flush
            const results = await this.followRepository.save(newFollow);

            // Add to collection
            loggedInUser.followed_channel.add(foundChannel);

            // Redis fan out user feeds 
            await this.usecase.execute(
                loggedInUser.id,
                ACTIVITY.DATA.CHANNEL,
                ACTIVITY.ACTION.FOLLOWED,
                foundChannel,
                timestamp
            );

            /* TODO: Update channel follower_count
            const newChannelFollowersCount =  {
               follower_count: foundChannel.following_count + 1 
             }
             await this.channelRepository.update(newLoggedInUserCount);
             */

            return results;
        }
        catch (err: any) {
            throw new FollowException(err.message);
        }
    }
}