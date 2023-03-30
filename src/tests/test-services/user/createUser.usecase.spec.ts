import CreateUserUseCase from "../../../services/usecases/user/createUser.usecase";

describe("createUserUseCase", () => {

    let useCase: CreateUserUseCase;

    it("should be defined", () => {
        expect(CreateUserUseCase).toBeDefined();
    })

    //TODO: Create a in-memory database to write tests on?

    // describe('When creating a user', () => {

    //     const testUser = {
    //         id: 1,
    //         firstname: "Test",
    //         lastnanme: "Testerson",
    //         email: "email@email.com",
    //         password: "password",
    //         profileimg: "avatar",
    //     }

    //     beforeEach(() => {
    //         // Setup service layer mock?
    //     })

    //     it("should ______", () => {

    //     })

    //     describe("and the user already exists", () => {

    //         it("should prevent the user from being created and return user already exists?", () => {

    //         })
    //     })


    //     it("should __ if user info is not ___", () => {

    //     })
    // })
});
