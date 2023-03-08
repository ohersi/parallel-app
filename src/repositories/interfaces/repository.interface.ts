
export default interface IRepository<T> {

    save(entity: T): Promise<T>; // CREATE
    updateByID(entity: T, id: number) : Promise<T>; // UPDATE
    deleteByID(entity: T, id: number): Promise<T>; // DELETE

    findByID(id: number): Promise<T>; // READ
    search(entity: T, id: number): Promise<T[]>; // READ

}