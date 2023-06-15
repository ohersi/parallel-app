// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import FollowRepository from "@/repositories/follow.repository";
import FollowException from "@/utils/exceptions/follow.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a channel id
// WHEN: find a channel matching the id
// THEN: return a followers object

@provide(TYPES.GET_USER_FOLLOW_CONNECTION_USECASE)
export default class GetUserFollowConnectionUsecase {

    private followRepository: FollowRepository;

    constructor(@inject(TYPES.FOLLOW_REPOSITORY) followRepository: FollowRepository) {
        this.followRepository = followRepository;
    }

    public execute = async (userID: number, channelID: number): Promise<boolean> => {
        try {
            const connection = await this.followRepository.findIfFollowsChannel(userID, channelID);

            if (!connection) {
                return false;
            };

            return true;
        }
        catch (err: any) {
            throw new FollowException(err.message);
        }
    }
}