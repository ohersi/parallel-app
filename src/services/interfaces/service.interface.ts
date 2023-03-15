export default interface IService {
    getAll(): Promise<any>;
    findByID(id: number): Promise<any>;
    create(body: any): Promise<any>;
}