const http = require('http')
const app = require('./app');
const server = http.createServer(app);
const config = require('./config.json');

server.listen(config.serverPort, (err, res) => {
    if (err) {
        console.log(`error : ${err}`);
    } else {
        console.log(`Listening on port : ${config.serverPort}`);
    }
})