
export default interface IUserService {
    getAllUsers(): Promise<any>;
    getUserByID(id: number): Promise<any>;
    newUser(body: any): Promise<any>;
}