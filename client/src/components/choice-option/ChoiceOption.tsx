import React from 'react';
import "./ChoiceOption.scss";
import IChoice from '../../interfaces/Choice';

interface IProps {
    data: IChoice;
}

interface IState {
    option: IChoice,
}

export default class ChoiceOption extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            option: props.data,
        }
    }

    static getDerivedStateFromProps = (props: IProps, state: IState) => {
        if (props.data) {
            return {
                option: props.data
            }
        }
    }


    render = () => {
        let classes = "option";
        if (this.state.option.active) {
            classes += " active";
        }
        if (this.state.option.missingEntry) {
            classes += " missing-entry";
        }
        return (
            <div className={classes}>
                <span className="choice-string">{this.state.option.optionLabel}</span>
            </div>
        )
    }
}
