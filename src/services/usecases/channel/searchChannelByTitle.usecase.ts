// Packages
import { Loaded } from "@mikro-orm/core";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Channel } from "@/entities/channel.entity";
import ChannelRepository from "@/repositories/channel.repository";
import UserRepository from "@/repositories/user.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a channel title
// WHEN: find all channels matching portion/all of given title in db
// THEN: return all channels

@provide(TYPES.SEARCH_CHANNEL_BY_TITLE_USECASE)
export default class SearchChannelByTitleUsecase {

    private channelRepository: ChannelRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }

    public execute = async (title: string) => {
        try {

            let arr: any[] = [];

            const channels = await this.channelRepository.searchChannelsMatchingTitle(title);

            for (let channel of channels) {
                const user = await this.userRepository.findOne(channel.user);
                arr.push({ channel: channel, user: { slug: user?.slug, full_name: user?.full_name }});
            }

            return arr;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}