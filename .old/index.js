const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const MongoClient = require('mongodb').MongoClient;

const handler = async (req, res) => {
    const app = req.app;
    const dbc = app.db.collection('url_registry');

    const redirectID = req.params.id;
    const redirectURL = req.query.url;

    // early-exit if minimum requirements are not satisfied
    if (!redirectID) {
        res.statusCode = 400;
        res.body = {
            'error': 'Redirection ID not specified!'
        };
        return res.send();
    }

    // acquire prior registration and update context
    const entryCriteria = {'id': redirectID};
    const entryTwinsCriteria = {'$and': [
            {'id': {'$ne': redirectID}},
            {'url': redirectURL}
    ]};
    const entry = await dbc.findOne(entryCriteria);
    const registrationMayResultInDuplication = !!(await dbc.count(entryTwinsCriteria));

    // process the specific request
    switch (req.method) {
        case 'GET':

            // early-exit if a redirection has NOT already been registered for this short-url
            if (!entry) {
                res.statusCode = 404;
                res.body = {
                    'error': 'No redirection registered for the specified ID!'
                };
                break;
            }

            // define redirection context
            res.set('Location', entry['url']);
            res.set('Referrer-Policy', 'no-referrer');
            res.statusCode = 302;

            // notify analytics
            const analyticsReq = http.request({
              hostname: 'analytics',
              port: 8080,
              path: '/api/event',
              method: 'POST',
              headers: {
                  'user-agent': req.headers["user-agent"]
              }
            }, (r) => {
                console.debug('Analytics response:', r.statusCode);
            });
            analyticsReq.write(JSON.stringify({
                "n": "pageview",
                "u": `http://localhost${req.path}`,
                "d": null,
                "r": req.referrer,
                "w": null
            }));
            analyticsReq.end();

            break;

        case 'POST':

            // early-exit if a redirection has already been registered for this short-url or target-url
            if (entry || registrationMayResultInDuplication) {
                res.statusCode = 409;
                res.body = {
                    'error': 'A redirection has already been registered for the specified ID or target URL!'
                };
                break;
            }

            // early-exit if the redirection target url is missing
            if (!redirectURL) {
                res.statusCode = 400;
                res.body = {
                    'error': 'Redirection target URL not specified!'
                };
                break;
            }

            await dbc.insertOne({
                'id': redirectID,
                'url': redirectURL
            })
            .then(() => {
                res.statusCode = 201;
            })
            .catch((e) => {
                console.error(e);
                res.statusCode = 500;
            });

            break;

        case 'PUT':

            // early-exit if a redirection has NOT already been registered for this short-url
            if (!entry) {
                res.statusCode = 404;
                res.body = {
                    'error': 'No redirection registered for the specified ID!'
                };
                break;
            }

            // early-exit if a redirection has already been registered for this target-url
            if (registrationMayResultInDuplication) {
                res.statusCode = 409;
                res.body = {
                    'error': 'A redirection has already been registered for the specified target URL!'
                };
                break;
            }

            // early-exit if the redirection target url is missing
            if (!redirectURL) {
                res.statusCode = 400;
                res.body = {
                    'error': 'Redirection target URL not specified!'
                };
                break;
            }

            await dbc.updateOne({'id': redirectID}, {
                '$set': {
                    'url': redirectURL
                }
            })
            .then(() => {
                res.statusCode = 200;
            })
            .catch((e) => {
                console.error(e);
                res.statusCode = 500;
            });

            break;

        case 'DELETE':
            // early-exit if a redirection has NOT already been registered for this short-url
            if (!entry) {
                res.statusCode = 404;
                res.body = {
                    'error': 'No redirection registered for the specified ID!'
                };
                break;
            }

            await dbc.deleteOne({'id': redirectID})
            .then(() => {
                res.statusCode = 200;
            })
            .catch((e) => {
                console.error(e);
                res.statusCode = 500;
            });

            break;

        default:
            res.statusCode = 400;
            res.body = 'Invalid HTTP method!';
            break;
    }

    return res.send();
};


const mongoClient = new MongoClient('mongodb://test:test@database');
mongoClient.connect()
    .then(() => {
        const app = express();
        app.use(morgan('dev'));
        app.use(cors());
        app.use(express.json());
        app.db = mongoClient.db('redirector');
        app.all('/r/:id?', handler);
        app.listen(8000, () => {
            console.log('Started HTTP server!');
        });
    })
    .catch((err) => {
        console.error('Unable to connect to DB!', err);
        return mongoClient.close();
    });
