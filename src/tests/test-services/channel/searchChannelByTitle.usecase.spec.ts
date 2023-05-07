// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { Channel } from "../../../entities/channel.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import ChannelRepository from '../../../repositories/channel.repository';
import SearchChannelByTitleUsecase from "../../../services/usecases/channel/searchChannelByTitle.usecase";
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("SearchChannelByTitleUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: SearchChannelByTitleUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new SearchChannelByTitleUsecase(mockedChannelRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedChannelRepo);
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

    describe('When given a channel title,', () => {

        describe("and channel/s matching portion or all of the given title does NOT exist in the db,", () => {

            it("return null.", async () => {
                // GIVEN
                const title = "NOTFOUND";
                const channels = [] as Channel[];

                // WHEN
                mockedChannelRepo.searchChannelsMatchingTitle.mockResolvedValue(channels);

                const results = await service.execute(title);

                // THEN
                expect(results).toEqual(channels);
            })
        })

        describe("and channel/s matching portion or all of the given title does exist in the db,", () => {

            it("return array of channel object/s from database.", async () => {
                // GIVEN
                const title = "title";
                const channels = [ { title: "title "}] as Channel[];

                // WHEN
                mockedChannelRepo.searchChannelsMatchingTitle.mockResolvedValue(channels);

                const results = await service.execute(title);

                // THEN
                expect(results).toEqual(channels);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const title = "title";

                // WHEN
                mockedChannelRepo.searchChannelsMatchingTitle.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(title) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});