// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
// Imports
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import CreateUserUseCase from "../../../services/usecases/user/createUser.usecase";
import { memOrm } from "../../utils/init-db.setup";

describe("CreateUserUseCase", () => {

    let createUserUseCase: CreateUserUseCase;
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
        // expect(createUserUseCase).toBeDefined();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await memOrm;
        users = orm.em.getRepository<User>(User);
        // 
    });

    afterAll(async () => {
        await orm.close();
    })

    describe('When creating a user,', () => {

        describe("and the user doesnt exist in the db,", () => {

            it("insert user into db.", async () => {
                // GIVEN

                // WHEN
                // Create user
                const creatUser = users.create(testUser);
                // Persist and flush to database
                await orm.em.persistAndFlush(creatUser);

                // THEN
                const getUser = await orm.em.findOne(User, 1);
                expect(getUser).toEqual(testUser);
            })
        })



        // describe("and the user already exists", () => {

        //     it("should prevent the user from being created and return user already exists?", () => {

        //     })
        // })


        // it("should __ if user info is not ___", () => {

        // })
    })
});
