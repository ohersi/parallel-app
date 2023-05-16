// Packages
import { Entity, Loaded } from '@mikro-orm/core';
import { injectable } from 'inversify';
// Imports
import { Connection } from '@/entities/connection.entity';
import IRepository from '@/repositories/interfaces/repository.interface';
import BaseRepository from '@/repositories/base.repository';

@injectable()
@Entity({ customRepository: () => Connection })
export default class ConnectionRepository extends BaseRepository<Connection> implements IRepository<Connection>  {


    async deleteAll(entities: Connection[]): Promise<any> {
        try {
            entities.forEach(async (connection: Connection) => {
                await this.removeAndFlush(connection);
            });
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async findByBlockAndChannelID(block_id: number, channel_id: number): Promise<Loaded<Connection, never> | null> {
        try {
            const res = await this.findOne({ block: block_id, connected_channel: channel_id });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    };

    async findAllByBlockID(id: number): Promise<Loaded<Connection, never>[]> {
        try {
            const res = this.find({ block: id });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }

    async findAllByChannelID(id: number): Promise<Loaded<Connection, never>[]> {
        try {
            const res = this.find({ connected_channel: id });
            return res;
        }
        catch (error: any) {
            throw new Error(error);
        }
    }
}