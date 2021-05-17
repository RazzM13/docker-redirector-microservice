import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';

import AbstractBaseService from "common/dal/services/base.js";

class BaseService extends AbstractBaseService {

  constructor(socket, modelClass, modelCollectionClass) {
    const client = feathers();
    client.configure(socketio(socket));
    const modelStore = client.service(modelCollectionClass.prototype.url);
    super(modelStore, modelClass, modelCollectionClass);
  }

}

export default BaseService;
