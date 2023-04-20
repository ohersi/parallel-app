export default interface IBlock {
    id: number;
    user: number;
    title: string;
    description: string;
    source_url: string;
    image_url: string;
    date_created: Date;
    date_updated: Date;
}