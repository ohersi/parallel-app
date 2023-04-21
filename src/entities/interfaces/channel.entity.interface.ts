export default interface IChannel {
    id: number;
    user: number;
    title: string;
    description: string;
    blocks: any;
    date_created: Date;
    date_updated: Date;
} 