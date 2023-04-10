// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import CreateUserUseCase from "../../../services/usecases/user/createUser.usecase";
import { memOrm } from "../../utils/init-db.setup";
import { TYPES_ENUM } from "../../../utils/types/enum";

describe("CreateUserUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: CreateUserUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;

    const testUser = {
        id: 1,
        firstname: "Test",
        lastname: "Testerson",
        email: "email@email.com",
        password: "password",
        profileimg: "avatar",
        role: TYPES_ENUM.USER,
    }
    beforeEach(() => {
        service = new CreateUserUseCase(mockedUserRepo);
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await memOrm;
        users = orm.em.getRepository<User>(User);
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When creating a user,', () => {

        describe("and the user doesnt exist in the db,", () => {

            it("insert user into db.", async () => {
                // GIVEN

                // WHEN
                // Check if user exists in db
                const checkIfEmailExists = await orm.em.findOne(User, { email: testUser.email });
                // If email doesnt exist create user
                if (!checkIfEmailExists) {
                     // Persist and flush to database
                    const createtUser = await users.save(testUser);
                    // Set mocked result to be newly created user
                    mockedUserRepo.save.mockResolvedValue(createtUser);
                }
                else {
                    mockedUserRepo.save.mockRejectedValue(Error);
                }
                const results = await service.execute(testUser);

                // THEN
                const getUser = await orm.em.findOne(User, testUser.id);
                expect(getUser?.email).toEqual(testUser.email);
                //TODO: Return should be a custom dto with jwt
                expect(results).toBe(undefined);
            })
        });  

        describe("and the user already exists,", () => {

            it("return an Error stating the user email already exists.", async () => {
                // GIVEN
                // Pre insert user into db
                const createtUser = await users.save(testUser);

                // WHEN
                // Check if user exists in db
                const returnUserIfEmailExists = await orm.em.findOne(User, { email: testUser.email });

                if (returnUserIfEmailExists) {
                    // Set mocked result to be user found by email
                    mockedUserRepo.findByEmail.mockResolvedValue(createtUser);
                }

                // THEN
                // Expect service to throw error since user email already exists
                 expect(async () => { await service.execute(testUser)}).rejects.toThrow(Error);
            })
        });

    });
});
