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
import { generateItems } from "../../test-utils/generate-items.setup";
import * as encryption from "../../../resources/security/encryption";

describe("LoginUserUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: LogInUserUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;

    let testLogin = {
        email: "",
        password: ""
    };

    beforeEach(() => {
        service = new LogInUserUseCase(mockedUserRepo);
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await generateItems();

        // Setup test user login info
        const testUser = await orm.em.findOne(User, 1);
        if (testUser) {
            testLogin = {
                email: testUser.email,
                password: testUser.password
            }
        }
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
                    const foundUser = await orm.em.findOne(User, { email: testLogin.email });

                    if (foundUser) {
                        // set mock return of found user
                        mockedUserRepo.findByEmail.mockResolvedValue(foundUser);
                        // set mock return of matched passwords
                        jest.spyOn(encryption, 'decrypt').mockResolvedValue(true);
                    }

                    const results = await service.execute(testLogin);

                    // THEN
                    expect(results).toBeInstanceOf(UserDTO);
                })
            })


            describe("and the given password does NOT match the stored password,", () => {

                it("throw an Error stating email or password does not match.", async () => {
                    // GIVEN

                    // WHEN
                    // Check if user exists in db
                    const foundUser = await orm.em.findOne(User, { email: testLogin.email });
                    // set mock return of found user
                    mockedUserRepo.findByEmail.mockResolvedValue(foundUser);
                    // Set mocked return of not matched passwords
                    jest.spyOn(encryption, 'decrypt').mockResolvedValue(false);

                    // THEN
                    expect(async () => { await service.execute(testLogin) }).rejects.toThrow(UserException);
                })
            })
        });

        describe("and the user email doesn't exists in db,", () => {

            it("throw an Error stating email or password does not match.", async () => {
                // GIVEN

                // WHEN
                mockedUserRepo.findByEmail.mockResolvedValue(null);

                // THEN
                expect(async () => { await service.execute(testLogin) }).rejects.toThrow(UserException);
            })
        });

        describe("and the repo throws an error when trying to find a user by email,", () => {

            it("throw an Error stating something went wrong with the database.", async () => {
                // GIVEN

                // WHEN
                mockedUserRepo.findByEmail.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(testLogin) }).rejects.toThrow(UserException);
            })
        })

    });
});