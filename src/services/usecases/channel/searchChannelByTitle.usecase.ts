// Packages
import { Loaded } from "@mikro-orm/core";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Channel } from "@/entities/channel.entity";
import ChannelRepository from "@/repositories/channel.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a channel title
// WHEN: find all channels matching portion/all of given title in db
// THEN: return all channels

@provide(TYPES.SEARCH_CHANNEL_BY_TITLE_USECASE)
export default class SearchChannelByTitleUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (title: string): Promise<Loaded<Channel, never>[]> => {
        try {
            const channels = await this.channelRepository.searchChannelsMatchingTitle(title);
            return channels;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}