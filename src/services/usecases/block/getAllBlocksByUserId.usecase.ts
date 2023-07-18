// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "@/entities/block.entity";
import BlockRepository from "@/repositories/block.repository";
import BlockException from "@/utils/exceptions/block.exception";
import { TYPES } from "@/utils/types";

//** USE CASE */
// GIVEN: block object has has all fields
// WHEN: updating block info
// THEN: block is updated

@provide(TYPES.GET_ALL_BLOCKS_BY_USER_ID_USECASE)
export default class GetAllBlocksByUserIdUsecase {

    private blockRepository: BlockRepository;

    constructor(@inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository) {
        this.blockRepository = blockRepository;
    }

    public execute = async (userID: number): Promise<Loaded<Block, never>[]> => {
        try {
            const userBlocks = await this.blockRepository.getAllByUserID(userID);
            return userBlocks;
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}