import React from 'react';
import ITerminalEntry from '../../interfaces/TerminalEntry';
import IChoice from '../../interfaces/Choice';
import Entry from '../entry/Entry';
import "./Terminal.scss"
import Cursor from '../cursor/Cursor';
import IPlayer from '../../interfaces/Player';
import ChoiceOption from '../choice-option/ChoiceOption';
import { Howl } from 'howler';
import axios from 'axios';
import * as config from "../../config.json";

const history: IChoice[] = [];

const nextSentencesStr = [
    "What do i do ?",
    "What happend next ?",
    "What will happend ?",
    "Choose what happend next :"
];

const sounds: any = {
    beep: null,
    type: null,
    change: null,
    select: null
};

/**
 * Used to skip all timers
 */
const debugInstant = false;
let input: HTMLInputElement;

interface IState {
    entries: ITerminalEntry[],
    player: IPlayer;
    cursorActive: boolean;
    selectedOptionIndex: number;
    choice: IChoice;
    dump?: any;
    optionInputActive: boolean;
    waitingForLabel: boolean;
    waitingForOptionLabel: boolean;
    displayChoices: boolean;
    waitingForImageUrl: boolean;
    imageUrl: string;
    imageLoaded: boolean;
}

export default class Terminal extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            entries: [],
            player: {},
            cursorActive: false,
            optionInputActive: false,
            waitingForOptionLabel: false,
            waitingForLabel: false,
            waitingForImageUrl: false,
            displayChoices: false,
            imageLoaded: false,
            imageUrl: "",
            choice: {
                id: "default",
                optionLabel: "",
                label: "I start with nothing",
                active: false,
                options: []
            },
            selectedOptionIndex: 0
        }
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
            let appliedDuration = 500;
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
            }, delay + 500);

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

    /**
     * Called when the terminal image is loaded
     */
    handleImageLoaded = () => {
        this.setState({
            imageLoaded: true
        });
    }



    componentDidMount = () => {

        // Listen for enter key press
        window.addEventListener('keydown', this.handleEnterKey);

        // Listen for back key press
        window.addEventListener('keydown', this.handleBackKey);

        // Listen for enter key press
        window.addEventListener('keydown', this.handleChoiceKeys);

        this.loadAudio();

        // launch the game
        this.Play();


    }

    // focus input on terminal click
    handleTerminalClick = () => {
        if (input) {
            input.focus();
        }

    }

    randomNextSentence = () => {
        return nextSentencesStr[Math.floor(Math.random() * nextSentencesStr.length)]
    }

    loadAudio = () => {
        sounds.beep = new Howl({
            src: ['/audio/beep.wav']
        });

        sounds.type = new Howl({
            src: ['/audio/type.wav']
        });

        sounds.change = new Howl({
            src: ['/audio/change.wav']
        });

        sounds.select = new Howl({
            src: ['/audio/select.wav']
        });

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

    /**
     * Set the current choice
     */
    choice = (choice: IChoice) => {
        return new Promise((resolve) => {

            const emptyOption = {
                id: 'new',
                active: false,
                label: "",
                optionLabel: "[YOU DECIDE]",
                options: [],
                missingEntry: true
            };

            // add empty options if needed
            for (let optionIndex = 0; optionIndex < 3; optionIndex++) {
                const option = choice.options[optionIndex];

                if (!option) {
                    emptyOption.id = emptyOption.id + "-" + optionIndex;
                    // prevent duplicate reference
                    choice.options.push(JSON.parse(JSON.stringify(emptyOption)));
                }
            }

            //set the image if needed

            if (choice.imageUrl) {
                this.setImageUrl(choice.imageUrl);
            }

            history.push(choice);

            this.setState({
                choice: choice,
                displayChoices: true
            });

            resolve();

        });
    }

    clear = () => {
        this.setState({
            entries: [],
            displayChoices: false
        });
        this.hideImage();
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

    /**
     * Called when the value of the input is changed
     */
    handleInputValueChange = () => {
        if (this.state.waitingForImageUrl && input) {
            this.setImageUrl(input.value);
        }
    }

    setImageUrl = (url: string) => {
        this.setState({
            imageUrl: url,
            imageLoaded: false
        })
    }

    hideImage = () => {
        this.setState({
            imageLoaded: false
        })
    }

    handleEnterKey = (event: KeyboardEvent) => {

        // stop if not enter key
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        // if we are waiting for a choice
        if (this.state.choice.options.length > 0) {
            this.selectCurrentOption();
        }

        if (this.state.waitingForOptionLabel) {
            if (this.isValidInput(input.value)) {
                const choice = this.state.choice;
                choice.optionLabel = input.value
                this.setState({
                    choice: choice,
                    waitingForLabel: true,
                    waitingForOptionLabel: false,
                    waitingForImageUrl: false
                });

                this.clear();
                input.value = "";
                sounds.select.play();
                this.addEntry(this.state.choice.optionLabel + " , " + this.randomNextSentence());

                return;

            }
        }

        // if valid, update the label
        if (this.state.waitingForLabel) {

            if (this.isValidInput(input.value)) {
                const choice = this.state.choice;
                choice.label = input.value;

                this.setState({
                    choice: choice,
                    waitingForLabel: false,
                    waitingForOptionLabel: false,
                    waitingForImageUrl: true
                })
                input.value = "";
                sounds.select.play();
                this.clear();
                this.addEntry(this.state.choice.label + " : if you want, you can add the url of an image that illustrate that");
                this.addUserEntry("Or just immediatly press [↵] to skip");
            }
            return;

        }

        // if valid, update the label
        if (this.state.waitingForImageUrl) {

            //alow empty input value
            if (!input.value || input.value === "") {
                // we can send the new choice
                this.sendNewChoice(this.state.choice);
                this.setState({
                    waitingForLabel: false,
                    waitingForOptionLabel: false,
                    waitingForImageUrl: false
                });
                return;
            }

            if (this.isValidInput(input.value)) {
                const choice = this.state.choice;
                choice.imageUrl = input.value;

                this.setState({
                    choice: choice,
                    waitingForLabel: false,
                    waitingForOptionLabel: false,
                    waitingForImageUrl: false
                })
                input.value = "";
                sounds.select.play();
                // we can send the new choice
                this.sendNewChoice(choice);
            }
            return;

        }


    }

    handleBackKey = async (event: KeyboardEvent) => {

        // stop if not enter key
        if (event.key !== "Backspace") {
            return;
        }

        // history is too short
        if (history.length < 2) {
            return;
        }

        //go back into the history
        await this.requestChoice(history[history.length - 2].id);
    }

    /**
     * Send a new choice
     */
    sendNewChoice = (choice: IChoice) => {
        axios.post(config.apiAddress + "/choice", null, {
            params: choice
        }).then(async (res) => {
            this.setState({
                waitingForOptionLabel: false,
                waitingForLabel: false,
                optionInputActive: false
            });
            this.clear();
            await this.wait(2000);
            await this.addEntry("...");
            this.createOption();
        }).catch((err) => {
            console.log(err);
        });
    }

    handleChoiceKeys = (event: KeyboardEvent) => {

        let valueIndex = this.state.selectedOptionIndex;
        const numOfOptions = this.state.choice.options.length;

        switch (event.key) {
            case "Tab":
                valueIndex++;
                event.preventDefault();
                sounds.change.play();
                break;
            case "ArrowUp":
                valueIndex--;
                event.preventDefault();
                sounds.change.play();
                break;
            case "ArrowLeft":
                valueIndex--;
                event.preventDefault();
                sounds.change.play();
                break;
            case "ArrowDown":
                valueIndex++;
                event.preventDefault();
                sounds.change.play();
                break;
            case "ArrowRight":
                valueIndex++;
                event.preventDefault();
                sounds.change.play();
                break;
            default:
                break;
        }

        // go to the end if we got below first item
        if (valueIndex < 0) {

            valueIndex = numOfOptions - 1;
        }

        // return of the begining if we get above last value
        if (valueIndex > numOfOptions - 1) {
            valueIndex = 0;
        }

        this.setState({
            selectedOptionIndex: valueIndex
        });
    }

    /**
     * Set the current highlighted choice as the value
     */
    selectCurrentOption = () => {

        return new Promise(async (resolve) => {
            this.clear();
            sounds.select.play();
            const option = this.state.choice.options[this.state.selectedOptionIndex];

            // if this is a missing entry, the user will be asked to use his imagination :)
            if (option.missingEntry) {
                this.createOption();
            }
            else {
                this.requestChoice(option.id);
            }

            this.setState({
                imageLoaded: false,
                displayChoices: false
            })


        });
    }

    /**
     * Called when the user will create a new option
     */
    createOption = async () => {
        this.clear();
        const oldChoiceLabel = this.state.choice.label;
        await this.addEntry(oldChoiceLabel + " , " + this.randomNextSentence());
        this.enableCursor();

        // create a new choice object
        const newChoice: IChoice = {
            id: "new",
            active: false,
            label: "",
            optionLabel: "",
            options: [],
            parentId: this.state.choice.id
        }
        this.setState({
            choice: newChoice,
            optionInputActive: true,
            waitingForOptionLabel: true
        });
        input = document.getElementById("option-input") as HTMLInputElement;
        if (input) {
            input.value = "";
            input.focus();
        }

    }

    requestChoice = (id: string) => {

        return new Promise(async (resolve) => {

            this.clear();

            axios.get(config.apiAddress + "/choice?id=" + id)
                .then(async res => {
                    const choice: IChoice = res.data;
                    this.clear();
                    await this.addEntry(choice.label);

                    await this.addEntry(this.randomNextSentence());

                    await this.choice(choice);

                }).catch((err) => {
                    resolve();
                })
        });
    }

    /**
     * Add a user entry
     */
    addUserEntry = (value: string) => {
        this.addEntry(value, 0, true);
    }

    connectToApi = () => {
        return new Promise(async (resolve) => {

            await this.requestChoice("default");
        });
    }

    isValidInput = (value: string) => {
        if (value.length < 5) {
            return false;
        }

        if (value.length > 200) {
            return false;
        }

        if (typeof value !== "string") {
            return false;
        }

        return true;
    }

    Play = () => {



        return new Promise(async (resolve) => {
            await this.addEntry("... Booting ...");
            sounds.beep.play();
            await this.addEntry(".");
            await this.addEntry(".");
            await this.wait(2000);
            await this.addEntry("Made by Cyriaque DELAUNAY for the 45th Ludum Dare");
            this.setImageUrl("https://i.imgur.com/OVWg8TH.jpg");
            await this.wait(3000);
            this.hideImage();
            await this.wait(1000);
            this.clear();
            await this.wait(1000);
            await this.addEntry("Let's begin your story ...");
            await this.wait(2000);
            await this.connectToApi();

        });

    }

    render = () => {
        const entries = [];
        const options = [];
        const imageUrl = this.state.imageUrl;
        let imageContainerClasses = "terminal-img-container";
        if (this.state.imageLoaded) {
            imageContainerClasses += " loaded";
        }
        for (let entryIndex = 0; entryIndex < this.state.entries.length; entryIndex++) {
            const entry = this.state.entries[entryIndex];
            entries.push(<Entry data={entry} key={entryIndex} sounds={sounds} isLast={entryIndex === this.state.entries.length - 1} />);
        }

        for (let optionIndex = 0; optionIndex < this.state.choice.options.length; optionIndex++) {
            const option = this.state.choice.options[optionIndex];

            option.active = false;
            if (optionIndex === this.state.selectedOptionIndex) {

                option.active = true;
            }
            options.push(<ChoiceOption data={option} key={optionIndex} />);
        }


        return (
            <div className="terminal" onClick={this.handleTerminalClick}>
                {entries}
                {this.state.displayChoices &&
                    <div className="choice-container">
                        {options}
                    </div>
                }

                {this.state.optionInputActive &&
                    <div className="input-container">
                        <input type="text" id="option-input" maxLength={200} minLength={5} autoCorrect="false" autoComplete="false" onChange={this.handleInputValueChange} />
                    </div>
                }

                <div className={imageContainerClasses}>
                    <div className="mask"></div>
                    <img src={imageUrl} alt="pic" onLoad={this.handleImageLoaded} />
                    <div className="img-container" style={{ backgroundImage: "url(" + imageUrl + ")" }}></div>
                </div>



                <Cursor active={this.state.cursorActive} />

            </div>
        )
    }
}
