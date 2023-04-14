
export default interface IRepository<T> {
    save(entity: T): Promise<T>; // CREATE
    update(entity: T, data: T) : Promise<T>; // UPDATE
    deleteByID(entity: T, id: number): Promise<T>; // DELETE

    findByID(id: number): Promise<T | null>; // READ
    getAll(): Promise<T[]>; // READ
}