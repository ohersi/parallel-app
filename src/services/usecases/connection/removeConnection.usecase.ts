// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "../../../entities/block.entity";
import BlockRepository from "../../../repositories/block.repository";
import ChannelRepository from "../../../repositories/channel.repository";
import ConnectionRepository from "../../../repositories/connection.repository";
import ConnectionException from "../../../utils/exceptions/connection.exception";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: id's from channel, block & user
// WHEN: disconnect a block from channel
// THEN: return disconnected block

@provide(TYPES.REMOVE_CONNECTION_USECASE)
export default class RemoveConnectionUsecase {

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

    public execute = async (blockID: number, userID: number, channelID: number): Promise<void> => {
        try {
            // Find channel & block
            const foundChannel = await this.channelRepository.findByID(channelID);
            const foundBlock = await this.blockRepository.findByID(blockID);

            if (!foundChannel || !foundBlock) {
                throw new ConnectionException(`No channel or block found matching that id.`);
            }
            if (foundChannel.user !== userID) {
                throw new ConnectionException('User logged in does not match the user of the channel being disconnected.');
            }

            // Find connections
            const foundConnection = await this.connectionRepository.findByBlockAndChannelID(blockID, channelID);

            if (!foundConnection) {
                throw new ConnectionException(`No connection found between block id: [${blockID}] and channelID: [${channelID}].`)
            }

            // Remove from collection
            await foundBlock.channels.init();
            foundBlock.channels.remove(foundChannel);

            // Disconnect block and channel in pivot table, persist and flush
            await this.connectionRepository.delete(foundConnection);
        }
        catch (err: any) {
            throw new ConnectionException(err.message);
        }
    }
}