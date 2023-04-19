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
import GetAllChannelsByUserIdUsecase from '../../../services/usecases/channel/getAllChannelsByUserId.usecase';
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("GetAllChannelsByUserIdUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: GetAllChannelsByUserIdUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetAllChannelsByUserIdUsecase(mockedChannelRepo);
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

    describe('When getting all channels associated with a user,', () => {

        describe("and users' channels do exist in the db,", () => {

            it("return all channels by that user in the db.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                //** Instead of mocking results, FAKE the database using in-mem db to actually simulate the prod db call  */
                const getUserChannels = await orm.em.find(Channel, { user: id });
                mockedChannelRepo.getAllByUserID.mockResolvedValue(getUserChannels);

                const results = await service.execute(id);

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

        describe("and users' channels do NOT exist in the db,", () => {

            it("return an empty array.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                const getUserChannels = await orm.em.find(Channel, { user: id });
                mockedChannelRepo.getAllByUserID.mockResolvedValue(getUserChannels);

                const results = await service.execute(id);

                // THEN
                expect(results).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockedChannelRepo.getAllByUserID.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});