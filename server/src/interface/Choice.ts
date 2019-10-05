import IOption from "./Option";

export default interface IChoice {
    id: string;
    /**
     * Label when this choice appear as an option
     */
    optionLabel: string;
    /**
     * Label when this choice has been selected
     */
    label: string;
    /**
     * ids of the sub options
     */
    optionsId?: string[]
    /**
     * Sub options
     */
    options?: IChoice[]
}