const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoutes');
const folderRoutes = require('./routes/folderRoutes');
const formRoutes = require('./routes/formRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');


const errorHandler = require('./middlewares/errorHandler');

const app = express();
dotenv.config();

app.use(cors({
    origin: '*'
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(userRoutes);
app.use(folderRoutes);
app.use(formRoutes);
app.use(workspaceRoutes);
app.get('/', (req, res) => {
    res.status(200).send({ status: "success", msg: "API is working well." });
})

app.use((req, res, next) => {
    const err = Object.assign(Error("Endpoint not found"), { code: 404 });
    next(err);
})

app.use(errorHandler);

const port = process.env.PORT || 5000
app.listen(port, () => {
    mongoose.connect(process.env.DB_URL).then(() => console.log('DB connected')).catch((error) => console.log(error))
})
