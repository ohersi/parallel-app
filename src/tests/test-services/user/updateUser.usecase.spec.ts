// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import UserDTO from "../../../dto/user.dto";
import UserRepository from "../../../repositories/user.repository";
import UpdateUserUsecase from '../../../services/usecases/user/updateUser.usecase'
import UserException from "../../../utils/exceptions/user.expection";
import { generateItems } from "../../test-utils/generate-items.setup";

describe("UpdateUserUsecase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: UpdateUserUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;
    let backup: IBackup;

    const testUser = {
        id: 1,
        first_name: "Test",
        last_name: "Testerson",
        email: "1email@email.com",
        password: "password",
        avatar_url: "avatar"
    }

    beforeEach(() => {
        service = new UpdateUserUsecase(mockedUserRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        users = orm.em.getRepository<User>(User);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When updating a user,', () => {

        describe("and user email is found in the db,", () => {

            describe("and the user is successfully updated,", () => {

                it("return a UserDTO.", async () => {
                    // GIVEN   
                    const user = testUser as UserDTO;
                    // WHEN
                    const foundUser = await orm.em.findOne(User, { email: testUser.email });
                    mockedUserRepo.findByEmail.mockResolvedValue(foundUser);

                    if (foundUser) {
                        // Persist and flush to database
                        const updatedUser = await users.update(foundUser, user);
                        // Set mocked result to be updated user
                        mockedUserRepo.update.mockResolvedValue(updatedUser);
                    }

                    const results = await service.execute(user);

                    // THEN
                    expect(results).toBeInstanceOf(UserDTO);
                })
            })

            describe("and the user cannot be updated to the database,", () => {

                it("throw an Error from the db.", async () => {
                    // GIVEN   
                    const user = testUser as UserDTO;

                    // WHEN
                    const foundUser = await orm.em.findOne(User, { email: testUser.email });
                    mockedUserRepo.findByEmail.mockResolvedValue(foundUser);
                    // repo throws an error
                    mockedUserRepo.update.mockRejectedValue(Error);

                    // THEN
                    expect(async () => await service.execute(user)).rejects.toThrow(UserException);
                })
            })
        })

        describe("and the user email is NOT found in the db,", () => {

            it("throw an Error stating email cannot be found.", async () => {
                // GIVEN
                const fakeEmail = "13o1n231on3@email.com"

                // WHEN
                // Check if user exists in db
                const foundUser = await orm.em.findOne(User, { email: fakeEmail });
                mockedUserRepo.findByEmail.mockResolvedValue(foundUser);


                // THEN
                expect(foundUser).toEqual(null);
                expect(async () => { await service.execute(testUser) }).rejects.toThrow(UserException);
            })
        });


    });
});
