// Packages
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
// Imports
import UserRepository from "../../../repositories/user.repository";
import UserException from "../../../utils/exceptions/user.expection";
import { TYPES } from "../../../utils/types";

//** USE CASE */
// GIVEN: a user id
// WHEN: ind channel in db by id
// THEN: delete

@provide(TYPES.DELETE_USER_USECASE)
export default class DeleteUserUsecase {

    private userRepository: UserRepository;

    constructor(@inject(TYPES.USER_REPOSITORY) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public execute = async (id: number, userID: number): Promise<any> => {
        try {
            // Find user
            const foundUser = await this.userRepository.findByID(id);
            if (!foundUser) {
                throw new UserException('No user with that id found.');
            }
            if (foundUser.id !== userID) {
                throw new UserException('Insufficent access: User logged in does not match the user being deleted.');
            }
            // Delete user
            const res = await this.userRepository.delete(foundUser);
            return res;
        }
        catch (err: any) {
            throw new UserException(err.message);
        }
    }
}