// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { Block } from "../../../entities/block.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import BlockRepository from "../../../repositories/block.repository";
import UpdateBlockUsecase from '../../../services/usecases/block/updateBlock.usecase';
import BlockException from "../../../utils/exceptions/block.exception";
import BlockDTO from "../../../dto/block.dto";

describe("UpdateBlockUsecase", () => {

    const mockedBlockRepo = mockDeep<BlockRepository>();
    let service: UpdateBlockUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let blocks: BlockRepository;
    let backup: IBackup;

    const testBlock = {
        title: "update test block",
        description: "description"
    }

    beforeEach(() => {
        service = new UpdateBlockUsecase(mockedBlockRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedBlockRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        blocks = orm.em.getRepository<Block>(Block);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When updating a block,', () => {

        describe("and the block is found in the db,", () => {

            describe("and the block user id DOES match the logged in user id,", () => {

                describe("and the block is successfully updated,", () => {

                    it("return a BlockDTO.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const userID = 1;
                        const block = testBlock as BlockDTO;

                        // WHEN
                        const foundBlock = await orm.em.findOne(Block, blockID);
                        mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                        if (foundBlock) {
                            // Persist and flush to database
                            const updatedBlock = await blocks.update(foundBlock, block);
                            // Set mocked result to be updated block
                            mockedBlockRepo.update.mockResolvedValue(updatedBlock);
                        }

                        const results = await service.execute(blockID, userID, testBlock);

                        // THEN
                        expect(results).toBeInstanceOf(BlockDTO);
                    })
                })

                describe("and the block cannot be updated to the database,", () => {

                    it("throw an Error from the db.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const userID = 1;

                        // WHEN
                        const getBlock = await orm.em.findOne(Block, blockID);
                        mockedBlockRepo.findByID.mockResolvedValue(getBlock);
                        // repo throws an error
                        mockedBlockRepo.update.mockRejectedValue(Error);

                        // THEN
                        expect(async () => await service.execute(blockID, userID, testBlock)).rejects.toThrow(BlockException);
                    })
                })
            })

            describe("and the block user id does NOT match the logged in user id,", () => {

                it("throw Error stating that they do not have permission to edit block.", async () => {
                    // GIVEN
                    const blockID = 1;
                    const userID = -999;

                    // WHEN
                    const getBlock = await orm.em.findOne(Block, blockID);
                    mockedBlockRepo.findByID.mockResolvedValue(getBlock);

                    // THEN
                    expect(async () => await service.execute(blockID, userID, testBlock)).rejects.toThrow(BlockException);
                })
            })
        })

        describe("and the block does NOT exist in the db,", () => {

            it("throw an Error stating the block does not exist.", async () => {
                // GIVEN
                const blockID = -99;
                const userID = 1;

                // WHEN
                const getBlock = await orm.em.findOne(Block, blockID);
                mockedBlockRepo.findByID.mockResolvedValue(getBlock);

                // THEN
                expect(getBlock).toEqual(null);
                expect(async () => await service.execute(blockID, userID, testBlock)).rejects.toThrow(BlockException);
            })
        })

    })
});