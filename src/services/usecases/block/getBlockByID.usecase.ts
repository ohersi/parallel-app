// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import BlockRepository from "@/repositories/block.repository";
import BlockException from "@/utils/exceptions/block.exception";
import { TYPES } from "@/utils/types";
import UserRepository from "@/repositories/user.repository";
import { Channel } from "@/entities/channel.entity";

//** USE CASE */
// GIVEN: block object has has all fields
// WHEN: updating block info
// THEN: block is updated

@provide(TYPES.GET_BLOCK_BY_ID_USECASE)
export default class GetBlockByIdUsecase {

    private blockRepository: BlockRepository;
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.USER_REPOSITORY) userRepository: UserRepository
        ) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    public execute = async (blockID: number): Promise<Loaded<Block, "channels"> | null> => {
        try {
            let channelArr: Loaded<Channel>[] = [];
            
            const block = await this.blockRepository.getBlockAndItsChannels(blockID);

            if (!block?.channels) return block;

            for (const channel of block?.channels) {
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
            updatedBlock = block;
            updatedBlock.channels = channelArr;

            return updatedBlock;
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}