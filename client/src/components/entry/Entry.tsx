import React from 'react';
import ITerminalEntry from '../../interfaces/TerminalEntry';
import "./Entry.scss";

interface IProps {
    data: ITerminalEntry;
    isLast?: boolean;
    sounds: any;
}

interface IState {
    entry: ITerminalEntry,
    renderText: string;
    isLast?: boolean;
    sounds: any;
}

export default class Entry extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            entry: props.data,
            renderText: "",
            isLast: props.isLast,
            sounds: props.sounds
        }
    }

    componentDidMount = () => {
        this.initTyping();
    }

    initTyping = () => {
        let timeoutValue = this.state.entry.duration;
        if (!timeoutValue) {
            timeoutValue = 500;
        }



        let writeDelay = timeoutValue / this.state.entry.value.length;

        // 0 timeout = instant
        if (this.state.entry.duration) {
            writeDelay = 0;
        }
        for (const letter of this.state.entry.value) {
            timeoutValue += writeDelay;
            setTimeout(() => {
                this.setState({
                    renderText: this.state.renderText + letter
                });
                this.state.sounds.type.play();

            }, timeoutValue);

        }
    }

    render = () => {
        let classes = "terminal-entry";
        if (this.state.entry.userEntry) {
            classes += " user-entry";
        }
        return (
            <div className={classes}>
                <span className="value">
                    {this.state.renderText}
                </span>
            </div>
        )
    }
}
