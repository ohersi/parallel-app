// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import ChannelRepository from "@/repositories/channel.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import ChannelDTO from "@/dto/channel.dto";
import { TYPES } from "@/utils/types";
import { convertToSlug, checkSlug } from "@/resources/helper/text-manipulation";

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
            // Update time
            channel.date_updated = new Date();

            // Update slug
            if (channel.title) {
                const slugifyTitle = convertToSlug(channel.title);
                const slug = await checkSlug(slugifyTitle, foundChannel.slug, this.channelRepository);
                channel.slug = slug;
            }

            const results = await this.channelRepository.update(foundChannel, channel);

            // Return dto with updated channel info
            return new ChannelDTO(
                undefined,
                results.title,
                results.description,
                results.slug,
                results.date_created,
                results.date_updated
            );
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}