import IChoice from "./interface/Choice";
import IOption from "./interface/Option";
import { Db } from "mongodb";

export default class Choice implements IChoice {
    optionLabel: string;
    label: string;
    optionsId: string[];
    options: IChoice[];
    id: string;
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
                this.optionsId = result.optionsId;

                // retrieve the options
                const optionsQuery = {
                    id: this.optionsId
                }
                collection.find(optionsQuery).toArray((err, results) => {
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
     * Return the choice as a parsed result
     */
    private asReadableObject(): IChoice {

        const options: IChoice[] = [];
        for (let optionIndex = 0; optionIndex < this.options.length; optionIndex++) {
            const option = this.options[optionIndex];
            options.push({
                id: option.id,
                label: option.label,
                optionLabel: option.optionLabel
            });
        }

        return {
            id: this.id,
            label: this.label,
            optionLabel: this.optionLabel,
            optionsId: this.optionsId,
            options: this.options
        }
    }
}