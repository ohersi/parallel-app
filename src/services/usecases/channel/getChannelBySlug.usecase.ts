// Packages
import { Loaded } from "@mikro-orm/core";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import ChannelDTO from "@/dto/channel.dto";
import ChannelRepository from "@/repositories/channel.repository";
import UserRepository from "@/repositories/user.repository";
import ChannelException from "@/utils/exceptions/channel.exception";
import PageResults from "@/resources/pagination/pageResults";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: a slug string
// WHEN: find channel matching the slug in database
// THEN: return channel

@provide(TYPES.GET_CHANNEL_BY_SLUG_USECASE)
export default class GetChannelBySlugUsecase {

    private channelRepository: ChannelRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
    ) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }

    public execute = async (slug: string, last_id: string, limit: number): Promise<PageResults | null> => {
        try {

            const [channel, items, count] = await this.channelRepository.findBySlug(slug, last_id, limit);
            const total = count || 0;
            let block: Loaded<Block, never>;
            let encoded: string | null = null;

            if (channel) {

                const foundUser = await this.userRepository.findByID(channel.user);
                
                const user = {
                    id: foundUser?.id,
                    slug: foundUser?.slug,
                    full_name: foundUser?.full_name
                };

                const channelDTO = new ChannelDTO(
                    channel?.id,
                    channel?.title,
                    channel?.description,
                    channel?.slug,
                    channel?.date_created,
                    channel?.date_updated,
                    items,
                    user
                );

                if (channelDTO.blocks?.length && (channelDTO.blocks?.length > 1 && total > limit || limit == 1)) {
                    block = channelDTO.blocks[channelDTO?.blocks.length - 1];
                    const date = block.date_updated.toISOString();
                    encoded = Buffer.from(date, 'utf8').toString('base64');
                }

                const pageResults = new PageResults(
                    total,
                    encoded,
                    channelDTO
                );

                return pageResults;
            }

            return null;
        }
        catch (err: any) {
            throw new ChannelException(err.message);
        }
    }
}