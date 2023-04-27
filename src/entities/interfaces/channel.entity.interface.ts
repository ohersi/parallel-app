export default interface IChannel {
    id: number;
    user: number;
    title: string;
    description: string;
    slug: string;
    blocks: any;
    date_created: Date;
    date_updated: Date;
} 