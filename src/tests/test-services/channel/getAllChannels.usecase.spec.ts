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
import GetAllChannelsUscase from "../../../services/usecases/channel/getAllChannels.usecase";
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("GetAllChannelsUscase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: GetAllChannelsUscase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetAllChannelsUscase(mockedChannelRepo);
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

    describe('When getting all channels,', () => {

        describe("and channels do exist in the db,", () => {

            it("return all channels in the db.", async () => {
                // GIVEN

                // WHEN
                //** Instead of mocking results, FAKE the database using in-mem db to actually simulate the prod db call  */
                const getAllChannels = await orm.em.find(Channel, {});
                mockedChannelRepo.getAll.mockResolvedValue(getAllChannels);

                const results = await service.execute();

                // THEN
                //** Expect results to contain an array with an object that has a key/value of id = 1 */
                expect(results).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 1
                        })
                    ])
                );
            })
        })

        describe("and no channels are found in the db,", () => {

            it("return an empty array.", async () => {
                // GIVEN

                // WHEN
                const getAllChannels = await orm.em.find(Channel, -999);
                mockedChannelRepo.getAll.mockResolvedValue(getAllChannels);

                const results = await service.execute();

                // THEN
                expect(results).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN

                // WHEN
                mockedChannelRepo.getAll.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute() }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});