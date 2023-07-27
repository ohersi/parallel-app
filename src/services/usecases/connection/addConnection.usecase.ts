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
import UserRepository from "@/repositories/user.repository";

//** USE CASE */
// GIVEN: id's from channel, block & user
// WHEN: connecting a block to channel
// THEN: return connection

@provide(TYPES.ADD_CONNECTION_USECASE)
export default class AddConnectionUsecase {

    private blockRepository: BlockRepository;
    private channelRepository: ChannelRepository;
    private connectionRepository: ConnectionRepository;
    private userRepository: UserRepository;
    private readonly usecase: AddToFeedUsecase;

    constructor(
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.CHANNEL_REPOSITORY) channelRepository: ChannelRepository,
        @inject(TYPES.CONNECTION_REPOSITORY) connectionRepository: ConnectionRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository,
        @inject(TYPES.ADD_TO_FEED_USECASE) addToFeedUsecase: AddToFeedUsecase,
    ) {
        this.blockRepository = blockRepository;
        this.channelRepository = channelRepository;
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
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

            // Add user info to channel obj
            const user = await this.userRepository.findByID(foundChannel.user);
            let updatedChannel: any;
            updatedChannel = foundChannel;
            let userInfo = {
                id: user?.id,
                slug: user?.slug,
                first_name: user?.first_name,
                last_name: user?.last_name,
                full_name: user?.full_name
            };
            updatedChannel.user = { ...updatedChannel.user, ...userInfo };

            // Redis fan out user feeds 
            await this.usecase.execute(
                userID,
                ACTIVITY.DATA.BLOCK,
                ACTIVITY.ACTION.CONNECTED,
                { block: foundBlock, channel: updatedChannel },
                timestamp
            );

            return foundBlock;
        }
        catch (err: any) {
            throw new ConnectionException(err.message);
        }
    }
}