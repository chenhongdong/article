const Koa = require('koa');
const app = new Koa();

app.use(async function (ctx, next) {
    ctx.set('Access-Control-Allow-Origin', 'http://localhost:63342');
    ctx.body = new Date().toLocaleTimeString();
});

app.listen(9999);