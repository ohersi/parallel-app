// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import DeleteUserUsecase from '../../../services/usecases/user/deleteUser.usecase';
import UserException from "../../../utils/exceptions/user.expection";
import { generateItems } from "../../test-utils/generate-items.setup";
import { TYPES_ENUM } from "../../../utils/types/enum";

describe("DeleteUserUsecase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: DeleteUserUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let users: UserRepository;
    let backup: IBackup;
    let userID: number;

    const testUser = {
        first_name: "Delete",
        last_name: "Me",
        email: "delete@me.com",
        password: "password",
        avatar_url: "avatar"
    }

    beforeEach(() => {
        service = new DeleteUserUsecase(mockedUserRepo);
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
        // Create user to delete
        const newUser = new User(
            'first-name',
            testUser.first_name,
            testUser.last_name,
            testUser.email,
            'firstName lastName',
            testUser.password,
            testUser.avatar_url,
            TYPES_ENUM.USER
        );
        const createdUser = await users.save(newUser);
        userID = createdUser.id;
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When deleting a user,', () => {

        describe("and user is found in the db,", () => {

            describe("and the provided user id to be deleted DOES match the logged in user id,", () => {

                describe("and the user cannot be deleted from the database,", () => {

                    it("throw an Error from the db.", async () => {
                        // GIVEN   
                        const id = userID; // id given from controller req params

                        // WHEN
                        const foundUser = await orm.em.findOne(User, id);
                        mockedUserRepo.findByID.mockResolvedValue(foundUser);
                        // repo throws an error
                        mockedUserRepo.delete.mockRejectedValue(Error);

                        // THEN
                        expect(async () => await service.execute(id, userID)).rejects.toThrow(UserException);
                    })
                })

                describe("and the user can be successfully deleted,", () => {

                    it("delete the user.", async () => {
                        // GIVEN   
                        const id = userID; // id given from controller req params

                        // WHEN
                        const foundUser = await orm.em.findOne(User, id);
                        mockedUserRepo.findByID.mockResolvedValue(foundUser);

                        if (foundUser) {
                            // Persist and flush to database
                            const updatedUser = await users.delete(foundUser);
                            // Set mocked result to be deleted user
                            mockedUserRepo.delete.mockResolvedValue(updatedUser);
                        }

                        const results = await service.execute(id, userID);

                        // THEN
                        const returnsNullIfDeleted = await orm.em.findOne(User, id);
                        expect(returnsNullIfDeleted).toEqual(null);
                    })
                })
            })

            describe("and the provided user id to be deleted does NOT match the logged in user id,", () => {

                it("throw Error stating that they do not have permission to delete user.", async () => {
                    // GIVEN   
                    const id = 1; // id given from controller req params 

                    // WHEN
                    const foundUser = await orm.em.findOne(User, id);
                    mockedUserRepo.findByID.mockResolvedValue(foundUser);

                    // THEN
                    expect(async () => await service.execute(id, userID)).rejects.toThrow(UserException);
                })
            })
        })

        describe("and the user does NOT exist in the db,", () => {

            it("throw an Error stating user with that id cannot be found.", async () => {
                // GIVEN
                const id = -99; // id given from controller req params

                // WHEN
                // Check if user exists in db
                const foundUser = await orm.em.findOne(User, id);
                mockedUserRepo.findByID.mockResolvedValue(foundUser);


                // THEN
                expect(foundUser).toEqual(null);
                expect(async () => { await service.execute(id, userID) }).rejects.toThrow(UserException);
            })
        });


    });
});