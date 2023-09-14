// Packages
import { Loaded } from "@mikro-orm/core";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import { Channel } from "@/entities/channel.entity";
import BlockRepository from "@/repositories/block.repository";
import UserRepository from "@/repositories/user.repository";
import BlockException from "@/utils/exceptions/block.exception";
import BlockDTO from "@/dto/block.dto";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: block object has has all fields
// WHEN: updating block info
// THEN: block is updated

@provide(TYPES.UPDATE_BLOCK_USECASE)
export default class UpdateBlockUsecase {

    private blockRepository: BlockRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
        ) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    public execute = async (blockID: number, userID: number, block: BlockDTO) => {
        try {
            // Find block
            const foundBlock = await this.blockRepository.getBlockAndItsChannels(blockID);
            if (!foundBlock) {
                throw new BlockException(`No block found matching that id.`);
            }
            if (foundBlock.user !== userID) {
                throw new BlockException('User logged in does not match the user of the block being edited.');
            }
            // Update time
            foundBlock.date_updated = new Date();

            const results = await this.blockRepository.update(foundBlock, block);

            if (!foundBlock?.channels) return results;

            let channelArr: Loaded<Channel>[] = [];

            for (const channel of foundBlock?.channels) {
                const user = await this.userRepository.findOne(channel.user);
                let arr: any = channel;
                let userInfo = {
                    id: user?.id,
                    slug: user?.slug,
                    first_name: user?.first_name,
                    last_name: user?.last_name,
                    full_name: user?.full_name
                };
                arr.user = { ...arr.user, ...userInfo };
                channelArr.push(arr);
            }

            let updatedBlock: any; 
            updatedBlock = foundBlock;
            updatedBlock.channels = channelArr;

            return updatedBlock;
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}