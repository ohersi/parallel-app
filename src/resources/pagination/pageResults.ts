/**
 * @openapi
 * components:
 *   schemas:
 *     ChannelPageResults:
 *       type: object
 *       properties:
 *           total:
 *             type: integer
 *             format: int64
 *             example: 4
 *           last_id:
 *              oneOf:
 *                - integer
 *                - string
 *              example: null
 *           data:
 *              type: array
 *              items:
 *                 type: object
 *                 properties:
 *                   channel:
 *                       $ref: '#/components/schemas/Channel'
 *                   blocks:
 *                     example: []
 *                   total_blocks:
 *                       example: 0
 *       xml:
 *         name: channel
*/
export default class PageResults {

    total!: number;
    last_id!: number | string | null | undefined;
    data!: any;

    constructor(total: number, last_id: number | string | null | undefined, data: any) {
        this.total = total;
        this.last_id = last_id;
        this.data = data;
    }
}