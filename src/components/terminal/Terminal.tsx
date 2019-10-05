import React from 'react';
import ITerminalEntry from '../../interfaces/TerminalEntry';
import Entry from '../entry/Entry';
import "./Terminal.scss"
import Cursor from '../cursor/Cursor';
interface IState {
    entries: ITerminalEntry[]
}

export default class Terminal extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            entries: []
        }
    }
    render = () => {

        const entries = [];
        for (let entryIndex = 0; entryIndex < this.state.entries.length; entryIndex++) {
            const entry = this.state.entries[entryIndex];
            entries.push(<Entry data={entry} key={entryIndex} isLast={entryIndex === this.state.entries.length - 1} />);
        }


        return (
            <div className="terminal">
                {entries}
                <Cursor active={true} />
            </div>
        )
    }

    /**
     * Add an entry to the temrinal
     * @param value value to write
     * @param type type of entry
     * @param delay delay before showing the entry
     * @param instant should the entry instantly write itself ?
     */
    addEntry = (value: string, type?: any, delay?: number, instant?: boolean) => {

        const newEntry: ITerminalEntry = {
            value: value,
            date: new Date(),
            type: type,
            instant: instant
        }

        if (!delay) {
            delay = 0;
        }

        setTimeout(() => {
            // update the state with the new entrie
            this.setState(prevState => ({
                entries: [...prevState.entries, newEntry]
            }));
        }, delay)


    }

    componentDidMount = () => {
        this.addEntry("A game by Cyriaque DELAUNAY", null, 2000);
        this.addEntry("", null, 3000);
        this.addEntry("", null, 4000);
        this.addEntry("For the Ludum Dare 45", null, 6000);
        this.addEntry("", null, 6500);
        this.addEntry("", null, 7000);
        this.addEntry("[Missing entry]", null, 9000, true);
    }
}
