// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import BlockRepository from "../../../repositories/block.repository";
import ChannelRepository from "../../../repositories/channel.repository";
import ConnectionRepository from "../../../repositories/connection.repository";
import { Block } from "../../../entities/block.entity";
import { Connection } from "../../../entities/connection.entity";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: channel object has has all fields
// WHEN: creating a new channel
// THEN: channel is created

@provide(TYPES.CREATE_BLOCK_USECASE)
export default class CreateBlockUsecase {

    private blockRepository: BlockRepository;
    private channelRepository: ChannelRepository;
    private connectionRepository: ConnectionRepository;

    constructor(
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.CONNECTION_REPOSITORY) connectionRepository: ConnectionRepository,
    ) {
        this.blockRepository = blockRepository;
        this.channelRepository = channelRepository;
        this.connectionRepository = connectionRepository;
    }

    public execute = async (body: any, userID: number, channelID: number) => {
        try {
            // Find channel
            const foundChannel = await this.channelRepository.findByID(channelID);
            if (!foundChannel) {
                throw new Error(`No channel found matching that id.`);
            }
            if (foundChannel.user !== userID) {
                throw new Error('User logged in does not match the user of the channel being edited.');
            }
            // Create block entity
            const newBlock = new Block(
                userID,
                body.title,
                body.description,
                body.source_url,
                body.image_url,
                new Date(),
                new Date()
            );
            // Add to db, persist and flush
            const createdBlock = await this.blockRepository.save(newBlock);
            // Create connection entity
            const newConnection = new Connection(
                createdBlock,
                foundChannel,
                new Date(),
            );
            // Connect block and channel in pivot table, persist and flush
            await this.connectionRepository.save(newConnection);

            // Add to collection
            newBlock.channels.add(foundChannel);

            return createdBlock;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}