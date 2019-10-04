import React from 'react';
import "./Cursor.scss"

interface IProps {
    active: boolean
}

interface IState {
    active: boolean
}

export default class Cursor extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            active: props.active
        }
    }
    render = () => {

        return (
            <div className="cursor"></div>
        )
    }
}
