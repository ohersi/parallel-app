// Packages
import { inject } from "inversify";
import { Loaded } from "@mikro-orm/core";
import { provide } from "inversify-binding-decorators";
// Imports
import { Block } from "../../../entities/block.entity";
import BlockRepository from "../../../repositories/block.repository";
import BlockException from "../../../utils/exceptions/block.exception";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: -
// WHEN: find all blocks in database
// THEN: return all blocks

@provide(TYPES.GET_ALL_BLOCKS_USECASE)
export default class GetAllBlocksUsecase {

    private blockRepository: BlockRepository;

    constructor(@inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository) {
        this.blockRepository = blockRepository;
    }

    public execute = async (): Promise<Loaded<Block, never>[]> => {
        try {
            const allBlocks = await this.blockRepository.getAll();
            return allBlocks;
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}