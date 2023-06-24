// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import { Connection } from "@/entities/connection.entity";
import BlockRepository from "@/repositories/block.repository";
import ChannelRepository from "@/repositories/channel.repository";
import ConnectionRepository from "@/repositories/connection.repository";
import ConnectionException from "@/utils/exceptions/connection.exception";
import AddToFeedUsecase from "@/services/usecases/feed/addToFeed.usecase";
import { ACTIVITY } from "@/utils/types/enum";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: id's from channel, block & user
// WHEN: connecting a block to channel
// THEN: return connection

@provide(TYPES.ADD_CONNECTION_USECASE)
export default class AddConnectionUsecase {

    private blockRepository: BlockRepository;
    private channelRepository: ChannelRepository;
    private connectionRepository: ConnectionRepository;
    private readonly usecase: AddToFeedUsecase;

    constructor(
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.CONNECTION_REPOSITORY) connectionRepository: ConnectionRepository,
        @inject(TYPES.ADD_TO_FEED_USECASE) addToFeedUsecase: AddToFeedUsecase,
    ) {
        this.blockRepository = blockRepository;
        this.channelRepository = channelRepository;
        this.connectionRepository = connectionRepository;
        this.usecase = addToFeedUsecase;
    }

    public execute = async (blockID: number, userID: number, channelID: number): Promise<Loaded<Block, never>> => {
        try {
            // Find channel & block
            const foundChannel = await this.channelRepository.findByID(channelID);
            const foundBlock = await this.blockRepository.findByID(blockID);

            if (!foundChannel || !foundBlock) {
                throw new ConnectionException(`No channel or block found matching that id.`);
            }
            if (foundChannel.user !== userID) {
                throw new ConnectionException('User logged in does not match the user of the channel being connected.');
            }
            // Create connection entity
            let timestamp = new Date();

            const newConnection = new Connection(
                foundBlock,
                foundChannel,
                timestamp,
            );
            // Connect block and channel in pivot table, persist and flush
            await this.connectionRepository.save(newConnection);

            // Add to collection
            foundBlock.channels.add(foundChannel);

            // Redis fan out user feeds 
            await this.usecase.execute(
                foundChannel.user,
                ACTIVITY.DATA.CHANNEL,
                ACTIVITY.ACTION.CONNECTED,
                { block: foundBlock, channel: foundChannel },
                timestamp
            );

            return foundBlock;
        }
        catch (err: any) {
            throw new ConnectionException(err.message);
        }
    }
}