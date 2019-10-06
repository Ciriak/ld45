import IChoice from "./interface/Choice";
import { Db } from "mongodb";
const Filter = require('bad-words');
import moment from "moment";
import { rejects } from "assert";
const filter = new Filter();
export default class Choice implements IChoice {
    optionLabel: string;
    label: string;
    options: IChoice[];
    id: string;
    parentId: string;
    ip: string;
    date: Date;
    imageUrl: string;
    private database: Db;

    constructor(req: any, database: Db, ) {
        this.database = database;
        if (req && req.query && req.query.id) {
            this.id = req.query.id;
        }
        else {
            this.id = "default";
        }
    }

    /**
     * Retrieve the infos about the choice
     */
    async get() {
        return new Promise<IChoice>(async (resolve, reject) => {
            const collection = this.database.collection('choices');
            collection.findOne({
                id: this.id
            }).then(async (result) => {

                if (!result) {
                    throw new Error(`Choice '${this.id}' not found`);
                }

                // retrieve the main infos
                this.id = result.id;
                this.label = result.label;
                this.optionLabel = result.optionLabel;
                this.imageUrl = result.imageUrl;

                // retrieve the options
                const optionsQuery = {
                    parentId: this.id
                }
                collection.find(optionsQuery).limit(3).toArray((err, results) => {
                    if (err) {
                        throw err;
                    }

                    this.options = results;

                    resolve(this.asReadableObject());
                });


            }).catch((err) => reject(err))
        });
    }

    /**
     * Insert a new choice
     */
    async post(req: any) {
        return new Promise<any>(async (resolve, reject) => {
            const collection = this.database.collection('choices');


            try {
                this.validateChoicePost(req);
                await this.ensureParentExist();
                await this.checkForSpam();
            } catch (error) {
                reject(error);
                return;
            }

            const query: any = {
                id: this.id,
                label: this.label,
                optionLabel: this.optionLabel,
                options: [],
                date: this.date,
                ip: this.ip,
                parentId: this.parentId,
                imageUrl: this.imageUrl

            }

            const result = await collection.insertOne(
                query
            );

            if (result && result.insertedCount === 1) {
                resolve(query);
            }
            else {
                reject(new Error("Error while inserting the new choice"));
            }


        });

    }

    /**
     * Return the choice as a parsed result
     */
    private asReadableObject(): IChoice {

        const options: IChoice[] = [];
        for (let optionIndex = 0; optionIndex < this.options.length; optionIndex++) {
            const option = this.options[optionIndex];
            options.push({
                id: option.id,
                label: option.label,
                optionLabel: option.optionLabel,
                imageUrl: option.imageUrl
            });
        }

        return {
            id: this.id,
            parentId: this.parentId,
            label: this.label,
            optionLabel: this.optionLabel,
            options: options,
            imageUrl: this.imageUrl
        }
    }

    /**
     * Check and validate the data of a choice post
     * @param req 
     */
    private validateChoicePost(req: any) {

        const query = req.query;
        if (!query) {
            throw new Error("Missing query parameter");
        }

        if (!query.label) {
            throw new Error("Missing label parameter");
        }

        if (!query.optionLabel) {
            throw new Error("Missing optionLabel parameter");
        }

        if (query.optionLabel.length < 5 || query.label.length < 5 || query.optionLabel.length > 200 || query.label.length > 200) {
            throw new Error("All the text must be between 5 and 200 characters");
        }
        // query.optionLabel.substr(0, 2).toLowerCase() === "i "

        // check if first person
        if (query.optionLabel.substr(0, 2).toLowerCase() !== "i ") {
            throw new Error("Please only use first person ('I ...') to describe what you do");
        }

        if (!query.parentId) {
            throw new Error("Missing parent id");
        }

        // clean option label from common mistake
        query.optionLabel = query.optionLabel.replace("I I", "I").replace("I i", "I");

        let ip = "127.0.0.1";
        if (req.connection && req.connection.remoteAddress) {
            ip = req.connection.remoteAddress;
        }

        this.optionLabel = filter.clean(query.optionLabel);
        this.parentId = query.parentId;
        this.label = filter.clean(query.label);
        this.id = ID();
        this.imageUrl = query.imageUrl;
        this.ip = ip;
        this.date = new Date();
        return true;
    }

    /**
     * Ensure that the parent of the current choice exist
     */
    private async ensureParentExist() {
        return new Promise<IChoice>(async (resolve, reject) => {
            const collection = this.database.collection('choices');
            const parent = await collection.findOne({
                id: this.parentId
            });

            if (!parent) {
                reject(new Error(`Unable to find the parent '${this.parentId}'`));
                return;
            }
            resolve();


        });

    }

    /**
     * Check if the ip has been used too many time recently
     */
    private async checkForSpam() {
        return new Promise<IChoice>(async (resolve, reject) => {
            const collection = this.database.collection('choices');

            const date = moment(new Date()).subtract(2, 'minutes').toDate();

            collection.find({
                ip: this.ip,
                date: {
                    $gte: date
                }
            }).toArray((err, results) => {

                if (err) {
                    reject(err);
                    return;
                }

                if (results.length > 3) {
                    reject(new Error("Wow you added a lot of entries ! Please try again in 2 minutes"));
                    return;
                }



                resolve();


            });

        });
    }
}




var ID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};