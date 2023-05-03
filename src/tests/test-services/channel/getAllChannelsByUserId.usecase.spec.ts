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
                const limit = 10;

                const arr: any[] = []; 

                // WHEN
                //** Instead of mocking results, FAKE the database using in-mem db to actually simulate the prod db call  */
                const getUserChannels = await orm.em.find(Channel, { user: id });
                for (const channel of getUserChannels) {
                    const init = await channel?.blocks.init();
                    const blocks = init?.getItems(); 
                    arr.push({ channel, blocks });
                }
                mockedChannelRepo.getAllByUserID.mockResolvedValue(arr);

                const results = await service.execute(id, limit);

                // THEN
                expect(results).toEqual(arr);
            })
        })

        describe("and users' channels do NOT exist in the db,", () => {

            it("return an empty array.", async () => {
                // GIVEN
                const id = -99;
                const limit = 10;

                const arr: any[] = [];

                // WHEN
                const getUserChannels = await orm.em.find(Channel, { user: id });
                
                mockedChannelRepo.getAllByUserID.mockResolvedValue(arr);

                const results = await service.execute(id, limit);

                // THEN
                expect(getUserChannels).toEqual([]);
                expect(results).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -99;
                const limit = 10;

                // WHEN
                mockedChannelRepo.getAllByUserID.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id, limit) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});