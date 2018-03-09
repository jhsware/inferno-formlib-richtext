'use strict';
import { globalRegistry } from 'component-registry'
import { Component } from 'inferno'

import { Schema } from 'isomorphic-schema'
import TextField from 'isomorphic-schema/lib/field_validators/TextField'
import 'inferno-formlib/dist/widgets/InputField'
import 'inferno-formlib/dist/widgets/FormRow'

import Button from 'inferno-bootstrap/dist/Button'
import Modal from 'inferno-bootstrap/dist/Modal/Modal'
import ModalBody from 'inferno-bootstrap/dist/Modal/ModalBody'
import ModalHeader from 'inferno-bootstrap/dist/Modal/ModalHeader'

import Form from 'inferno-bootstrap/dist/Form/Form'
import Row from 'inferno-bootstrap/dist/Row'
import Col from 'inferno-bootstrap/dist/Col'
import Container from 'inferno-bootstrap/dist/Container'

import { FormRows } from 'inferno-formlib/dist/FormRows'

// Edit/add widget modal

/*
     NOTE: If we change the schema we need to read more props in the link action method

        var data = {
            href: newEl.getAttribute('href')
            // TODO: Add more attributes
        };

*/
var anchorSchema = new Schema("Anchor Form", {
    // Field defs
    href: new TextField({
        label: 'Url',
        placeholder: 'Type here...',
        required: true
    })
});

export default class AnchorModal extends Component {
    
    constructor (props) {
        super(...arguments)

        this.state = {
            modalOpen: true,
            context: props.context || {},
            failedSubmit: false,
            formErrors: undefined,
            serverErrors: undefined,
            
            spinnerSubmit: false,
            actionBarMessage: undefined,
        }

        this.closeModal = this.closeModal.bind(this)
        this.didUpdate = this.didUpdate.bind(this)
        this.doSave = this.doSave.bind(this)
        this.doNotAdd = this.doNotAdd.bind(this)
    }
    
    /*
    childContextTypes: {
        formStatus: React.PropTypes.object,
        onShownMessage: React.PropTypes.func
    },
    getChildContext: function () {
        return {
            formStatus: {
                failedSubmit: this.state.failedSubmit
            },
            onShownMessage: this.didShowMessage
        };
    },
    */
    
    didShowMessage () {
        // This makes sure new messages are shown once if marked with force, but
        // on subsequent redraws it will keep its state set by ActionBar
        var state = this.state;
        state['actionBarMessage'].force = false;
        this.setState(state);
    }
    
    
    closeModal () {
      this.props.onClose()
    }
    
    _doSubmit (callback) {
        
        this.setState({
            actionBarMessage: undefined
        });
        
        // *** Do client side form validation: ***
        var formSchema = anchorSchema
        var formErrors = formSchema.validate(this.state.context)
        var newState = {
            formErrors: formErrors
        };
        // If we got form errors, don't submit and mark failedSubmit so we can render
        // required fields as errors
        if (typeof formErrors !== "undefined") {
            newState['failedSubmit'] = true;
            newState['actionBarMessage'] = {
                type: "error",
                message: "The form contains errors, check fields!",
                force: true
            };
            return this.setState(newState);                
        }
        // Otherwise clear the failed submit and continue with post
        newState['failedSubmit'] = false;
        newState['spinnerSubmit'] = true;
        this.setState(newState);
        // *** /END FORM VALIDATION ***
        callback();
    }
    
    didUpdate (name, value) {
        const context = this.state.context
        context[name] = value
        this.setState({
            context: context
        })
    }

    doSave (e) {
        e.preventDefault();
        
        this._doSubmit(() => {
            this.props.onSave(this.state.context, () => {
                this.closeModal()
            })
        }) 
    }
    
    doNotAdd (e) {
        e.preventDefault();
        if (this.props.onCancel) {
            this.props.onCancel(() => {
                this.closeModal()
            })
        } else {
            this.closeModal()
        }
    }
    
    render () {
        // TODO: Revise how value is stored and passed around
        const context = this.state.context
        const formSchema = anchorSchema
       
        return (
            <Modal isOpen={this.state.modalOpen} fade="true">
                <ModalHeader>
                    <h3>Länk</h3>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={this.doSave} className='IEditItem'>
                
                        <Row>
                            <Col>
                                <FormRows className="col" schema={formSchema} validationErrors={this.state.formErrors} value={context} onChange={this.didUpdate} />
                            </Col>
                        </Row>
                
                        <Row className="InfernoFormlib-ActionBar">
                            <Col>
                                <input className="btn btn-primary" type="submit" value="Spara" />
                                <a className="InfernoFormlib-CancelBtn" href="#" onClick={this.doNotAdd}>Ångra</a>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
            </Modal>
        )
    }
}
