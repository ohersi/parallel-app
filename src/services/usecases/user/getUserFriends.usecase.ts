// Packages
import { Loaded } from "@mikro-orm/core";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Friend } from "@/entities/friend.entity";
import FriendRepository from "@/repositories/friend.repository";
import UserRepository from "@/repositories/user.repository";
import FriendException from "@/utils/exceptions/friend.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a user id
// WHEN: find a user matching the id
// THEN: return a friends object

@provide(TYPES.GET_USER_FRIENDS_USECASE)
export default class GetUserFriendsUsecase {

    private friendRepository: FriendRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.FRIEND_REPOSITORY) friendRepository: FriendRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
    }

    public execute = async (slug: string): Promise<Loaded<Friend, "followed_user">[]> => {
        try {
            const user = await this.userRepository.findBySlug(slug);
            if (!user) {
                throw new Error(`Cannot find following; No user with name [${slug}] found.`)
            };

            const results = await this.friendRepository.findAllFollowing(user.id);
            return results;
        }
        catch (err: any) {
            throw new FriendException(err.message);
        }
    }
}