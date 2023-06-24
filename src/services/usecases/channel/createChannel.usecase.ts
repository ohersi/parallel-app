// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { customAlphabet } from 'nanoid';
// Imports
import { Channel } from "@/entities/channel.entity";
import ChannelRepository from "@/repositories/channel.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import AddToFeedUsecase from "@/services/usecases/activity/addToFeed.usecase";
import { convertToSlug } from "@/resources/helper/text-manipulation";
import { TYPES } from "@/utils/types";
import { ACTIVITY } from "@/utils/types/enum";

//** USE CASE */
// GIVEN: channel object has has all fields
// WHEN: creating a new channel
// THEN: channel is created

@provide(TYPES.CREATE_CHANNEL_USECASE)
export default class CreateChannelUsecase {

    private channelRepository: ChannelRepository;
    private readonly usecase: AddToFeedUsecase;

    constructor(
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.ADD_TO_FEED_USECASE) addToFeedUsecase: AddToFeedUsecase
    ) {
        this.channelRepository = channelRepository;
        this.usecase = addToFeedUsecase;
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
            // Check if slug exists / Create slug
            let slug = convertToSlug(body.title);
            const slugExists = await this.channelRepository.findOne({ slug: slug });
            if (slugExists) {
                const nanoid = customAlphabet('0123456789_abcdefghijklmnopqrstuvwxyz-', 14);
                slug = slug.concat("-", nanoid());
            }
            // Create channel entity
            let timestamp = new Date();

            const newChannel = new Channel(
                userID,
                body.title,
                body.description,
                slug,
                timestamp,
                timestamp
            );
            // Add to db, persists and flush
            const createdChannel = await this.channelRepository.save(newChannel);

            // TODO: Update user followers redis cache

            // Redis fan out user feeds 
            await this.usecase.execute(
                userID,
                ACTIVITY.DATA.CHANNEL,
                ACTIVITY.ACTION.CREATED,
                createdChannel,
                timestamp
            );
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}