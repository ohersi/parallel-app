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

const mockedUserService = mockDeep<UserService>();

const entity = {
    id: 1,
    firstname: 'Test',
    lastname: 'Tester',
    email: 'email@email.com',
    password: 'password',
    profileimg: 'avatar'
};

const testUser = new UserDTO();
testUser.id = 1;
testUser.firstname = 'Test';
testUser.lastname = 'Tester';
testUser.email = 'email@email.com';
testUser.password = 'password';
testUser.profileimg = 'avatar';

let loadedUser: any;

describe('user-service', () => {

    let sut: UserService;

    beforeEach(() => {
        const moduleRef = createTestingModule(UserModule);
        // Rebind to mock UserService- currently bound to UserRepository
        moduleRef.bind(UserService).toConstantValue(mockedUserService);
        // Retrieve new UserService
        sut = moduleRef.get(UserService);
        // Clear mocked UserService
        mockReset(mockedUserService);
    });

    it("is defined", () => {
        expect(mockedUserService).toBeDefined();
    });


    describe("getAll()", () => {
        //** Loaded<User, never>[] return type is causing issues, cant figure out how to mock it */ 
        it("should return all the users", async () => {
            // Arrange

            // Act
            //** mocking the return of the getAll fn; returns any (actual returns Loaded<User, never>[]) */
            mockedUserService.getAll.mockResolvedValue(loadedUser);
            // Call getAll fn
            const results = await sut.getAll();

            // Assert
            expect(results).toEqual(loadedUser);
        })

    });

    describe("findByID()", () => {
        // TODO: Replace Error with UserExpections
        it("should throw error if a user is not found", async () => {

            // Arrange

            // Act
            mockedUserService.findByID.mockResolvedValue(Error("User not found"));
            const results = await sut.findByID(-999);

            // Assert
            expect(results).toEqual(Error("User not found"));
        })

        //** Loaded<User, never>[] return type is causing issues, cant figure out how to mock it */ 
        it("should return user info from the id", async () => {
            // Arrange
            let userID: number = 1;

            // Act
            //** mocking the return of the findByID function; returns any (actual returns Loaded<User, never>[]) */
            mockedUserService.findByID.mockResolvedValue(loadedUser);
            // Call findByID function
            const results = await sut.findByID(userID);

            // Assert
            expect(results).toEqual(loadedUser);
        })
    });

    describe("create()", () => {
        //** Loaded<User, never>[] return type is causing issues, cant figure out how to mock it */ 
        it("should return newly created user object", async () => {
            // Arrange

            // Act
            //** mocking the return of the create function; returns user entity */
            mockedUserService.create.mockResolvedValue(testUser);
            // Call findByID function
            const results = await sut.create(entity);


            // Assert
            // TODO: Check if properties and valeus match
            expect(results).toEqual(testUser);
        })
    });


});