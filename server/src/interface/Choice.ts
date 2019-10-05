
export default interface IChoice {
    /**
     * Unique id of the choice
     */
    id: string;
    /**
     * ParentId
     */
    parentId?: string;
    /**
     * Label when this choice appear as an option
     */
    optionLabel: string;
    /**
     * Label when this choice has been selected
     */
    label: string;
    /**
     * Sub options
     */
    options?: IChoice[]
}