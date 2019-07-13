import React from 'react';
import { Controlled as ReactCodeMirror } from 'react-codemirror2';
import styled from 'styled-components';
import Header from './Header';
import BackendService from '../services/BackendService';
import 'codemirror/lib/codemirror.css';
import '../codemirror-modes';
import { currentID, currentSecret } from '../helpers';

interface Props {
}

interface State {
    text: string;
    options: CodeMirror.EditorConfiguration;
    saveable: boolean;
    editable: boolean;
    overwritable: boolean;
    expiry?: number;
}

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
`

const StyledCodeMirror = styled(ReactCodeMirror)`
    width: 100%;
    height: calc( 100% - 60px );
    overflow: auto;

    .CodeMirror {
        width: 100%;
        height: 100%;
    }
`

const defaultOptions: CodeMirror.EditorConfiguration = {
    lineNumbers: true,
    lineWrapping: false,
    mode: 'text/plain'
}

const loadOptions = (): CodeMirror.EditorConfiguration => {
    const stored = localStorage.getItem('options');
    return stored ? JSON.parse(stored) : defaultOptions;
}

const updateLocalStorage = (text: string, options: CodeMirror.EditorConfiguration) => {
    localStorage.setItem('text', text);
    localStorage.setItem('options', JSON.stringify(options));
}

const pushOrReplaceHistory = (id: string | null = '') => {
    const current = currentID();
    if (current === id) return;
    if (current !== null) {
        window.history.pushState(null, '', '/' + id);
    } else { // no id in url, replace
        window.history.replaceState(null, '', '/' + id);
    }
}

export default class Editor extends React.Component<Props, State> {

    state: State = {
        text: localStorage.getItem('text') || '',
        options: loadOptions(),
        saveable: false,
        editable: false,
        overwritable: false
    };

    componentWillMount() {
        this.load();
        window.onpopstate = () => this.load();
    }

    load() {
        const id = currentID();
        if (id) {
            BackendService.getPaste(id).then(text => this.setState({ text, saveable: false }));
            BackendService.getMeta(id).then(meta => {
                if (meta) {
                    this.setState({
                        options: { ...this.state.options, mode: meta.mime },
                        editable: true,
                        overwritable: (meta.secret || '') === currentSecret(),
                        expiry: meta.expiry
                    });
                } else {
                    alert('Paste ' + id + ' not found, either it never existed or it has expired'); // TODO a nice modal or something
                    this.setState({ editable: true, overwritable: false, expiry: undefined });
                    window.history.replaceState(null, '', '/');
                }
            });
        } else {
            const existingText = localStorage.getItem('text') || '';
            this.setState({ text: existingText, options: loadOptions(), saveable: existingText !== '', editable: true });
        }
    }

    save(overwrite: boolean, expiry: number) {
        if (!this.state.saveable) return;
        this.setState({ saveable: false, editable: false });
        const id = overwrite ? currentID() || undefined : undefined;
        BackendService.savePaste(this.state.text, this.state.options.mode, id, expiry)
            .then(meta => {
                pushOrReplaceHistory(meta.id);
                this.setState({ overwritable: meta.secret === currentSecret(), expiry: meta.expiry });
            })
            .catch(error => console.log(error)) // TODO error handling
            .finally(() => this.setState({ editable: true }));
    }

    textChange(text: string) {
        this.setState({ text, saveable: text !== '' });
        updateLocalStorage(text, this.state.options);
        pushOrReplaceHistory(this.state.overwritable ? currentID() : undefined);
    }

    optionsChange(options: CodeMirror.EditorConfiguration, saveableChanged: boolean) {
        if (saveableChanged) {
            this.setState({ options, saveable: this.state.text !== '' });
            pushOrReplaceHistory(this.state.overwritable ? currentID() : undefined);
        } else {
            this.setState({ options });
        }
        updateLocalStorage(this.state.text, options);
    }

    render() {
        return (
            <Wrapper>
                <Header
                    options={this.state.options}
                    optionsChange={(options, saveableChanged) => this.optionsChange(options, saveableChanged)}
                    save={(overwrite, expiry) => this.save(overwrite, expiry)}
                    allowSave={this.state.saveable}
                    allowOverwrite={this.state.overwritable}
                    disabled={!this.state.editable}
                    expiry={this.state.saveable ? undefined : this.state.expiry}
                />
                <StyledCodeMirror
                    value={this.state.text}
                    options={{ ...this.state.options, autofocus: true, readOnly: !this.state.editable }}
                    onBeforeChange={(editor, data, value) => this.textChange(value)}
                />
            </Wrapper>
        );
    }
}
