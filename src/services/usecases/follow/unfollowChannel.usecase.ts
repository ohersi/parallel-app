// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserDTO from "@/dto/user.dto";
import ChannelDTO from "@/dto/channel.dto";
import FollowRepository from "@/repositories/follow.repository";
import UserRepository from "@/repositories/user.repository";
import ChannelRepository from "@/repositories/channel.repository";
import FollowException from "@/utils/exceptions/follow.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: id's from logged in user and channel to unfollow
// WHEN: unfollow user to channel
// THEN: return unfollow connection

@provide(TYPES.UNFOLLOW_CHANNEL_USECASE)
export default class UnFollowChannelUsecase {

    private followRepository: FollowRepository;
    private userRepository: UserRepository;
    private channelRepository: ChannelRepository;

    constructor(
        @inject(TYPES.FOLLOW_REPOSITORY) followRepository: FollowRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository,
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository
    ) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.channelRepository = channelRepository;
    }

    public execute = async (loggedInUserID: number, channelID: number): Promise<void> => {
        try {
            // Find channel & user
            const loggedInUser = await this.userRepository.findByID(loggedInUserID);
            const foundChannel = await this.channelRepository.findByID(channelID);

            if (!foundChannel || !loggedInUser) {
                throw new FollowException(`No channel or user found matching that id.`);
            }
            if (loggedInUser.id !== loggedInUserID) {
                throw new FollowException(`User logged and user trying to unfollow channel does not match.`);
            }
            if (foundChannel.user === loggedInUser.id) {
                throw new FollowException('User cannot unfollow their own channel.');
            }
            // Find follow connection
            const foundFollowConnection = await this.followRepository.findIfFollowsChannel(loggedInUser.id, foundChannel.id);

            if (!foundFollowConnection) {
                throw new FollowException(`Logged in user [${loggedInUser.id}] and does not follow channel [${foundChannel.id}].`)
            }
            // Remove from collection
            await loggedInUser.followed_channel.init();
            loggedInUser.followed_channel.remove(foundChannel);

            // Discconnect user and channel in follow pivot table, persist and flush
            await this.followRepository.delete(foundFollowConnection);

            // Update channel follower count & loggedInUser's following count
            const newChannelFollowersCount = { follower_count: foundChannel.follower_count - 1 } as ChannelDTO;
            const newFollowingCount = { following_count: loggedInUser.following_count - 1 } as UserDTO;

            await this.channelRepository.update(foundChannel, newChannelFollowersCount);
            await this.userRepository.update(loggedInUser, newFollowingCount);
        }
        catch (err: any) {
            throw new FollowException(err.message);
        }
    }
}