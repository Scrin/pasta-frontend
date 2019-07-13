import React from 'react';
import styled from 'styled-components';
import CodeMirror from 'codemirror';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { formatExpiryTime } from '../helpers';

interface Props {
    options: CodeMirror.EditorConfiguration,
    optionsChange: (options: CodeMirror.EditorConfiguration, saveableChanged: boolean) => void,
    save: (overwrite: boolean, expiry: number) => void,
    allowSave: boolean,
    allowOverwrite: boolean,
    disabled: boolean,
    expiry?: number
}

interface State {
    expirySelector: number;
    expiryCounter?: number;
}

type Option = { label: string, value: string };

const Container = styled.div`
    background-color: #f7f7f7;
    z-index: 100;
    position: relative;
    height: 40px;
    padding: 10px;
`

const OptionContainer = styled.div`
    margin-right: 16px;
    float: left;
`

const CheckboxContainer = styled(OptionContainer)`
    margin-right: 0;
`

const InfoContainer = styled.div`
    float: right;
`

const StyledSelect = styled(Select)`
    width: ${props => props.width}px;
`

const TextContainer = styled.span`
    display: block;
    padding: 9px;
    font-size: 1rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938rem;
`

const expiryOptions: Array<Option> = [
    { label: 'Delete in 5 minutes', value: '300' },
    { label: 'Delete in 1 hour', value: '3600' },
    { label: 'Delete in 1 day', value: '86400' },
    { label: 'Delete in 7 days', value: '604800' },
    { label: 'Delete in 30 days', value: '2592000' },
    { label: 'Delete in 1 year', value: '31536000' }
]

export default class Header extends React.Component<Props, State> {

    state = { expirySelector: 2592000, expiryCounter: this.props.expiry };

    timer: number | null = null;

    componentDidMount() {
        if (this.timer !== null) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.state.expiryCounter !== undefined) this.setState({ expiryCounter: this.state.expiryCounter - 10 })
        }, 10000);
    }

    componentWillUnmount() {
        if (this.timer !== null) clearInterval(this.timer);
        this.timer = null;
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({ expiryCounter: nextProps.expiry });
    }

    checkboxChange(option: keyof CodeMirror.EditorConfiguration): (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void {
        return (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            const options = { ...this.props.options, [option]: checked };
            this.props.optionsChange(options, false);
        };
    }

    optionChange(option: keyof CodeMirror.EditorConfiguration): (value: ValueType<Option>) => void {
        return (value: ValueType<Option>) => {
            const v = value as Option;
            const options = { ...this.props.options, [option]: v.value };
            this.props.optionsChange(options, true);
        }
    }

    expiryChange(value: ValueType<Option>) {
        const v = value as Option;
        this.setState({ expirySelector: Number(v.value) });
        this.props.optionsChange(this.props.options, true);
    }

    createCheckbox(option: keyof CodeMirror.EditorConfiguration): JSX.Element {
        return <Checkbox checked={this.props.options[option]} color='primary' onChange={this.checkboxChange(option)} />
    }

    createSaveButton(text: string, overwrite: boolean) {
        return (
            <OptionContainer>
                <Button disabled={this.props.disabled || !this.props.allowSave} variant="contained" color="primary" onClick={() => this.props.save(overwrite, this.state.expirySelector)}>
                    {text}
                </Button>
            </OptionContainer>
        );
    }

    createInfo() {
        if (this.state.expiryCounter === undefined) return null;
        return (
            <InfoContainer>
                <TextContainer>{formatExpiryTime(this.state.expiryCounter)}</TextContainer>
            </InfoContainer>
        );
    }

    render() {
        const options: Array<Option> = [];
        Object.keys(CodeMirror.mimeModes).forEach(mime => {
            const val = CodeMirror.mimeModes[mime];
            const subtype = typeof val === 'string' ? val : val.name;
            const label = mime + (subtype !== 'null' ? ' (' + subtype + ')' : '');
            options.push({ label, value: mime });
        });
        return (
            <Container>
                <CheckboxContainer>
                    <FormControlLabel
                        disabled={this.props.disabled}
                        label='Show line numbers'
                        control={this.createCheckbox('lineNumbers')}
                    />
                </CheckboxContainer>
                <CheckboxContainer>
                    <FormControlLabel
                        disabled={this.props.disabled}
                        label='Line wrap'
                        control={this.createCheckbox('lineWrapping')}
                    />
                </CheckboxContainer>
                <OptionContainer>
                    <StyledSelect
                        width={300}
                        isDisabled={this.props.disabled}
                        options={options}
                        value={options.find(option => option.value === this.props.options.mode)}
                        onChange={this.optionChange('mode')}
                    />
                </OptionContainer>
                <OptionContainer>
                    <StyledSelect
                        width={200}
                        isDisabled={this.props.disabled}
                        options={expiryOptions}
                        value={expiryOptions.find(option => Number(option.value) === this.state.expirySelector)}
                        onChange={(value: ValueType<Option>) => this.expiryChange(value)}
                    />
                </OptionContainer>
                {this.createSaveButton('Save', false)}
                {this.props.allowOverwrite ? this.createSaveButton('Save and overwrite', true) : null}
                {this.createInfo()}
            </Container>
        );
    }
}
