'use strict';
import { globalRegistry, createUtility } from 'component-registry'
import Inferno from 'inferno'
import Component from 'inferno-component'

import { Schema } from 'isomorphic-schema'
import TextField from 'isomorphic-schema/lib/field_validators/TextField'
import TextAreaField from 'isomorphic-schema/lib/field_validators/TextAreaField'
import 'inferno-formlib/lib/widgets/InputField.jsx'
import 'inferno-formlib/lib/widgets/TextAreaField.jsx'
import 'inferno-formlib/lib/widgets/FormRow.jsx'

import { IRichTextWidget, IRichTextEditWidget } from '../interfaces'

import Button from 'inferno-bootstrap/lib/Button'
import Modal from 'inferno-bootstrap/lib/Modal/Modal'
import ModalBody from 'inferno-bootstrap/lib/Modal/ModalBody'
import ModalHeader from 'inferno-bootstrap/lib/Modal/ModalHeader'

import Form from 'inferno-bootstrap/lib/Form/Form'
import Row from 'inferno-bootstrap/lib/Row'
import Col from 'inferno-bootstrap/lib/Col'
import Container from 'inferno-bootstrap/lib/Container'

import { FormRows } from 'inferno-formlib/lib/FormRows.jsx'

// Edit/add widget modal

const youtubeSchema = new Schema("Youtube Form", {
    // Field defs
    youtubeId: new TextField({
        label: 'Youtube ID',
        placeholder: 'Type here...',
        required: true
    }),
    description: new TextAreaField({
        label: 'Short description',
        placeholder: 'Type here...',
        required: false
    })
});

class YoutubeWidgetModal extends Component{
    
    constructor (props) {
        super(...arguments)

        this.state = {
            modalOpen: true,
            context: props.context || { align: 'center' },
            failedSubmit: false,
            formErrors: undefined,
            serverErrors: undefined,
            
            spinnerSubmit: false,
            actionBarMessage: undefined
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
        var formSchema = youtubeSchema
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
            }
            return this.setState(newState)
        }
        // Otherwise clear the failed submit and continue with post
        newState['failedSubmit'] = false
        newState['spinnerSubmit'] = true
        this.setState(newState)
        // *** /END FORM VALIDATION ***
        callback()
    }
    
    didUpdate (name, value) {
        const context = this.state.context
        context[name] = value
        this.setState({
            context: context
        })
    }

    doSave (e) {
        e.preventDefault()
        
        this._doSubmit(() => {
            this.props.doAdd(this.state.context, YoutubeWidget, () => {
                this.closeModal()
            })
        })
    }
    
    doNotAdd (e) {
        e.preventDefault()
        this.closeModal()
    }
    
    render () {
        // TODO: Revise how value is stored and passed around
        const context = this.state.context
        const formSchema = youtubeSchema
       
        return (
            <Modal isOpen={this.state.modalOpen} fade="true">
                <ModalHeader>
                    <h3>Youtube Widget</h3>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={this.doSave} className='IEditItem'>
                
                        <Row>
                            <Col>
                                <FormRows className="col" schema={formSchema} validationErrors={this.state.errors} value={context} onChange={this.didUpdate} />
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

class YoutubeWidget extends Component {
    constructor () {
        super(...arguments)
        this.state= {
            data: this.props.context
        }

        this.doEdit = this.doEdit.bind(this)
        this.doDelete = this.doDelete.bind(this)
        this.doChangeAlignment = this.doChangeAlignment.bind(this)
        this.renderEditButtons = this.renderEditButtons.bind(this)
    }

    componentDidMount () {
        this.props.onLoad && this.props.onLoad()
    }
    
    doEdit (e) {
        
    }
    
    doDelete (e) {
        e.preventDefault()   
        this.props.editor.doDeleteWidget(this.props.widgetId)
    }
    
    doChangeAlignment (align) {
        var data = this.state.data
        data['align'] = align
        this.setState({
            data: data
        })
        this.props.onChange(this.props.widgetId, data)
    }
    
    renderEditButtons () {
        if (!(this.props.hasOwnProperty('allowEditing') && (this.props.allowEditing === undefined || this.props.allowEditing))) {
            return null
        }
        
        return [
            (<div className="RichText-WidgetButtonToolbar">
                <img className="RichText-WidgetFormattingButton" 
                    src="/static/assets/justify-left.svg"
                    onClick={(e) => { e.preventDefault(); this.doChangeAlignment('left')} } />
                <img className="RichText-WidgetFormattingButton" 
                    src="/static/assets/justify-center.svg"
                    onClick={(e) => { e.preventDefault(); this.doChangeAlignment('center')} } />
                <img className="RichText-WidgetFormattingButton" 
                    src="/static/assets/justify-right.svg"
                    onClick={(e) => { e.preventDefault(); this.doChangeAlignment('right')} } />
            </div>),
                        
            (<img className="RichText-WidgetFormattingButton RichText-EditButton" 
                src="/static/assets/trash.svg"
                onClick={this.doDelete} />)
        ]
    }
    
    render () {
        return <div className={"RichText-YoutubeContainer RichText-Widget-" + this.state.data.align}>
            <iframe className="RichText-Youtube" width="100%" height="100%" src={"//youtube.com/embed/" + this.state.data.youtubeId} scrolling="no" style={{border:"none", overflow:"hidden"}}></iframe>
            {this.renderEditButtons()}
        </div>
    }
}

createUtility({
    implements: IRichTextEditWidget,
    name: "Youtube",
    Component: YoutubeWidgetModal
}).registerWith(globalRegistry)

createUtility({
    implements: IRichTextWidget,
    name: "Youtube",
    Component: YoutubeWidget
}).registerWith(globalRegistry)
