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
// GIVEN: a slug string
// WHEN: find channel matching the slug in database
// THEN: return channel

@provide(TYPES.GET_CHANNEL_BY_SLUG_USECASE)
export default class GetChannelBySlugUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (slug: string): Promise<Loaded<Channel, "blocks"> | null> => {
        try {
            const channel = await this.channelRepository.findBySlug(slug);
            return channel;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}