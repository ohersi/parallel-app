// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Friend } from "@/entities/friend.entity";
import FriendRepository from "@/repositories/friend.repository";
import UserRepository from "@/repositories/user.repository";
import FriendException from "@/utils/exceptions/friend.exception";
import AddToFeedUsecase from "@/services/usecases/feed/addToFeed.usecase";
import { updateFollowers } from "@/resources/caching/cache";
import { ACTIVITY } from "@/utils/types/enum";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: id's from logged in user and user to follow
// WHEN: add friend 
// THEN: return friend connection

@provide(TYPES.ADD_FRIEND_USECASE)
export default class AddFriendUsecase {

    private friendRepository: FriendRepository;
    private userRepository: UserRepository;
    private readonly usecase: AddToFeedUsecase;

    constructor(
        @inject(TYPES.FRIEND_REPOSITORY) friendRepository: FriendRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository,
        @inject(TYPES.ADD_TO_FEED_USECASE) addToFeedUsecase: AddToFeedUsecase
    ) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
        this.usecase = addToFeedUsecase;
    }

    public execute = async (loggedInUserID: number, followID: number): Promise<void> => {
        try {
            // Find following & follower users
            const loggedInUser = await this.userRepository.findByID(loggedInUserID);
            const followUser = await this.userRepository.findByID(followID);

            if (!loggedInUser || !followUser) {
                throw new FriendException(`No user or follow user found matching those ids.`);
            }
            if (loggedInUser.id !== loggedInUserID) {
                throw new FriendException('User logged and user trying to add friend does not match.');
            }
            if (loggedInUser.id === followUser.id) {
                throw new FriendException('User logged cannot follow themselves.');
            }
            // Create friend entity
            let timestamp = new Date();

            const newFriend = new Friend(
                loggedInUser,
                followUser,
                timestamp
            );

            // Connect following and follower in pivot table, persist and flush
            await this.friendRepository.save(newFriend);

            // Add to collection
            loggedInUser.friends.add(followUser);

            // Update user (not the one logged in) followers redis cache
            await updateFollowers(followUser.id, () => this.friendRepository.findAllFollowers(followUser.id))

            // Redis fan out user feeds 
            await this.usecase.execute(
                loggedInUser.id,
                ACTIVITY.DATA.USER,
                ACTIVITY.ACTION.FOLLOWED,
                followUser,
                timestamp
            )

            /* TODO: Update loggedInUser's following count and followedUser's follower count
            const newLoggedInUserCount = loggedInUser.following_count + 1 
            const newFollowedUsersCount = loggedInUser.follower_count + 1 
             await this.userRepository.update(newLoggedInUserCount);
             await this.userRepository.update(newFollowedUsersCount);
             */
        }
        catch (err: any) {
            throw new FriendException(err.message);
        }
    }
}