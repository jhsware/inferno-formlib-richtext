'use strict';
import { globalRegistry, createUtility } from 'component-registry'
import Inferno from 'inferno'
import Component from 'inferno-component'

import Schema from 'isomorphic-schema/lib/Schema'
import TextField from 'isomorphic-schema/lib/field_validators/TextField'
import TextAreaField from 'isomorphic-schema/lib/field_validators/TextAreaField'

import { IRichTextWidget } from '../interfaces'

// TODO: Create these? Probably inferno-formlib
import { FormRows, ActionBar } from 'inferno-formlib'

import Button from 'inferno-bootstrap/lib/Button'

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
        this.useSchemaForValidation = youtubeSchema

        this.state = {
            failedSubmit: false,
            formErrors: undefined,
            serverErrors: undefined,
            
            spinnerSubmit: false,
            actionBarMessage: undefined,

            context: props.context || { align: 'center' }
        }
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
      global.dispatcher.dispatch({
          actionType: 'hideModal'
      })  
    }
    
    _doSubmit (callback) {
        
        this.setState({
            actionBarMessage: undefined
        });
        
        // *** Do client side form validation: ***
        var formSchema = this.useSchemaForValidation || this.state.context._implements[0].schema;
        var formErrors = formSchema.validate(this.state.context);
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
    
    didUpdate (name, context) {
        this.setState(this.state); // This should really be a force render
    }

    doAdd (e) {
        e.preventDefault();
        
        this._doSubmit(function () {
            var ViewComponent = this.props.ViewComponent;
        
            this.props.doAdd(this.state.context, ViewComponent, function () {
                this.closeModal();
            }.bind(this));
        }.bind(this))        
    }
    
    doNotAdd (e) {
        e.preventDefault();
        this.closeModal();
    }
    
    render () {
        
        var context = this.state.context;
        
        return (
            <div>
                <div className="modal-header">
                    <h3>Youtube widget</h3>
                </div>
                <form onSubmit={this.doSubmit}>
                
                    <FormRows schema={this.useSchemaForValidation} validationErrors={this.state.formErrors} value={context} onChange={this.didUpdate} />
            
                    <div className="InfernoFormlib-ActionBar">
                        <input className="btn btn-primary" type="submit" value="Spara" />
                    </div>


                    <ActionBar message={this.state.actionBarMessage}>
                        <Button
                            onClick={this.doAdd}
                            bsStyle="success"
                            disabled={false}>Lägg till</Button>
                        <div className="float-right">
                            <Button
                                onClick={this.doNotAdd}
                                bsStyle="warning"
                                disabled={false}>Ångra</Button>
                        </div>
                    </ActionBar>
            
                </form>
            </div>
        )
    }
}


// Image widget controller
var YoutubeWidgetUtility = createUtility({
    implements: IRichTextWidget,
    name: "Youtube",
    
    add: function (currentUser, doAdd) {
        // Open a modal and allow user to enter data
        var ViewComponent = this.ReactComponent;
        
        global.dispatcher.dispatch({
            actionType: 'showModal',
            modal: <YoutubeWidgetModal doAdd={doAdd} ViewComponent={this.ReactComponent}/>
        });
    },
    
    ReactComponent: React.createClass({
        getInitialState: function () {
            return {
                data: this.props.context
            }
        },
        
        componentDidMount: function () {
            this.props.onLoad && this.props.onLoad();
        },
        
        doEdit: function (e) {
            
        },
        
        doDelete: function (e) {
            e.preventDefault();
            
            this.props.editor.doDeleteWidget(this.props.widgetId);
        },
        
        doChangeAlignment: function (align) {
            var data = this.state.data
            data['align'] = align;
            this.setState({
                data: data
            });
            this.props.onChange(this.props.widgetId, data)
        },
        
        renderEditButtons: function () {
            if (!(this.props.hasOwnProperty('allowEditing') && (this.props.allowEditing === undefined || this.props.allowEditing))) {
                return null
            };
            
            return [
                (<div className="RichText-WidgetButtonToolbar">
                    <img className="RichText-WidgetFormattingButton" 
                        src="/assets/img/rich_text/justify-left.svg"
                        onClick={function (e) {e.preventDefault(); this.doChangeAlignment('left')}.bind(this)} />
                    <img className="RichText-WidgetFormattingButton" 
                        src="/assets/img/rich_text/justify-center.svg"
                        onClick={function (e) {e.preventDefault(); this.doChangeAlignment('center')}.bind(this)} />
                    <img className="RichText-WidgetFormattingButton" 
                        src="/assets/img/rich_text/justify-right.svg"
                        onClick={function (e) {e.preventDefault(); this.doChangeAlignment('right')}.bind(this)} />
                </div>),
                            
                (<img className="RichText-WidgetFormattingButton RichText-EditButton" 
                    src="/assets/img/rich_text/trash.svg"
                    onClick={this.doDelete} />)
            ]
        },
        
        render: function () {
            return <div className={"RichText-YoutubeContainer RichText-Widget-" + this.state.data.align}>
                <iframe className="RichText-Youtube" width="100%" height="100%" src={"//youtube.com/embed/" + this.state.data.youtubeId} scrolling="no" style={{border:"none", overflow:"hidden"}}></iframe>
                {this.renderEditButtons()}
            </div>
        }
    })
}).registerWith(globalRegistry)
