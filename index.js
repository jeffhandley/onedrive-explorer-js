import express from 'express';

const app = express();
app.use('/static', express.static('static'));

app.listen(80);
console.log('listening on port 80');
