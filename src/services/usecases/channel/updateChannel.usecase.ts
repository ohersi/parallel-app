// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import ChannelRepository from "../../../repositories/channel.repository";
import ChannelException from "../../../utils/exceptions/channel.exception";
import { Channel } from "../../../entities/channel.entity";
import ChannelDTO from "../../../dto/channel.dto";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: channel object has has all fields
// WHEN: updating channel info
// THEN: channel info is updated

@provide(TYPES.UPDATE_CHANNEL_USECASE)
export default class UpdateChannelUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (id: number, userID: number, channel: ChannelDTO): Promise<ChannelDTO> => {
        try {
            // Find channel
            const foundChannel = await this.channelRepository.findByID(id);
            if (!foundChannel) {
                throw new ChannelException(`No channel found matching that id.`);
            }
            if (foundChannel.user !== userID) {
                throw new ChannelException('User logged in does not match the user of the channel being edited.');
            }
            // Update channel 
            const updatedChannel = await this.channelRepository.update(foundChannel, channel);
            // Return dto with updated channel info
            return new ChannelDTO(
                updatedChannel.user,
                updatedChannel.title,
                updatedChannel.description,
                updatedChannel.date_created,
                new Date()
            )
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}