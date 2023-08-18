// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import { Channel } from "@/entities/channel.entity";
import ChannelRepository from "@/repositories/channel.repository";
import BlockRepository from "@/repositories/block.repository";
import UserRepository from "@/repositories/user.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import PageResults from "@/resources/pagination/pageResults";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: -
// WHEN: find all channels & blocks in db
// THEN: return sorted by timestamp

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
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.channelRepository = channelRepository;
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    public execute = async (channel_lastID: string, block_lastID: string, limit: number) => {
        try {
            let channels: any[] = [];
            let blocks: any[] = [];
            let channelArr: Channel[] = [];

            let lastChannel: Channel;
            let lastBlock: Block;

            let channelEncoded: string | null = null;
            let blockEncoded: string | null = null;


            const { count: channelTotal, channels: getAllChannels } = await this.channelRepository.getAllChannelsOffset(channel_lastID, limit);

            const { count: blockTotal, blocks: getAllBlocks } = await this.blockRepository.getAlBlocksOffset(block_lastID, limit);

            for (const channel of getAllChannels) {
                const user = await this.userRepository.findByID(channel.user);
                let arr: any = channel;
                let userInfo = {
                    id: user?.id,
                    slug: user?.slug,
                    first_name: user?.first_name,
                    last_name: user?.last_name,
                    full_name: user?.full_name
                }
                arr.user = { ...arr.user, ...userInfo };
                channelArr.push(arr);
            }

            if (Array.isArray(channelArr) && !channelArr.length ||
                Array.isArray(getAllBlocks) && !getAllBlocks.length) return [];

            if (channelArr.length && (channelArr.length > 1 && channelTotal > limit || limit == 1)) {
                lastChannel = channelArr[channelArr.length - 1];
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