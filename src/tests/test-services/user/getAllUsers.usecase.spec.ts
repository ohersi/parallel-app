// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import GetAllUsersUseCase from "../../../services/usecases/user/getAllUsers.usecase";
import UserException from "../../../utils/exceptions/user.expection";
import { TYPES_ENUM } from "../../../utils/types/enum";

describe("GetAllUsersUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: GetAllUsersUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;

    const User1 = new User(
        "User1",
        "One",
        "one@email.com",
        "password",
        "avatar",
        TYPES_ENUM.USER
    )

    const User2 = new User(
        "User2",
        "Two",
        "two@email.com",
        "password",
        "avatar",
        TYPES_ENUM.USER
    )

    beforeEach(() => {
        service = new GetAllUsersUseCase(mockedUserRepo);
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await memOrm;
        users = orm.em.getRepository<User>(User);

        // Create users & persist and flush to database
        await orm.em.persistAndFlush([
            users.create(User1),
            users.create(User2)
        ]);
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When getting all users,', () => {

        describe("and users do exist in the db,", () => {

            it("return all users in db.", async () => {
                // GIVEN

                // WHEN
                //** Instead of mocking results, FAKE the database using in-mem db to actually simulate the prod db call  */
                const getAllUsers = await orm.em.find(User, {});
                mockedUserRepo.getAll.mockResolvedValue(getAllUsers);

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

        describe("and no users are found in the db,", () => {

            it("return empty array.", async () => {
                // GIVEN

                // WHEN
                //TODO: Research deleting table rows
                const getAllUsers = await orm.em.find(User, -999);
                mockedUserRepo.getAll.mockResolvedValue(getAllUsers);

                const results = await service.execute();

                // THEN
                expect(results).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN

                // WHEN
                mockedUserRepo.getAll.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute() }).rejects.toThrow(UserException);
            })
        })

    })
});