import BaseService from "./base.js";
import * as Redirection from 'common/dal/models/redirection.js';

class RedirectionService extends BaseService {

  constructor(socket) {
    super(socket, Redirection.RedirectionModel, Redirection.RedirectionCollection);
  }

}

export default RedirectionService;
