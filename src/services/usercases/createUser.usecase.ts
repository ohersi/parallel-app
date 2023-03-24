//** TESTING */
//** GIVEN; the state of the world before the test aka Setup/Arramge */
//** WHEN I exercise the behavior under test aka Excerise/Act */
//** THEN we expect the following changes aka Verify/Assert */


// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../repositories/user.repository"
import UserDTO from "../../dto/user.dto";
import { TYPES } from "../../utils/types";


//** USE CASE */
// GIVEN user object has has all fields
// WHEN creating a new user
// THEN user is created

@provide(TYPES.CREATE_USER_USECASE)
export default class createUserUseCase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }


    // TODO: Create UserExpection
    //TODO: Return JWT Token instead of DTO
    public execute = async (body: any): Promise<Boolean> => {
        try {
            // const createUser = await this.userRepository.save(body);
            // await this.userRepository.persistAndFlush(createUser);
            //TODO: Return custom response with JTWT inside of trues
            return true;
        }
        catch (error) {
            throw new Error("Error with creating user entity in database");
        }
    }
}