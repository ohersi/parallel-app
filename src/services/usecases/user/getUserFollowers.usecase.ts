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
// THEN: return a followers object

@provide(TYPES.GET_USER_FOLLOWERS_USECASE)
export default class GetUserFollowersUsecase {

    private friendRepository: FriendRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.FRIEND_REPOSITORY) friendRepository: FriendRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
    }

    public execute = async (slug: string): Promise<Loaded<Friend, "following_user">[]> => {
        try {
            const user = await this.userRepository.findBySlug(slug);
            if (!user) {
                throw new Error(`Cannot find followers; no user with name [${slug}] found.`)
            };
            
            const results = await this.friendRepository.findAllFollowers(user.id);
            return results;
        }
        catch (err: any) {
            throw new FriendException(err.message);
        }
    }
}