// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import BlockRepository from "../../../repositories/block.repository";
import ConnectionRepository from "../../../repositories/connection.repository";
import BlockException from "../../../utils/exceptions/block.exception";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: a block id
// WHEN: find block in db by id
// THEN: delete block

@provide(TYPES.DELETE_BLOCK_USECASE)
export default class DeleteBlockUsecase {

    private blockRepository: BlockRepository;
    private connectionRepository: ConnectionRepository;

    constructor(
        @inject(TYPES.BLOCK_REPOSITORY) blockRepository: BlockRepository,
        @inject(TYPES.CONNECTION_REPOSITORY) connectionRepository: ConnectionRepository,
    ) {
        this.blockRepository = blockRepository;
        this.connectionRepository = connectionRepository;
    }

    public execute = async (blockID: number, userID: number): Promise<void> => {
        try {
            // Find block
            const foundBlock = await this.blockRepository.findByID(blockID);
            if (!foundBlock) {
                throw new BlockException(`No block found matching that id.`);
            }
            if (foundBlock.user !== userID) {
                throw new BlockException('User logged in does not match the user of the block being deleted.');
            }
            // Remove from colleciton
            await foundBlock.channels.init();
            foundBlock.channels.removeAll();

            // Find and delete all connections
            const foundConnections = await this.connectionRepository.findAllByBlockID(blockID);
            await this.connectionRepository.deleteAll(foundConnections);

            // Delete block
            await this.blockRepository.delete(foundBlock);
        }
        catch (err: any) {
            throw new BlockException(err.message);
        }
    }
}