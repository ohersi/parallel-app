// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import { Connection } from "@/entities/connection.entity";
import BlockRepository from "@/repositories/block.repository";
import ChannelRepository from "@/repositories/channel.repository";
import ConnectionRepository from "@/repositories/connection.repository";
import AddToFeedUsecase from "@/services/usecases/feed/addToFeed.usecase";
import { ACTIVITY } from "@/utils/types/enum";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: block object has has all fields
// WHEN: creating a new block
// THEN: block is created

@provide(TYPES.CREATE_BLOCK_USECASE)
export default class CreateBlockUsecase {

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

    public execute = async (body: any, userID: number, channelID: number) => {
        try {
            // Find channel
            const foundChannel = await this.channelRepository.findByID(channelID);
            if (!foundChannel) {
                throw new Error(`No channel found matching that id.`);
            }
            if (foundChannel.user !== userID) {
                throw new Error('User logged in does not match the user of the channel being added to.');
            }
            // Create block entity
            let timestamp = new Date();

            const newBlock = new Block(
                userID,
                body.title,
                body.description,
                body.source_url,
                body.image_url,
                timestamp,
                timestamp,
            );
            // Add to db, persist and flush
            const createdBlock = await this.blockRepository.save(newBlock);
            // Create connection entity
            const newConnection = new Connection(
                createdBlock,
                foundChannel,
                timestamp,
            );
            // Connect block and channel in pivot table, persist and flush
            await this.connectionRepository.save(newConnection);

            // Add to collection
            newBlock.channels.add(foundChannel);

            // Redis fan out user feeds 
            await this.usecase.execute(
                userID,
                ACTIVITY.DATA.BLOCK,
                ACTIVITY.ACTION.CONNECTED,
                { block: { id: newBlock.id }, channel: { id: foundChannel.id } },
                timestamp
            );

            return createdBlock;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}