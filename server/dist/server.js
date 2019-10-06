"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_extra_1 = require("fs-extra");
const mongodb_1 = require("mongodb");
const path_1 = require("path");
require("./config.default.json");
const Choice_js_1 = __importDefault(require("./Choice.js"));
const config = retrieveConfig();
const dbUrl = config.databaseUrl;
const hostname = config.hostname;
const port = process.env.PORT || config.port;
const app = express_1.default();
const router = express_1.default.Router();
connectDoDatabase();
function retrieveConfig() {
    let config;
    try {
        config = fs_extra_1.readJsonSync(path_1.join(__dirname, "config.json"));
    }
    catch (error) {
        console.warn("Unable to find config, using default");
        config = fs_extra_1.readJsonSync(path_1.join(__dirname, "config.default.json"));
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
function connectDoDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield new mongodb_1.MongoClient(dbUrl, {
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
    });
}
/**
 * Ensure that the first choice exist or else nothing will work
 * @param db
 */
function ensureFirstChoiceExist(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = db.collection('choices');
        const defaultChoice = yield collection.findOne({
            id: "default"
        });
        if (!defaultChoice) {
            console.warn("Missing default choice, it will be created");
            const query = {
                id: "default",
                date: new Date(),
                label: "I start with nothing",
                optionLabel: "",
                parentId: ""
            };
            collection.insertOne(query);
            console.log("Inserted a new default choice ");
        }
    });
}
function initApi(db) {
    router.route('/choice')
        .get(function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const choice = new Choice_js_1.default(req, db);
            try {
                const data = yield choice.get();
                res.json(data);
            }
            catch (error) {
                let errorResponse;
                errorResponse = {
                    statusCode: 500,
                    status: "error",
                    data: {
                        message: error.message,
                    }
                };
                res.json(errorResponse);
            }
        });
    }).post(function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const choice = new Choice_js_1.default(req, db);
            try {
                const data = yield choice.post(req);
                res.json(data);
            }
            catch (error) {
                let errorResponse;
                errorResponse = {
                    statusCode: 500,
                    status: "error",
                    data: {
                        message: error.message,
                    }
                };
                res.json(errorResponse);
            }
        });
    });
    app.use(router);
    // Démarrer le serveur 
    app.listen(port, hostname, function () {
        console.log("Server listening on http://" + hostname + ":" + port);
    });
}
//# sourceMappingURL=server.js.map