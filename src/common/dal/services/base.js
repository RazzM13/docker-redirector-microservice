class AbstractBaseService {

  constructor(modelStore, modelClass, modelCollectionClass) {
    const _thisService = this;

    const serviceModelClass = modelClass.extend({
      sync: function(method, model, options) {
        let serviceCall;

        switch (method) {

          case "create":
            serviceCall = _thisService.create(model.attributes, options.params);
            break;

          case "read":
            serviceCall = _thisService.get(model.id, options.params);
            break;

          case "update":
            serviceCall = _thisService.update(model.id, model.attributes, options.params);
            break;

          case "delete":
            serviceCall = _thisService.remove(model.id, model.attributes, options.params);
            break;

          default:
            throw new Error('Invalid method for service call!');

        }

        return serviceCall;
      },
    });

    const serviceModelCollectionClass = modelCollectionClass.extend({
      model: serviceModelClass,

      params: {},

      initialize: function (_, params) {
        if (params) {
          this.params = params;

          if (params.liveUpdate) {
            const _this = this;
            _thisService.modelStore.on('created', () => _this.fetch());
            _thisService.modelStore.on('updated', () => _this.fetch());
            _thisService.modelStore.on('patched', () => _this.fetch());
            _thisService.modelStore.on('removed', () => _this.fetch());
          }
        }
      },

      fetch: function() {
        const _this = this;
        const params = Object.assign({}, this.params, {liveUpdate: false});
        return _thisService.find(params)
        .then((entities) => {
          _this.set(entities.models);
        });
      },
    });

    this.url = serviceModelCollectionClass.prototype.url;
    this.modelStore = modelStore;
    this.modelClass = serviceModelClass;
    this.modelCollectionClass = serviceModelCollectionClass;
  }

  _serialize(data) {
    return data.toJSON();
  }

  _maybeSerialize(data, params) {
    if (params && params.provider !== undefined) {
      return this._serialize(data);
    }
    return data;
  }

  async find(params) {
    const modelStoreQuery = Array.from(await this.modelStore.find(params));
    const modelCollection = new this.modelCollectionClass(modelStoreQuery, params);
    return this._maybeSerialize(modelCollection, params);
  }

  async get(id, params) {
    const data = await this.modelStore.get(id, params);
    const entity = this._makeEntityFromData(data, this.modelClass);
    return this._maybeSerialize(entity, params);
  }

  _makeEntityFromData(data, modelClass = this.modelClass) {
    const entity = new modelClass(data);
    if (!entity.isValid()) {
      throw Error('Invalid data for entity model!');
    }
    return entity;
  }

  async create(data, params) {
    const newEntity = this._makeEntityFromData(data, this.modelClass);
    const newEntitySerialized = this._serialize(newEntity);
    await this.modelStore.create(newEntitySerialized, params);
    return this._maybeSerialize(newEntity, params);
  }

  async update(id, data, params) {
    const newEntity = this._makeEntityFromData(data, this.modelClass);
    const newEntitySerialized = this._serialize(newEntity);
    await this.modelStore.update(id, newEntitySerialized, params);
    return this._maybeSerialize(newEntity, params);
  }

  async patch(id, data, params) {
    throw Error('PATCH service method is not implemented!');
  }

  async remove(id, params) {
    return this._maybeSerialize(this.modelStore.remove(id, params));
  }

  setup(app, path) {}
}

export default AbstractBaseService;
