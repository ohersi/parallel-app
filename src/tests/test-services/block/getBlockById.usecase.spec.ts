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
import GetBlockByIdUsecase from "../../../services/usecases/block/getBlockByID.usecase";
import BlockException from "../../../utils/exceptions/block.exception";

describe("GetBlockByIdUsecase", () => {

    const mockedBlockRepo = mockDeep<BlockRepository>();
    let service: GetBlockByIdUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetBlockByIdUsecase(mockedBlockRepo);
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
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When given a block id,', () => {

        describe("and the block does NOT exist in the db,", () => {

            it("return null.", async () => {
                // GIVEN
                const blockID = -99;

                // WHEN
                const getBlock = await orm.em.findOne(Block, { id: blockID }, { populate: ['channels'] });
                mockedBlockRepo.getBlockAndItsChannels.mockResolvedValue(getBlock);

                const results = await service.execute(blockID);

                // THEN
                expect(getBlock).toEqual(null);
                expect(results).toEqual(null);
            })
        })

        describe("and the block does exist in the db,", () => {

            it("return a block object from database.", async () => {
                // GIVEN
                const blockID = 1;

                // WHEN
                const getBlock = await orm.em.findOne(Block, { id: blockID }, { populate: ['channels'] });
                mockedBlockRepo.getBlockAndItsChannels.mockResolvedValue(getBlock);

                const results = await service.execute(blockID);

                // THEN
                expect(getBlock).toEqual(results);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockedBlockRepo.getBlockAndItsChannels.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(BlockException);
            })
        })

    })
});