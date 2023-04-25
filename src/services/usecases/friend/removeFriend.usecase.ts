// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import FriendRepository from "../../../repositories/friend.repository";
import UserRepository from "../../../repositories/user.repository";
import FriendException from "../../../utils/exceptions/friend.exception";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: id's from logged in user and user to unfollow
// WHEN: disconnect friends connection
// THEN: return disconnected friend

@provide(TYPES.REMOVE_FRIEND_USECASE)
export default class RemoveFriendUsecase {

    private friendRepository: FriendRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.FRIEND_REPOSITORY) friendRepository: FriendRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository,
    ) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
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
                throw new FriendException('User logged cannot unfollow themselves.');
            }
            // Find friend connection
            const foundFriendConnection = await this.friendRepository.findFriendsConnection(loggedInUserID, followID);

            if (!foundFriendConnection) {
                throw new FriendException(`Logged in user [${loggedInUserID}] and follow user [${followID}] are not friends.`);
            }

            // Remove from collection
            await loggedInUser.friends.init();
            loggedInUser.friends.remove(followUser);

            // Disconnect following and follower in pivot table, persist and flush;
            await this.friendRepository.delete(foundFriendConnection);
        }
        catch (err: any) {
            throw new FriendException(err.message);
        }
    }
}