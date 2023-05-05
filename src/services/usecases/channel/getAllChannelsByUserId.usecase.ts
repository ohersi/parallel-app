// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import ChannelRepository from "../../../repositories/channel.repository";
import { TYPES } from "../../../utils/types";
import ChannelException from "../../../utils/exceptions/channel.exception";
import ChannelDTO from "../../../dto/channel.dto";
import PageResults from "../../../resources/pagination/pageResults";

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

    public execute = async (userID: number,limit: number): Promise<PageResults> => {
        try {
            const userChannels  = await this.channelRepository.getAllByUserID(userID, limit);
            userChannels.forEach(( channel: any ) => {
                delete channel.channel['blocks'];
            });
            const pageResults = new PageResults(
                userChannels.length,
                undefined,
                userChannels
            )
            return pageResults;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}