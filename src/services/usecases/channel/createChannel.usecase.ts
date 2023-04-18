// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import ChannelRepository from "../../../repositories/channel.repository";
import ChannelException from "../../../utils/exceptions/channel.exception";
import { Channel } from "../../../entities/channel.entity";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: channel object has has all fields
// WHEN: creating a new channel
// THEN: channel is created

@provide(TYPES.CREATE_CHANNEL_USECASE)
export default class CreateChannelUsecase {

    private channelRepository: ChannelRepository;

    constructor(@inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository) {
        this.channelRepository = channelRepository;
    }

    public execute = async (body: any, userID: number) => {
        try {
            const id = userID;
            const title = body.title;
            // Check if title already exists in a channel associated with that user
            const foundChannel = await this.channelRepository.findByUserIDAndTitle(id, title);

            if (foundChannel) {
                throw new ChannelException(`Channel with title: ${foundChannel.title} already exists for this user.`)
            }
            // Create channel entity
            const newChannel = new Channel(
                userID,
                body.title,
                body.description,
                new Date(),
                new Date()
            );
            // Add to db, persists and flush
            const createdChannel = await this.channelRepository.save(newChannel);
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}