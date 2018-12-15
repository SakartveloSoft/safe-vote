let Koa = require('koa');

let app = new Koa();

let Router = require('koa-router');

let router = new Router();
router.get('/', (ctx, next) => {
    ctx.body = "test!";
    return next();
});

router.get('/welcome', (ctx, next) => {
    if (!ctx.secure) {
        ctx.statusCode = 403;
        ctx.body = 'Secure connection required';
        return next();
    }
    let certificate = ctx.req.connection.getPeerCertificate();
    if (!certificate || !certificate.subject) {
        ctx.statusCode = 403;
        ctx.body = 'Client certificate required';
        return next();
    }
    ctx.body = 'Welcome!';
    return next();
});

app.use(router.routes());

let path = require('path');
let fs = require('fs');

let http2 = require('http2');
let server = http2.createSecureServer({
    pfx: fs.readFileSync(path.resolve(process.env.PFX_PATH)),
    passphrase: process.env.PFX_PASSWORD,
}, app.callback());

server.listen(443, process.env.PUBLIC_HOSTNAME, function (err) {
    if (err) {
        console.error(err);
    } else {
        console.info('Listening port %s', `https://` + process.env.PUBLIC_HOSTNAME);
    }
});

let secureServer = http2.createSecureServer({
    pfx: fs.readFileSync(path.resolve(process.env.SECURE_PFX_PATH)),
    passphrase: process.env.SECURE_PFX_PASSWORD,
    requestCert: true,
    rejectUnauthorized: false
}, app.callback());

secureServer.listen(443, process.env.SECURE_HOSTNAME, function (err) {
    if (err) {
        console.error(err);
    } else {
        console.info('Listening port %s', `https://` + process.env.SECURE_HOSTNAME);
    }
});
