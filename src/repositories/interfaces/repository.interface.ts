
export default interface IRepository<T> {

    create(entity: T): Promise<T>; // CREATE
    updateByID(id: number, entity: T) : Promise<T>; // UPDATE
    deleteByID(id: number): Promise<T>; // DELETE

    findByID(id: number): Promise<T>; // READ
    findAll(entity: T): Promise<T[]>; // READ

}