import http from "http";

/**
   * @swagger
   *
   * /r/{shortUrl}:
   *     get:
   *       summary: 'Redirects to target URL based on the short URL parameter.'
   *       parameters:
   *         - $ref: '#/parameters/ShortUrlPathParam'
   *       responses:
   *         302:
   *           description: 'Redirection to target URL.'
   *         400:
   *           description: 'Unable to redirect due to missing parameters.'
   *         404:
   *           description: 'Requested redirection has not been registered.'
   *       tags:
   *         - public
   */
const RedirectionHandler = ((redirectionServiceUrl) => async (req, res) => {
    const redirectionService = req.app.service(redirectionServiceUrl);

    const redirectionID = req.params.id;

    // early-exit if minimum requirements are not satisfied
    if (!redirectionID) {
        res.statusCode = 400;
        return res.send({
            'error': 'Redirection ID not specified!'
        });
    }

    // acquire redirection
    let redirection;
    try {
        redirection = await redirectionService.get(redirectionID);
    }
    catch(err) {
        res.statusCode = 404;
        return res.send({
            'error': 'No redirection registered for the specified ID!'
        });
    }

    // define redirection context
    res.set('Location', redirection.get('longUrl'));
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

    return res.send();
});

export default RedirectionHandler;
