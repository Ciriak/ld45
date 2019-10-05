import React from 'react';
import "./Choice.scss";
import IChoice from '../../interfaces/Choice';

interface IProps {
    data: IChoice;
}

interface IState {
    choice: IChoice,

}

export default class Choice extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            choice: props.data,
        }
    }


    render = () => {
        let classes = "choice";
        if (this.state.choice.active) {
            classes += " active";
        }
        return (
            <div className={classes}>
                <span className="choice-string">{this.state.choice.value}</span>
            </div>
        )
    }
}
