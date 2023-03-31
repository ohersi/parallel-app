// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import GetUserByIdUseCase from '../../../services/usecases/user/getUserById.usecase'
import { memOrm } from "../../utils/init-db.setup";

describe("GetUserByIdUseCase", () => {

    let getUserByIdUseCase: GetUserByIdUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;

    const testUser = {
        id: 1,
        firstname: "Test",
        lastname: "Testerson",
        email: "email@email.com",
        password: "password",
        profileimg: "avatar",
    }


    it("should be defined", () => {
        // expect(getUserByIdUseCase).toBeDefined();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await memOrm;
        // Select repo
        users = orm.em.getRepository<User>(User);

        // Insert test user into in-mem db
        // Create user
        const creatUser = users.create(testUser);
        // Persist and flush to database
        await orm.em.persistAndFlush(creatUser);
    });

    afterAll(async () => {
        await orm.close();
    })

    describe('When given a user id,', () => {

        describe('and the user does exist in the db', () => {

            it("return a user object from database.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const getUser = await orm.em.findOne(User, id);

                // THEN
                expect(getUser).toEqual(testUser);
            })
        })

        describe('and the user does NOT exist in the db', () => {

            it("return null.", async () => {
                // GIVEN
                const id = -999;

                // WHEN
                const getUser = await orm.em.findOne(User, id);

                // THEN
                expect(getUser).toEqual(null);
            })
        })
    })
});
