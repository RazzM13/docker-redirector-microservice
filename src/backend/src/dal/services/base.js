import { Service as MongoService } from 'feathers-mongodb';
import errors from "@feathersjs/errors";

import AbstractBaseService from "common/dal/services/base.js";

class PersistenceService extends MongoService {

  constructor(config, externalIDAttribute, internalIDAttribute = '_id') {
    super(config);
    this.externalIDAttribute = externalIDAttribute;
    this.internalIDAttribute = internalIDAttribute;
  }

  _addInternalID(data) {
    const _data = Object.assign({}, data);
    _data[this.internalIDAttribute] = _data[this.externalIDAttribute];
    return _data;
  }

  _removeInternalID (data) {
    const _data = Object.assign({}, data);
    delete _data[this.internalIDAttribute];
    return _data;
  }

  _ensureIDCoherency (internalID, data) {
    if (data[this.externalIDAttribute] && data[this.externalIDAttribute] !== internalID) {
      throw new errors.BadRequest('Mismatch between entity ID and request ID!');
    }
  }

  async find (params) {
    const _this = this;
    return super.find(params).then(
        function* (entities) {
          for (const entity of entities) {
            yield _this._removeInternalID(entity);
          }
        }
    )
  }

  async create (data, params) {
    return super.create(this._addInternalID(data), params)
    .catch(() => {
      throw new errors.Conflict('Violation of unique ID constraint!');
    });
  }

  async get(id, params) {
    return this._removeInternalID(await super.get(id, params));
  }

  async update(id, data, params) {
    this._ensureIDCoherency(id, data);
    return this._removeInternalID(await super.update(id, data, params));
  }

  async patch(id, data, params) {
    this._ensureIDCoherency(id, data);
    return this._removeInternalID(await super.patch(id, data, params));
  }

}

class BaseService extends AbstractBaseService {

  /**
   * Creates a new DAO service for the Redirection model.
   * @param {Db|MongoClient.db} db
   * @param modelClass
   * @param modelCollectionClass
   */
  constructor(db, modelClass, modelCollectionClass) {
    const modelStore = new PersistenceService({
      Model: db.collection(modelCollectionClass.prototype.name)
    }, modelClass.prototype.idAttribute);
    super(modelStore, modelClass, modelCollectionClass);
  }

}

export default BaseService;
