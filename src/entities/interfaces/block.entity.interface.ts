/**
 * @openapi
 * components:
 *   schemas:
 *     Block:
 *       type: object
 *       properties:
 *           id:
 *             type: integer
 *             format: int64
 *             example: 2
 *           unique_id:
 *             type: string
 *             example: abc123
 *           user:
 *             type: integer
 *             format: int64
 *             example: 7
 *           channels:
 *             type: array
 *             items:
 *               type: object
 *             example: []
 *           title:
 *             type: string
 *             example: Test Block 1
 *           description:
 *             type: string
 *             example: example description
 *           source_url:
 *             type: string
 *             example: source.com
 *           image_url:
 *             type: string
 *             example: image.jpg
 *           date_created:
 *             type: string
 *             format: date
 *             example: "2020-01-01T17:00:00.000Z"
 *           date_updated:
 *             type: string
 *             format: date
 *             example: "2020-01-01T17:00:00.000Z"
 *       xml:
 *         name: block
*/
export default interface IBlock {
    id: number;
    unqiue_id?: string;
    user: number;
    title: string;
    channels: any;
    description: string;
    source_url: string;
    image_url: string;
    date_created: Date;
    date_updated: Date;
}