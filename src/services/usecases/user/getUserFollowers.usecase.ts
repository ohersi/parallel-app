// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import FriendRepository from "../../../repositories/friend.repository";
import { TYPES } from "../../../utils/types";
import { Friend } from "../../../entities/friend.entity";
import FriendException from "../../../utils/exceptions/friend.exception";

//** USE CASE */
// GIVEN: a user id
// WHEN: find a user matching the id
// THEN: return a followers object

@provide(TYPES.GET_USER_FOLLOWERS_USECASE)
export default class GetUserFollowersUsecase {

    private friendRepository: FriendRepository;

    constructor(@inject(TYPES.FRIEND_REPOSITORY) friendRepository: FriendRepository) {
        this.friendRepository = friendRepository;
    }

    public execute = async (userID: number): Promise<Loaded<Friend, "following_user">[]> => {
        try {
            const results = await this.friendRepository.findAllFollowers(userID);
            return results;
        }
        catch (err: any) {
            throw new FriendException(err.message);
        }
    }
}