const express = require('express');
const logger = require('./utils/logger');

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", true);
app.set("x-powered-by", false);

app.get("/", function (req, res) { res.status(200).end() });
app.use('/api/request', require('./api/request'));

app.listen(port, () => logger(`Server started on port ${port}`));