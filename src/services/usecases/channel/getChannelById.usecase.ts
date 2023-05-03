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
// GIVEN: channel id
// WHEN: channel w/ that id database
// THEN: return PageResults w/ channel data

@provide(TYPES.GET_CHANNEL_BY_ID_USECASE)
export default class GetChannelByIdUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (id: number, last_id: number, limit: number): Promise<PageResults> => {
        try {
            const [channel, items, count ] = await this.channelRepository.getChannelAndBlocks(id, last_id, limit);

            const total = count || 0;
            let next = last_id + 1 > total ? null : last_id + 1;

            const channelDTO = new ChannelDTO(
                channel?.id,
                channel?.title,
                channel?.description,
                channel?.slug,
                channel?.date_created,
                channel?.date_updated,
                items
            );
            const pageResults = new PageResults(
                total,
                next,
                channelDTO
            );

            return pageResults;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}