// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import { Channel } from "@/entities/channel.entity";
import ChannelRepository from "@/repositories/channel.repository";
import BlockRepository from "@/repositories/block.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: -
// WHEN: find all channels & blocks in db
// THEN: return sorted by timestamp

@provide(TYPES.GET_DEFAULT_FEED_USECASE)
export default class GetDefaultFeedUsecase {

    private channelRepository: ChannelRepository;
    private blockRepository: BlockRepository;

    constructor(
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository
    ) {
        this.channelRepository = channelRepository;
        this.blockRepository = blockRepository;
    }

    public execute = async (): Promise<(Channel | Block)[]> => {
        try {
            let channels: any[] = [];
            let blocks: any[] = [];

            const getAllChannels = await this.channelRepository.getAll();
            const getAllBlocks = await this.blockRepository.getAll();

            if (Array.isArray(getAllChannels) && !getAllChannels.length ||
                Array.isArray(getAllBlocks) && !getAllBlocks.length) return [];

            channels = getAllChannels;
            blocks = getAllBlocks;

            const combined: Array<Channel | Block> = channels.concat(blocks);

            const sortedFeed = combined.sort((n1, n2) => {
                if (n1.date_updated > n2.date_updated) {
                    return -1;
                }
                if (n1.date_updated < n2.date_updated) {
                    return 1;
                }
                return 0;
            })

            return sortedFeed;

        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}