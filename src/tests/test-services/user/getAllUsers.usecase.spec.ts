// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import GetAllUsersUseCase from "../../../services/usecases/user/getAllUsers.usecase";
import { memOrm } from "../../utils/init-db.setup";

describe("GetAllUsersUseCase", () => {

    let getAllUserUseCase: GetAllUsersUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;

    const usersArray = [
        {
            id: 1,
            firstname: "User1",
            lastname: "One",
            email: "one@email.com",
            password: "password",
            profileimg: "avatar",
        },
        {
            id: 2,
            firstname: "User2",
            lastname: "Two",
            email: "two@email.com",
            password: "password",
            profileimg: "avatar",
        },
    ]

    it("should be defined", () => {
        // expect(getAllUserUseCase).toBeDefined();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await memOrm;
        users = orm.em.getRepository<User>(User);

        // Create users & persist and flush to database
        await orm.em.persistAndFlush([
            users.create(usersArray[0]),
            users.create(usersArray[1])
        ]);
    });

    afterAll(async () => {
        await orm.close();
    })

    describe('When getting all users,', () => {

        describe("and users do exist in the db,", () => {

            it("return all users in db.", async () => {
                // GIVEN

                // WHEN
                const getAllUsers = await orm.em.find(User, {});
                // THEN

                // expect(getAllUsers).toEqual(usersArray);
            })
        })

        describe("and no users are found in the db,", () => {

            it("return empty array.", async () => {
                // GIVEN

                // WHEN
                //TODO: Research deleting table rows
                const getAllUsers = await orm.em.find(User, -999);
                // THEN

                expect(getAllUsers).toEqual([]);
            })
        })

    })
});