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

    public execute = async (title: string): Promise<Loaded<Channel>[]> => {
        try {

            let channelArr: Loaded<Channel>[] = [];

            const channels = await this.channelRepository.searchChannelsMatchingTitle(title);

            for (const channel of channels) {
                const user = await this.userRepository.findOne(channel.user);
                let arr: any = channel;
                let userInfo = {
                    id: user?.id,
                    slug: user?.slug,
                    first_name: user?.first_name,
                    last_name: user?.last_name,
                    full_name: user?.full_name
                };
                arr.user = { ...arr.user, ...userInfo };
                channelArr.push(arr);
            }

            return channelArr;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}