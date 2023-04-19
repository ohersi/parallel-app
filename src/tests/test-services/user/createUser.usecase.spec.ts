// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import CreateUserUseCase from "../../../services/usecases/user/createUser.usecase";
import { generateItems } from "../../test-utils/generate-items.setup";
import { TYPES_ENUM } from "../../../utils/types/enum";

describe("CreateUserUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: CreateUserUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;

    const testUser = {
        id: 1,
        first_name: "Test",
        last_name: "Testerson",
        email: "email@email.com",
        password: "password",
        avatar_url: "avatar"
    }

    beforeEach(() => {
        service = new CreateUserUseCase(mockedUserRepo);
        // Restore im-mem db to original state
        mockReset(mockedUserRepo);
        cleanUpMetadata()
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
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
                // Check if user already exists in db
                const checkIfEmailExists = await orm.em.findOne(User, { email: testUser.email });
                // If email doesnt exist create user
                if (!checkIfEmailExists) {
                    const newUser = new User(
                        testUser.first_name,
                        testUser.last_name,
                        testUser.email,
                        testUser.password,
                        testUser.avatar_url,
                        TYPES_ENUM.USER
                    );
                    // Persist and flush to database
                    const createdUser = await users.save(newUser);
                    // Set mocked result to be newly created user
                    mockedUserRepo.save.mockResolvedValue(createdUser);
                }
                else {
                    mockedUserRepo.save.mockRejectedValue(Error);
                }
                const results = await service.execute(testUser);

                // THEN
                const getUser = await orm.em.findOne(User, { email: testUser.email });
                expect(getUser?.email).toEqual(testUser.email);
                expect(typeof results).toBe("string");
            })
        });

        describe("and the user already exists,", () => {

            it("return an Error stating the user email already exists.", async () => {
                // GIVEN

                // WHEN
                // Check if user exists in db
                const returnUserIfEmailExists = await orm.em.findOne(User, { email: testUser.email });

                if (returnUserIfEmailExists) {
                    // Set mocked result to be user found by email
                    mockedUserRepo.findByEmail.mockResolvedValue(returnUserIfEmailExists);
                }

                // THEN
                // Expect service to throw error since user email already exists
                expect(async () => { await service.execute(testUser) }).rejects.toThrow(Error);
            })
        });

    });
});
