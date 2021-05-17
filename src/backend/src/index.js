import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import cors from 'cors';
import morgan from 'morgan';
import mongodb from 'mongodb';

import RedirectionService from './dal/services/redirection.js';
import RedirectionHandler from "./handlers/redirection.js";
import SwaggerHandler from "./handlers/swagger.js";


const mongoClient = new mongodb.MongoClient('mongodb://test:test@backend-database');
mongoClient.connect()
.then(() => {

    const app = express(feathers());

    app.use(morgan('dev'));
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.configure(express.rest());
    app.configure(socketio());

    const redirectionService = new RedirectionService(mongoClient.db());
    app.use(redirectionService.url, redirectionService);
    app.get('/r/:id?', RedirectionHandler(redirectionService.url));

    app.use('/docs', SwaggerHandler());

    app.use(express.errorHandler());

    app.on('connection', connection =>
      app.channel('public').join(connection)
    );
    app.publish( () => app.channel('public') );

    app.listen(8000, () => {
        console.log('Started HTTP server!');
    });

})
.catch((err) => {
    console.error('Unable to connect to DB!', err);
    return mongoClient.close();
});
