import React from 'react';
import ITerminalEntry from '../../interfaces/TerminalEntry';
import IChoice from '../../interfaces/Choice';
import Entry from '../entry/Entry';
import "./Terminal.scss"
import Cursor from '../cursor/Cursor';
import IPlayer from '../../interfaces/Player';
import Choice from '../choice/Choice';
import axios from 'axios';

/**
 * Used to skip all timers
 */
const debugInstant = true;

interface IState {
    entries: ITerminalEntry[],
    player: IPlayer;
    cursorActive: boolean;
    choices: IChoice[],
    selectedChoiceIndex: number;
    dump?: any;
}

export default class Terminal extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            entries: [],
            player: {},
            cursorActive: true,
            choices: [],
            selectedChoiceIndex: 0
        }
    }
    render = () => {

        const entries = [];
        const choices = [];
        for (let entryIndex = 0; entryIndex < this.state.entries.length; entryIndex++) {
            const entry = this.state.entries[entryIndex];
            entries.push(<Entry data={entry} key={entryIndex} isLast={entryIndex === this.state.entries.length - 1} />);
        }

        for (let choiceIndex = 0; choiceIndex < this.state.choices.length; choiceIndex++) {
            const choice = this.state.choices[choiceIndex];

            choice.active = false;
            if (choiceIndex === this.state.selectedChoiceIndex) {
                choice.active = true;
            }
            choices.push(<Choice data={choice} key={choiceIndex} />);
        }


        return (
            <div className="terminal">
                {entries}
                <div className="choices-container">
                    {choices}
                </div>
                <Cursor active={this.state.cursorActive} />
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
    addEntry = (value: string, duration?: number, userEntry?: boolean) => {
        return new Promise((resolve) => {
            let appliedDuration = 1500;
            if (duration) {
                appliedDuration = duration;
            }

            //debug
            if (debugInstant) {
                duration = 1;
            }



            const newEntry: ITerminalEntry = {
                value: value,
                date: new Date(),
                duration: duration,
                userEntry: userEntry
            }

            // update the state with the new entrie
            this.setState(prevState => ({
                entries: [...prevState.entries, newEntry]
            }));

            let delay = appliedDuration;
            // debug
            if (debugInstant) {
                delay = 1;
            }


            setTimeout(() => {
                resolve();
            }, delay);

        });


    }

    enableCursor = () => {
        this.setState({
            cursorActive: true
        })
    }

    disableCursor = () => {
        this.setState({
            cursorActive: false
        })
    }



    componentDidMount = () => {

        // Listen for enter key press
        window.addEventListener('keydown', this.handleEnterKey);

        // Listen for enter key press
        window.addEventListener('keydown', this.handleChoiceKeys);



        // launch the game
        this.Play();


    }

    wait = (delay: number) => {
        // debug
        if (debugInstant) {
            delay = 1;
        }
        return new Promise((resolve) => {
            setTimeout(() => {

                resolve();
            }, delay);
        });
    }

    choice = (choiceStrings: string[], variableName?: string) => {
        return new Promise((resolve) => {

            // use a dump variable for the state
            if (!variableName) {
                variableName = "dump";
            }

            // add the choices to the state
            const choices: IChoice[] = [];
            for (let choiceIndex = 0; choiceIndex < choiceStrings.length; choiceIndex++) {
                const choiceString = choiceStrings[choiceIndex];
                choices.push({
                    active: false,
                    value: choiceString,
                    variableName: variableName
                });
                this.setState({
                    choices: choices
                })
            }

            window.addEventListener('keydown', (event) => {
                if (event.key === "Enter") {
                    resolve();
                }
            });

        });
    }

    /**
     * Get use location
     */
    retrieveLocation = () => {
        return new Promise(async (resolve) => {

            axios.get(`http://ip-api.com/json`)
                .then(res => {
                    debugger
                    this.setPlayerValue("city", res.data.city)
                    this.setPlayerValue("country", res.data.country);
                    resolve();
                }).catch((err) => {
                    resolve();
                })
        });

    }

    /**
     * Set a player value
     */
    setPlayerValue = (key: string, value: any) => {
        const player = this.state.player;
        player[key] = value;
        this.setState({
            player: player
        });
    }

    handleEnterKey = (event: KeyboardEvent) => {
        event.preventDefault();
        // stop if not enter key
        if (event.key !== "Enter") {
            return;
        }

        // if we are waiting for a choice
        if (this.state.choices.length > 0) {
            this.setCurrentChoice();
        }
    }

    handleChoiceKeys = (event: KeyboardEvent) => {
        event.preventDefault();
        let valueIndex = this.state.selectedChoiceIndex;
        const numOfChoices = this.state.choices.length;

        switch (event.key) {
            case "Tab":
                valueIndex++;
                break;
            case "ArrowLeft":
                valueIndex--;
                break;
            case "ArrowRight":
                valueIndex++;
                break;
            default:
                break;
        }

        // go to the end if we got below first item
        if (valueIndex < 0) {

            valueIndex = numOfChoices - 1;
        }

        // return of the begining if we get above last value
        if (valueIndex > numOfChoices - 1) {
            valueIndex = 0;
        }

        this.setState({
            selectedChoiceIndex: valueIndex
        });
    }

    /**
     * Set the current highlighted choice as the value
     */
    setCurrentChoice = () => {
        const selectedChoice = this.state.choices[this.state.selectedChoiceIndex];
        // apply the state variable
        const player = this.state.player;
        // update the state with the key / val
        player[selectedChoice.variableName] = selectedChoice.value;
        console.log("[" + selectedChoice.variableName + "] => " + selectedChoice.value + "");

        if (selectedChoice.variableName) {
            this.setState({
                player: player
            });
            // reset the choices list

            this.addUserEntry(selectedChoice.value);

            this.setState({
                choices: [],
                selectedChoiceIndex: 0
            });
        }
    }

    /**
     * Add a user entry
     */
    addUserEntry = (value: string) => {
        this.addEntry(value, 0, true);
    }

    Play = () => {


        console.log("play");
        return new Promise(async (resolve) => {

            await this.wait(8000);

            await this.addEntry("...");

            await this.retrieveLocation();


            await this.wait(4000);

            await this.addEntry(`Is anyone there ? ...`);

            await this.choice(["Hello ?"]);

            await this.wait(1500);

            await this.addEntry(`Nice to meet you `);

            // city not available
            if (!this.state.player.city) {
                await this.wait(1500);
                await this.addEntry(`I have a question ...`);

                await this.choice(["Go ahead"]);

                await this.addEntry(`Why would you use and adblocker on a Ludum Dare game ?`);

                await this.choice(["Why not.", "Why that question ?", "askforAdBlocker"]);

                if (this.state.player.askForAdBlocker === "Why that question ?") {
                    await this.wait(1000);
                    await this.addEntry(`I ask the questions here`);
                }

            }

            await this.addEntry(`How is it going on in ${this.state.player.city} ?`)

            await this.choice(["It's fine", ""]);


            await this.wait(1000);



        });

    }
}
