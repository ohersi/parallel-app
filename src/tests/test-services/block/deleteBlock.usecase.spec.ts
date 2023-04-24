// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { Block } from "../../../entities/block.entity";
import { Connection as Connections } from "../../../entities/connection.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import BlockRepository from "../../../repositories/block.repository";
import ConnectionRepository from "../../../repositories/connection.repository";
import DeleteBlockUsecase from "../../../services/usecases/block/deleteBlock.usecase";
import BlockException from "../../../utils/exceptions/block.exception";

describe("DeleteBlockUsecase", () => {

    const mockedBlockRepo = mockDeep<BlockRepository>();
    const mockedConnectionRepo = mockDeep<ConnectionRepository>();
    let service: DeleteBlockUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let blocks: BlockRepository;
    let connections: ConnectionRepository;
    let backup: IBackup;


    beforeEach(() => {
        service = new DeleteBlockUsecase(mockedBlockRepo, mockedConnectionRepo);
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
        connections = orm.em.getRepository<Connections>(Connections);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When deleting a block,', () => {

        describe("and the block is found in the db,", () => {

            describe("and the block user id does NOT match the logged in user id,", () => {

                it("throw Error stating that they do not have permission to delete block.", async () => {
                    // GIVEN
                    const blockID = 1;
                    const userID = -999;

                    // WHEN
                    const getBlock = await orm.em.findOne(Block, blockID);
                    mockedBlockRepo.findByID.mockResolvedValue(getBlock);

                    // THEN
                    expect(async () => await service.execute(blockID, userID)).rejects.toThrow(BlockException);
                })
            })

            describe("and the block user id DOES match the logged in user id,", () => {

                describe("and the block CANNOT be deleted from the database,", () => {

                    it("throw an Error from the db.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const userID = 1;

                        // WHEN
                        const foundBlock = await orm.em.findOne(Block, blockID);
                        mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                        if (foundBlock) {
                            // Remove from colleciton
                            await foundBlock.channels.init();
                            foundBlock.channels.removeAll();

                            // Find and delete all connections
                            mockedConnectionRepo.findAllByBlockID.mockResolvedValue([]);
                            mockedConnectionRepo.deleteAll.mockResolvedValue(null);

                            // repo throws an error
                            mockedBlockRepo.delete.mockRejectedValue(Error);
                        }
                        // THEN
                        expect(async () => await service.execute(blockID, userID)).rejects.toThrow(BlockException);
                    })
                })

                describe("and the block can be successfully deleted,", () => {

                    it("delete block.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const userID = 1;

                        // WHEN
                        const foundBlock = await orm.em.findOne(Block, blockID);
                        mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                        if (foundBlock) {
                            // Remove from colleciton
                            await foundBlock.channels.init();
                            foundBlock.channels.removeAll();

                            // Find and delete all connections
                            mockedConnectionRepo.findAllByBlockID.mockResolvedValue([]);
                            mockedConnectionRepo.deleteAll.mockResolvedValue(null);

                            // Persist and flush to database
                            const deletedBlock = await blocks.delete(foundBlock);
                            // Set mocked result to be updated channel
                            mockedBlockRepo.delete.mockResolvedValue(deletedBlock);
                        }

                        const results = await service.execute(blockID, userID);

                        // THEN
                        const returnsNullIfDeleted = await orm.em.findOne(Block, blockID);
                        expect(returnsNullIfDeleted).toEqual(null);
                    })
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
                expect(async () => await service.execute(blockID, userID)).rejects.toThrow(BlockException);
            })
        })

    })
});