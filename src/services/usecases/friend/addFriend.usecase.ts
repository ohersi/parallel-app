// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { User } from "../../../entities/user.entity";
import FriendRepository from "../../../repositories/friend.repository";
import UserRepository from "../../../repositories/user.repository";
import { TYPES } from "../../../utils/types";
import { Friend } from "../../../entities/friend.entity";
import FriendException from "../../../utils/exceptions/friend.exception";

//** USE CASE */
// GIVEN: id's from logged in user and user to follow
// WHEN: add friend 
// THEN: return friend connection

@provide(TYPES.ADD_FRIEND_USECASE)
export default class AddFriendUsecase {

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
                throw new FriendException('User logged cannot follow themselves.');
            }
            // Create friend entity
            const newFriend = new Friend(
                loggedInUser,
                followUser,
                new Date()
            );

            // Connect following and follower in pivot table, persist and flush
            await this.friendRepository.save(newFriend);

            // Add to collection
            loggedInUser.friends.add(followUser);
        }
        catch (err: any) {
            throw new FriendException(err.message);
        }
    }
}