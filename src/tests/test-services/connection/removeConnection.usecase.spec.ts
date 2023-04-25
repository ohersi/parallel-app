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
import BlockRepository from "../../../repositories/block.repository";
import ConnectionRepository from "../../../repositories/connection.repository";
import RemoveConnectionUsecase from "../../../services/usecases/connection/removeConnection.usecase";
import { Block } from "../../../entities/block.entity";
import { Connection as Connections } from "../../../entities/connection.entity";

describe("RemoveConnectionUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    const mockedBlockRepo = mockDeep<BlockRepository>();
    const mockedConnectionRepo = mockDeep<ConnectionRepository>();
    let service: RemoveConnectionUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let connection: ConnectionRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new RemoveConnectionUsecase(mockedBlockRepo, mockedChannelRepo, mockedConnectionRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedBlockRepo);
        mockReset(mockedBlockRepo);
        mockReset(mockedConnectionRepo)
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        connection = orm.em.getRepository<Connections>(Connections);
        // Add connection
        const foundChannel = await orm.em.findOne(Channel, 1);
        const foundBlock = await orm.em.findOne(Block, 1);
        const newConnection = new Connections(
            foundBlock!,
            foundChannel!,
            new Date()
        );
        await connection.save(newConnection);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When removing a connection between block and channel,', () => {

        describe("and the channel is found in the db,", () => {

            describe("and the block is found in the db,", () => {

                describe("and the channel user id DOES match the logged in user id,", () => {

                    describe("and a connection can be found between block and channel,", () => {

                        describe("and the block and channel are be disconnected from the database,", () => {

                            it("return nothing.", async () => {
                                // GIVEN
                                const blockID = 1;
                                const channelID = 1;
                                const userID = 1;

                                // WHEN
                                const foundChannel = await orm.em.findOne(Channel, channelID);
                                const foundBlock = await orm.em.findOne(Block, blockID);
                                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                                mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                                if (foundChannel && foundBlock) {
                                    const foundConnection = await connection.findByBlockAndChannelID(blockID, channelID);
                                    mockedConnectionRepo.findByBlockAndChannelID.mockResolvedValue(foundConnection);
                                    if (foundConnection) {
                                        // Persist and flush to database
                                        // const removedConneciton = await connection.delete(foundConnection);
                                        // Set mocked result to be newly removed connection
                                        mockedConnectionRepo.delete.mockResolvedValue(null);
                                        // Remove from collection
                                        // await foundBlock.channels.init();
                                        // foundBlock.channels.remove(foundChannel);
                                    }
                                }
                                const results = await service.execute(blockID, userID, channelID);

                                // THEN
                                // const returnsNullIfDeleted = await connection.findByBlockAndChannelID(blockID, channelID);
                                expect(results).toBeUndefined();
                            })
                        })

                        describe("and the block and channel CANNOT be disconnected from the database,", () => {

                            it("throw an Error from the db.", async () => {
                                // GIVEN
                                const blockID = 1;
                                const channelID = 1;
                                const userID = 1;

                                // WHEN
                                const foundChannel = await orm.em.findOne(Channel, channelID);
                                const foundBlock = await orm.em.findOne(Block, blockID);
                                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                                mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                                // Set mocked result to be newly created block
                                mockedConnectionRepo.save.mockRejectedValue(Error);

                                // THEN
                                expect(async () => await service.execute(blockID, userID, channelID)).rejects.toThrow(Error);
                            })
                        })
                    })

                    describe("and a connection CANNOT be found between block and channel,", () => {

                        it("throw an Error stating no connection found.", () => {

                        })
                    })
                })

                describe("and the channel user id does NOT match the logged in user id,", () => {

                    it("throw Error stating that they do not have permission to disconnect from this channel.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const channelID = 1;
                        const userID = -99;

                        // WHEN
                        const foundChannel = await orm.em.findOne(Channel, channelID);
                        const foundBlock = await orm.em.findOne(Block, blockID);
                        mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                        mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                        // THEN
                        expect(async () => await service.execute(blockID, userID, channelID)).rejects.toThrow(Error);
                    })
                })
            })

            describe("and the block does NOT exist in the db,", () => {

                it("throw an Error stating the block does not exist.", async () => {
                    // GIVEN
                    const blockID = -99;
                    const channelID = 1;
                    const userID = 1;

                    // WHEN
                    const foundChannel = await orm.em.findOne(Channel, channelID);
                    const foundBlock = await orm.em.findOne(Block, blockID);
                    mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                    mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                    // THEN
                    expect(async () => await service.execute(blockID, userID, channelID)).rejects.toThrow(Error);
                })
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("throw an Error stating the channel does not exist.", async () => {
                // GIVEN
                const blockID = 1;
                const channelID = -99;
                const userID = 1;

                // WHEN
                const foundChannel = await orm.em.findOne(Channel, channelID);
                const foundBlock = await orm.em.findOne(Block, blockID);
                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                mockedBlockRepo.findByID.mockResolvedValue(foundBlock);

                // THEN
                expect(async () => await service.execute(blockID, userID, channelID)).rejects.toThrow(Error);
            })
        })

    })
});