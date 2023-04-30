// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Follow } from "../../../entities/follow.entity";
import FollowRepository from "../../../repositories/follow.repository";
import UserRepository from "../../../repositories/user.repository";
import FollowException from "./../../../utils/exceptions/follow.exception";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: user id
// WHEN: find all channels user follows
// THEN: return all all channels user follows

@provide(TYPES.GET_ALL_CHANNELS_USER_FOLLOWS_USECASE)
export default class GetAllChannelsUserFollowsUsecase {

    private followRepository: FollowRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.FOLLOW_REPOSITORY) followRepository: FollowRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    public execute = async (userID: number): Promise<Loaded<Follow, "followed_channel">[]> => {
        try {
            // Find user
            const foundUser = await this.userRepository.findByID(userID);
            if (!foundUser) {
                throw new FollowException(`No user found matching that id.`);
            }
            const allChannelsUserFollows = await this.followRepository.findAllChannelsUserFollows(foundUser.id);
            return allChannelsUserFollows;
        }
        catch (err: any) {
            throw new FollowException(err.message);
        }
    }
}