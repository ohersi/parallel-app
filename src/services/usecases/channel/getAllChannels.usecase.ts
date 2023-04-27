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
// GIVEN: -
// WHEN: find all channels in db
// THEN: return all channels

@provide(TYPES.GET_ALL_CHANNELS_USECASE)
export default class GetAllChannelsUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (): Promise<Loaded<Channel, never>[]> => {
        try {
            const getAllChannels = await this.channelRepository.getAll();
            return getAllChannels;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}