

import express from "express";
import { readJsonSync } from "fs-extra";
import { MongoClient, Db } from "mongodb";
import { join } from "path";
import "./config.default.json";

const config = retrieveConfig();

const dbUrl = config.databaseUrl;
const hostname = config.hostname;
const port = config.port;

const app = express();
const router = express.Router();

connectDoDatabase();

function retrieveConfig() {
    let config;
    try {
        config = readJsonSync(join(__dirname, "config.json"));

    } catch (error) {
        console.warn("Unable to find config, using default");
        config = readJsonSync(join(__dirname, "config.default.json"));
    }

    console.log("Config retrieved");
    return config;
}

// allow cors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

async function connectDoDatabase() {
    const client = await new MongoClient(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoReconnect: true
    }).connect();

    client.on('close', () => {
        console.log('-> lost connection');
        console.log("Trying to reconnect in 30 secondes");
        setTimeout(() => {
            connectDoDatabase();
        }, 30000);
    });

    const db = client.db("findpaper");
    console.log("Connected to the database");
    initApi(db);

}

function initApi(db: Db) {
    // router.route('/search')
    //     .get(async function (req, res) {
    //         const route = new SearchRoute(req, db, scrapper);
    //         try {
    //             const data = await route.execute();
    //             res.json(data);
    //         } catch (error) {
    //             let errorResponse: IApiResponse;

    //             // show additional error info if debug parameter is enabled
    //             if (route.parameters.debug.value === 'true') {
    //                 errorResponse = {
    //                     statusCode: 500,
    //                     status: "error",
    //                     needRetry: false,
    //                     data: {
    //                         message: error.message,
    //                         stack: error.stack
    //                     }
    //                 }
    //             }
    //             else {
    //                 errorResponse = {
    //                     needRetry: false,
    //                     statusCode: 500,
    //                     status: "error",
    //                     data: {
    //                         message: error.message,
    //                     }
    //                 }
    //             }

    //             res.json(errorResponse);
    //         }

    //     })


    app.use(router);

    // Démarrer le serveur 
    app.listen(port, hostname, function () {
        console.log("Server listening on http://" + hostname + ":" + port);
    });
}