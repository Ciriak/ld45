export default interface ITerminalEntry {
    value: string;
    type?: any;
    date?: Date;
    /**
     * Time for the text to be written
     */
    duration?: number;
    /**
     * Wether or the the entry was added by the player
     */
    userEntry?: boolean;
}