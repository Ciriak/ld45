import React from 'react';
import ITerminalEntry from '../../interfaces/TerminalEntry';
import "./Entry.scss";

const typingDelay = 50;

interface IProps {
    data: ITerminalEntry;
    isLast?: boolean;
}

interface IState {
    entry: ITerminalEntry,
    renderText: string;
    isLast?: boolean;
}

export default class Entry extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            entry: props.data,
            renderText: "",
            isLast: props.isLast
        }
    }

    componentDidMount = () => {
        this.initTyping();
    }

    initTyping = () => {
        let timeoutValue = 0;
        let writeDelay = typingDelay;

        // 0 timeout = instant
        if (this.state.entry.instant) {
            writeDelay = 0;
        }
        for (const letter of this.state.entry.value) {
            timeoutValue += writeDelay;
            setTimeout(() => {
                this.setState({
                    renderText: this.state.renderText + letter
                });

            }, timeoutValue);

        }
    }

    render = () => {

        return (
            <div className="terminal-entry">
                <span className="value">
                    {this.state.renderText}
                </span>
            </div>
        )
    }
}
