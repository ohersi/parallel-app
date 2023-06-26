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
import PageResults from "@/resources/pagination/pageResults";

//** USE CASE */
// GIVEN: -
// WHEN: find all channels & blocks in db
// THEN: return sorted by timestamp

// TODO: Get last channel and block ids for pagination

interface CustomPageResults extends Partial<PageResults> {
    channel_total: number,
    block_total: number,
    channel_lastID: string | null,
    block_lastID: string | null,
}

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

    public execute = async (channel_lastID: string, block_lastID: string, limit: number) => {
        try {
            let channels: any[] = [];
            let blocks: any[] = [];

            let lastChannel: Channel;
            let lastBlock: Block;

            let channelEncoded: string | null = null;
            let blockEncoded: string | null = null;

            const { count: channelTotal, channels: getAllChannels } = await this.channelRepository.getAllChannelsOffset(channel_lastID, limit);

            const { count: blockTotal, blocks: getAllBlocks } = await this.blockRepository.getAlBlocksOffset(block_lastID, limit);

            if (Array.isArray(getAllChannels) && !getAllChannels.length ||
                Array.isArray(getAllBlocks) && !getAllBlocks.length) return [];

            if (getAllChannels.length && (getAllChannels.length > 1 && channelTotal > limit || limit == 1)) {
                lastChannel = getAllChannels[getAllChannels.length - 1];
                const channelDate = lastChannel.date_updated.toISOString();
                channelEncoded = Buffer.from(channelDate, 'utf8').toString('base64');
            }

            if (getAllBlocks.length && (getAllBlocks.length > 1 && blockTotal > limit || limit == 1)) {
                lastBlock = getAllBlocks[getAllBlocks.length - 1];
                const blockDate = lastBlock.date_updated.toISOString();
                blockEncoded = Buffer.from(blockDate, 'utf8').toString('base64');
            }

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

            const pageResults: CustomPageResults = {
                total: channelTotal + blockTotal,
                channel_total: channelTotal,
                block_total: blockTotal,
                channel_lastID: channelEncoded,
                block_lastID: blockEncoded,
                data: sortedFeed
            }

            return pageResults;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}