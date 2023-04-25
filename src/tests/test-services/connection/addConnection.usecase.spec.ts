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
import AddConnectionUsecase from "../../../services/usecases/connection/addConnection.usecase";
import { Block } from "../../../entities/block.entity";
import { Connection as Connections } from "../../../entities/connection.entity";

describe("AddConnectionUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    const mockedBlockRepo = mockDeep<BlockRepository>();
    const mockedConnectionRepo = mockDeep<ConnectionRepository>();
    let service: AddConnectionUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let connection: ConnectionRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new AddConnectionUsecase(mockedBlockRepo, mockedChannelRepo, mockedConnectionRepo);
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
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When adding a connection between block and channel,', () => {

        describe("and the channel is found in the db,", () => {

            describe("and the block is found in the db,", () => {

                describe("and the channel user id DOES match the logged in user id,", () => {

                    describe("and a connection is successfully created,", () => {

                        it("return a Block.", async () => {
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
                                const newConnection = new Connections(
                                    foundBlock,
                                    foundChannel,
                                    new Date()
                                );

                                // Persist and flush to database
                                const createdConnection = await connection.save(newConnection);
                                // Set mocked result to be newly created block
                                mockedConnectionRepo.save.mockResolvedValue(createdConnection);
                                // Add to collection
                                foundBlock.channels.add(foundChannel);
                            }

                            const results = await service.execute(blockID, userID, channelID);

                            // THEN
                            expect(results).toBeInstanceOf(Block);
                        })
                    })

                    describe("and the connection cannot be added to the database,", () => {

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

                describe("and the channel user id does NOT match the logged in user id,", () => {

                    it("throw Error stating that they do not have permission to connect to this channel.", async () => {
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