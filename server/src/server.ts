

import express from "express";
import { readJsonSync } from "fs-extra";
import { MongoClient, Db } from "mongodb";
import { join } from "path";
import "./config.default.json";
import Choice from "./Choice.js";
import IApiResponse from "./interface/ApiResponse.js";

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

    const db = client.db("missing-entry");
    console.log("Connected to the database");
    initApi(db);
    ensureFirstChoiceExist(db);

}

/**
 * Ensure that the first choice exist or else nothing will work
 * @param db 
 */
async function ensureFirstChoiceExist(db: Db) {
    const collection = db.collection('choices');
    const defaultChoice = await collection.findOne({
        id: "default"
    });


    if (!defaultChoice) {

        console.warn("Missing default choice, it will be created")

        const query = {
            id: "default",
            date: new Date(),
            label: "I start with nothing",
            optionLabel: "",
            parentId: ""
        }
        collection.insertOne(
            query
        );
        console.log("Inserted a new default choice ");
    }
}

function initApi(db: Db) {
    router.route('/choice')
        .get(async function (req, res) {
            const choice = new Choice(req, db);
            try {
                const data = await choice.get();
                res.json(data);
            } catch (error) {
                let errorResponse: IApiResponse;

                errorResponse = {
                    statusCode: 500,
                    status: "error",
                    data: {
                        message: error.message,
                    }
                }

                res.json(errorResponse);
            }

        }).post(async function (req, res) {
            const choice = new Choice(req, db);
            try {
                const data = await choice.post(req);
                res.json(data);
            } catch (error) {
                let errorResponse: IApiResponse;

                errorResponse = {
                    statusCode: 500,
                    status: "error",
                    data: {
                        message: error.message,
                    }
                }

                res.json(errorResponse);
            }
        });


    app.use(router);

    // Démarrer le serveur 
    app.listen(port, hostname, function () {
        console.log("Server listening on http://" + hostname + ":" + port);
    });
}