// Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
// Imports
import { createTestingModule } from "../create-testing-module";
import { UserModule } from "../test-modules/user.module";
import UserService from "../../services/user.service";
import { User } from "../../entities/user.entity";
import UserDTO from "../../dto/user.dto";
import { Loaded } from "@mikro-orm/core";
import { TYPES } from "../../utils/types";
import UserRepository from "../../repositories/user.repository";

const mockedUserRepo = mockDeep<UserRepository>();

let loadedUser: Loaded<User, never>[];

describe('user-service', () => {

    let sut: UserService;
    let repo: UserRepository;

    beforeEach(() => {
        // Create mocked UserRepository to inject into userService
        const moduleRef = createTestingModule(UserModule);
        moduleRef.bind(TYPES.USER_REPOSITORY).toConstantValue(mockedUserRepo);
        repo = moduleRef.get(TYPES.USER_REPOSITORY);

        // Create new UserService
        sut = new UserService(mockedUserRepo);

        // Reset mock
        mockReset(mockedUserRepo);;
    });

    it("is defined", () => {
        expect(sut).toBeDefined();
        expect(mockedUserRepo).toBeDefined();
    });


    describe("getAll()", () => {
        //** Loaded<User, never>[] return type is causing issues, cant figure out how to mock it */ 
        it("should return all the users and call nested repo.getAll function", async () => {
            // Arrange

            // Act
            //** Call getAll fn * /
            const results = await sut.getAll();

            // Assert
            //** Expect getAll to return Loaded User and repo.getAll fn is called  */
            expect(results).toEqual(loadedUser);
            expect(mockedUserRepo.getAll).toBeCalled();
        });

    });

    describe("findByID()", () => {
        // TODO: Replace Error with UserExpections
        it("should throw error if a user is not found", async () => {
            // Act
            const results = sut.findByID(-999);

            // Assert 
            await expect(results).rejects.toThrow(Error);
            await expect(results).rejects.toThrowError("User not found");
        });

        it("should call nested repo.findByID function", async () => {
            // Arrange
            let userID: number = 1;

            // Act
            try {
                await sut.findByID(userID);
            }
            catch (error) { }

            // Assert
            expect(mockedUserRepo.findByID).toBeCalled();
        })
    });

    describe("create()", () => {
        it("should call nested repo.save function", async () => {
            // Arrange
            const entity = {
                id: 1,
                firstname: 'Test',
                lastname: 'Tester',
                email: 'email@email.com',
                password: 'password',
                profileimg: 'avatar'
            }

            // Act
            try {
                await sut.create(entity);
            }
            catch (error) { }

            // Assert
            expect(mockedUserRepo.save).toBeCalled();
        })
    });


});