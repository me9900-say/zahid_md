const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const host = '0.0.0.0'; // 👈 ریلوے کے لیے یہ لائن لازمی ہے
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pairRouter = require('./main');
app.use('/', pairRouter);

// 👈 یہاں ہم نے host شامل کر دیا ہے
app.listen(port, host, () => {
    console.log(`🚀 Server running on http://${host}:${port}`);
});

module.exports = app;
