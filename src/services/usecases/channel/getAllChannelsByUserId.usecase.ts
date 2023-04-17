// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import ChannelRepository from "../../../repositories/channel.repository";
import { TYPES } from "../../../utils/types";
import { Channel } from "../../../entities/channel.entity";
import { Loaded } from "@mikro-orm/core";
import ChannelException from "../../../utils/exceptions/channel.exception";


//** USE CASE */
// GIVEN: A user id
// WHEN: find all channels associated with that user
// THEN: return user channels

@provide(TYPES.GET_ALL_CHANNELS_BY_USER_ID_USECASE)
export default class GetAllChannelsByUserIdUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (userID: number): Promise<Loaded<Channel, never>[]> => {
        try {
            const allUserChannels = await this.channelRepository.getAllByUserID(userID);
            return allUserChannels;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}