// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import ChannelRepository from "@/repositories/channel.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import { Channel } from "@/entities/channel.entity";
import { TYPES } from "@/utils/types";


//** USE CASE */
// GIVEN: a channel id
// WHEN: find channel in db by id
// THEN: delete channel

@provide(TYPES.DELETE_CHANNEL_USECASE)
export default class DeleteChannelUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (id: number, userID: number): Promise<void> => {
        try {
            // Find channel
            const foundChannel = await this.channelRepository.findByID(id);
            if (!foundChannel) {
                throw new ChannelException(`No channel found matching that id.`);
            }
            if (foundChannel.user !== userID) {
                throw new ChannelException('User logged in does not match the user of the channel being deleted.');
            }
            // Delete channel
            await this.channelRepository.delete(foundChannel);
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}