import backbone from 'backbone';
const { Model, Collection } = backbone;

import * as sha256 from '@stablelib/sha256/lib/sha256.js';
import * as base64 from '@stablelib/base64/lib/base64.js';
import * as utf8 from '@stablelib/utf8/lib/utf8.js';

export const RedirectionModel = Model.extend ({
  idAttribute: "shortUrl",

  defaults: () => ({
    shortUrl: null,
    longUrl: null
  }),

  isNew: function () {
    return this._isNew
  },

  preinitialize: function (attributes, options) {
    this._isNew = options && !!options.isNew;

    if  (attributes && !attributes.shortUrl && attributes.longUrl) {
      attributes.shortUrl = this.generateShortUrl(attributes.longUrl);
      this._isNew = true;
    }

    // console.log('preinit', attributes, options, this._isNew);
  },

  initialize: function (attributes, options) {
    if (options && options.collection) {
      this.url = this.url();
    }
  },

  generateShortUrl: (longUrl, length = 7) => {
    const longUrlHashEncoded = base64.encodeURLSafe(sha256.hash(utf8.encode(longUrl)));
    return longUrlHashEncoded.substring(0, length);
  }
});

export const RedirectionCollection = Collection.extend({
  model: RedirectionModel,
  name: 'redirections',
  url: '/redirections',

  createOrUpdate: function(attributes, options) {
    let entity = new this.model(attributes, options);
    return entity.save();
  }
});
