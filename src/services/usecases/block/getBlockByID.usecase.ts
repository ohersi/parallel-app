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
// GIVEN: block object has has all fields
// WHEN: updating block info
// THEN: block is updated

@provide(TYPES.GET_BLOCK_BY_ID_USECASE)
export default class GetBlockByIdUsecase {

    private blockRepository: BlockRepository;

    constructor(@inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository) {
        this.blockRepository = blockRepository;
    }

    public execute = async (blockID: number): Promise<Loaded<Block, "channels">[]> => {
        try {
            const block = await this.blockRepository.getBlockAndItsChannels(blockID);
            return block;
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}