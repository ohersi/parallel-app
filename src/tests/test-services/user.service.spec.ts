// Packages
import { mockDeep } from "jest-mock-extended";
import { mockClear } from "jest-mock-extended/lib/Mock";
// Imports
import { createTestingModule } from "../create-testing-module";
import { UserModule } from "../test-modules/user.module";
import UserService from "../../services/user.service";
import { User } from "../../entities/user.entity";

const mockedUserService = mockDeep<UserService>();

describe('user-service', () => {

    let sut: UserService;

    beforeEach(() => {
        const moduleRef = createTestingModule(UserModule);
        // Rebind to mock UserService- currently bound to UserRepository
        moduleRef.bind(UserService).toConstantValue(mockedUserService);
        // Retrieve new UserService
        sut = moduleRef.get(UserService);
        // Clear mocked UserService
        mockClear(mockedUserService);
    });

    test("is defined", () => {
        expect(mockedUserService).toBeDefined();
    });


    describe("getAll()", () => {
        test("get all users", async () => {
            const entity = {
                id: 1,
                firstname: 'Test',
                lastname: 'Tester',
                email: 'email@email.com',
                password: 'password',
                profileimg: 'avatar'
            };

            const testUser = new User();
            testUser.id = 1;
            testUser.firstname = 'Test';
            testUser.lastname = 'Tester';
            testUser.email = 'email@email.com';
            testUser.password = 'password';
            testUser.profileimg = 'avatar';


            mockedUserService.getAll.mockResolvedValue(entity);

            const userItem = await sut.getAll();

            expect(userItem).toEqual(testUser);
        });
    })


});