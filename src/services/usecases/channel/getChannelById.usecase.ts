// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Channel } from "../../../entities/channel.entity";
import ChannelRepository from "../../../repositories/channel.repository";
import { TYPES } from "../../../utils/types";
import ChannelException from "../../../utils/exceptions/channel.exception";


//** USE CASE */
// GIVEN: -
// WHEN: find all channels in database
// THEN: return channels

@provide(TYPES.GET_CHANNEL_BY_ID_USECASE)
export default class GetChannelByIdUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (id: number) => {
        try {
            const channel = await this.channelRepository.getChannelAndBlocks(id);
            return channel;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}