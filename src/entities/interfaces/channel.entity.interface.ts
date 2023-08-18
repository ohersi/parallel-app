export default interface IChannel {
    id: number;
    user: number;
    title: string;
    description: string;
    slug: string;
    blocks: any;
    follower_count: number;
    date_created: Date;
    date_updated: Date;
} 