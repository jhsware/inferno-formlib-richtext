'use strict';
import { globalRegistry, createUtility } from 'component-registry'
import { Component } from 'inferno'

import { Schema } from 'isomorphic-schema'
import TextField from 'isomorphic-schema/lib/field_validators/TextField'
import TextAreaField from 'isomorphic-schema/lib/field_validators/TextAreaField'
import 'inferno-formlib/dist/widgets/InputField'
import 'inferno-formlib/dist/widgets/TextAreaField'
import 'inferno-formlib/dist/widgets/FormRow'

import { IRichTextWidget, IRichTextEditWidget } from '../interfaces'
import createEditModal from './createEditModal'

// Edit/add widget modal

const youtubeSchema = new Schema("Youtube Widget", {
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
})

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
    Component: createEditModal(youtubeSchema, youtubeSchema._name, YoutubeWidget)
}).registerWith(globalRegistry)

createUtility({
    implements: IRichTextWidget,
    name: "Youtube",
    Component: YoutubeWidget
}).registerWith(globalRegistry)
