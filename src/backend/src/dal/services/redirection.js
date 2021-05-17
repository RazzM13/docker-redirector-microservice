import errors from "@feathersjs/errors";

import BaseService from "./base.js";
import * as Redirection from 'common/dal/models/redirection.js';

/**
 * DAO for the Redirection data model
 * @extends BaseService
 */
class RedirectionService extends BaseService {

    constructor(db) {
        super(db, Redirection.RedirectionModel, Redirection.RedirectionCollection);
    }

    /**
     * Returns whether there are other entities that have the same longUrl
     * @private
     * @param entity
     * @returns {Promise<boolean>}
     */
    async _hasTwins(entity) {
        // ensure there are no existing entries with the same longUrl
        const entityTwins = await this.find({
            query: {
                shortUrl: {
                    $ne: entity.get('shortUrl')
                },
                longUrl: entity.get('longUrl')
            }
        });
        return !!entityTwins.length;
    }

    /**
     * Ensures that current operation does not result in duplicate entities
     * @private
     * @param data
     * @param id
     * @returns {Promise<void>}
     */
    async _preventTwins(data, id = null) {
        const entity = this._makeEntityFromData(data);
        if (id) {
            entity.set('id', id);
        }
        if (await this._hasTwins(entity)) {
            throw new errors.Conflict('Unable to register redirection due to prior registration!');
        }
    }

    /**
     * @swagger
     *
     * /redirections/:
     *    get:
     *        summary: 'Returns all registered redirections.'
     *        responses:
     *            302:
     *                description: 'Redirection to target URL.'
     *            400:
     *                description: 'Unable to redirect due to missing parameters.'
     *            404:
     *                description: 'Requested redirection has not been registered.'
     *        tags:
     *            - admin
     */
    async find(params) {
        return super.find(params);
    }

    /**
     * @swagger
     *
     * /redirections/:
     *    post:
     *        summary: 'Registers a redirection to the target URL for the specified short URL.'
     *        parameters:
     *            - $ref: '#/parameters/RegistrationPayloadParam'
     *        responses:
     *            201:
     *                description: 'Redirection successfully registered.'
     *            400:
     *                description: 'Unable to register redirection due to missing parameters.'
     *            409:
     *                description: 'Unable to register redirection due to prior registration.'
     *        tags:
     *            - admin
     */
    async create(data, params) {
        await this._preventTwins(data);
        return super.create(data, params);
    }

    /**
     * @swagger
     *
     * /redirections/{shortUrl}:
     *    get:
     *        summary: 'Returns the specified redirection based on the short URL parameter.'
     *        parameters:
     *            - $ref: '#/parameters/ShortUrlPathParam'
     *        responses:
     *            200:
     *                description: 'Redirection to target URL.'
     *            400:
     *                description: 'Unable to redirect due to missing parameters.'
     *            404:
     *                description: 'Requested redirection has not been registered.'
     *        tags:
     *            - admin
     */
    async get(id, params) {
        return super.get(id, params);
    }

    /**
     * @swagger
     *
     * /redirections/{shortUrl}:
     *    put:
     *        summary: 'Updates the target URL for the specified redirection short URL.'
     *        parameters:
     *            - $ref: '#/parameters/ShortUrlPathParam'
     *            - $ref: '#/parameters/RegistrationPayloadParam'
     *        responses:
     *            200:
     *                description: 'Redirection successfully updated.'
     *            400:
     *                description: 'Unable to update redirection due to missing parameters.'
     *            404:
     *                description: 'Unable to update non-existent redirection.'
     *            409:
     *                description: 'Unable to update redirection due to prior registration.'
     *        tags:
     *            - admin
     */
    async update(id, data, params) {
        await this._preventTwins(data, id);
        return super.update(id, data, params);
    }

    /**
     * @swagger
     *
     * /redirections/{shortUrl}:
     *    delete:
     *        summary: 'Removes redirection for the specified short URL.'
     *        parameters:
     *            - $ref: '#/parameters/ShortUrlPathParam'
     *        responses:
     *            200:
     *                description: 'OK'
     *            400:
     *                description: 'Unable to delete redirection due to missing parameters.'
     *            404:
     *                description: 'Unable to delete non-existent redirection.'
     *        tags:
     *            - admin
     */
    async remove(id, params) {
        return super.remove(id, params);
    }

}

export default RedirectionService;
