// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import BlockRepository from "@/repositories/block.repository";
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

    constructor(@inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository) {
        this.blockRepository = blockRepository;
    }

    public execute = async (blockID: number, userID: number, block: BlockDTO) => {
        try {
            // Find block
            const foundBlock = await this.blockRepository.findByID(blockID);
            if (!foundBlock) {
                throw new BlockException(`No block found matching that id.`);
            }
            if (foundBlock.user !== userID) {
                throw new BlockException('User logged in does not match the user of the block being edited.');
            }
            // Update time
            block.date_updated = new Date();

            const results = await this.blockRepository.update(foundBlock, block);

            // Return dto with updated block info
            return new BlockDTO(
                undefined,
                results.title,
                results.description,
                results.source_url,
                results.image_url,
                results.date_created,
                results.date_updated
            );
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}