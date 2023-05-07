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
import SearchBlockByTitleUsecase from "../../../services/usecases/block/searchBlockByTitle.usecase";
import BlockException from "../../../utils/exceptions/block.exception";

describe("SearchBlockByTitleUsecase", () => {

    const mockedBlockRepo = mockDeep<BlockRepository>();
    let service: SearchBlockByTitleUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new SearchBlockByTitleUsecase(mockedBlockRepo);
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

    describe('When a block title,', () => {

        describe("and block/s matching portion or all of the given title does NOT exist in the db,", () => {

            it("return null.", async () => {
                // GIVEN
                const title = "NOTFOUND";
                const blocks = [] as Block[];

                // WHEN
                mockedBlockRepo.searchBlocksMatchingTitle.mockResolvedValue(blocks);

                const results = await service.execute(title);

                // THEN
                expect(results).toEqual(blocks);
            })
        })

        describe("and block/s matching portion or all of the given title does exist in the db,", () => {

            it("return array of block object/s from database.", async () => {
                // GIVEN
                const title = "title";
                const blocks = [ { title: "title "}] as Block[];

                // WHEN
                mockedBlockRepo.searchBlocksMatchingTitle.mockResolvedValue(blocks);

                const results = await service.execute(title);

                // THEN
                expect(results).toEqual(blocks);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const title = "title";

                // WHEN
                mockedBlockRepo.searchBlocksMatchingTitle.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(title) }).rejects.toThrow(BlockException);
            })
        })

    })
});