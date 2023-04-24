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
import GetAllBlocksUsecase from "../../../services/usecases/block/getAllBlocks.usecase";
import BlockException from "../../../utils/exceptions/block.exception";

describe("GetAllBlocksUsecase", () => {

    const mockedBlockRepo = mockDeep<BlockRepository>();
    let service: GetAllBlocksUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetAllBlocksUsecase(mockedBlockRepo);
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

    describe('When getting all blocks,', () => {

        describe("and blocks do exist in the db,", () => {

            it("return all blocks in db.", async () => {
                // GIVEN

                // WHEN
                //** Instead of mocking results, FAKE the database using in-mem db to actually simulate the prod db call  */
                const getAllBlocks = await orm.em.find(Block, {});
                mockedBlockRepo.getAll.mockResolvedValue(getAllBlocks);

                const results = await service.execute();

                // THEN
                //** Expect results to contain an array with an object that has a key/value of id = 1 */
                expect(results).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 1
                        })
                    ])
                )
            })
        })

        describe("and no blocks are found in the db,", () => {

            it("return empty array.", async () => {
                // GIVEN

                // WHEN
                const getAllBlocks = await orm.em.find(Block, -999);
                mockedBlockRepo.getAll.mockResolvedValue(getAllBlocks);

                const results = await service.execute();

                // THEN
                expect(results).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN

                // WHEN
                mockedBlockRepo.getAll.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute() }).rejects.toThrow(BlockException);
            })
        })

    })
});