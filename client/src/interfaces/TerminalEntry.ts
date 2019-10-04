export default interface ITerminalEntry {
    value: string;
    type?: any;
    date?: Date;
    /**
     * True if should write instantly
     */
    instant?: boolean;
}