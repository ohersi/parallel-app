// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import LogInUserUseCase from "../../../services/usecases/user/loginUser.usecase";
import UserDTO from "../../../dto/user.dto";
import UserException from "../../../utils/exceptions/user.expection";
import { memOrm } from "../../test-utils/init-db.setup";
import * as encryption from "../../../resources/security/encryption";
import { TYPES_ENUM } from "../../../utils/types/enum";

describe("LoginUserUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: LogInUserUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let userRepo: UserRepository;

    const testUser = new User(
        "Test",
        "Testerson",
        "email@email.com",
        "password",
        "avatar",
        TYPES_ENUM.USER
    )

    beforeEach(() => {
        service = new LogInUserUseCase(mockedUserRepo);
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await memOrm;
        userRepo = orm.em.getRepository<User>(User);

        // Insert test user into in-mem db
        await userRepo.save(testUser);
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When logging in a user,', () => {

        describe("and the user email exists in the db,", () => {

            describe("and the given password matches stored password,", () => {

                it("return a UserDTO.", async () => {
                    // GIVEN

                    // WHEN
                    // Check if user exists in db
                    const foundUser = await orm.em.findOne(User, { email: testUser.email });

                    if (foundUser) {
                        // set mock return of found user
                        mockedUserRepo.findByEmail.mockResolvedValue(foundUser);
                        // set mock return of matched passwords
                        jest.spyOn(encryption, 'decrypt').mockResolvedValue(true);
                    }

                    const results = await service.execute(testUser);

                    // THEN
                    expect(results).toBeInstanceOf(UserDTO);
                })
            })


            describe("and the given password does NOT match the stored password,", () => {

                it("return false.", async () => {
                    // GIVEN

                    // WHEN
                    // Check if user exists in db
                    const foundUser = await orm.em.findOne(User, { email: testUser.email });
                    // set mock return of found user
                    mockedUserRepo.findByEmail.mockResolvedValue(foundUser);
                    // Set mocked return of not matched passwords
                    jest.spyOn(encryption, 'decrypt').mockResolvedValue(false);

                    const results = await service.execute(testUser);

                    // THEN
                    expect(results).toEqual(false);
                })
            })
        });

        describe("and the user email doesn't exists in db,", () => {

            it("return false.", async () => {
                // GIVEN

                // WHEN
                mockedUserRepo.findByEmail.mockResolvedValue(null);

                const results = await service.execute(testUser);

                // THEN
                expect(results).toEqual(false);
            })
        });

        describe("and the repo throws an error when trying to find a user by email,", () => {

            it("return an Error stating something went wrong with the database.", async () => {
                // GIVEN

                // WHEN
                mockedUserRepo.findByEmail.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(testUser) }).rejects.toThrow(UserException);
            })
        })

    });
});