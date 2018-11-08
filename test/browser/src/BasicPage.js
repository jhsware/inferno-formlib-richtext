import { Component } from 'inferno'
import { findDOMNode } from 'inferno-extras'
import MediumEditor from '../../../src/MediumEditor'
import { FormattingToolbar, FormattingButton, InsertActionButton, WidgetButton } from '../../../src/Formatting'
import { getElOffset } from '../../../src/utils'
import { IRichTextWidget, IRichTextAction } from '../../../src/interfaces'

import '../../../src/actions/link'
import '../../../src/actions/unlink'
import '../../../src/widgets/YoutubeWidget'
import '../../../src/widgets/PodcastWidget'

export default class Page extends Component {

    constructor (props) {
        super(...arguments)

        this.state = {
            value: props.value,
            toolbarBoundary: {top: 0, bottom: 0}
        }

        this.didMountWidgets = this.didMountWidgets.bind(this)
        this.doInvokeElement = this.doInvokeElement.bind(this)
        this.doChangeBlockElement = this.doChangeBlockElement.bind(this)
        this.doInsertAction = this.doInsertAction.bind(this)
        this.doAddWidget = this.doAddWidget.bind(this)
        this.didUpdate = this.didUpdate.bind(this)
        this.doCloseModal = this.doCloseModal.bind(this)
    }

    _calculateToolbarBoundary () {
      if (!this._editor) { return };
      
      // TODO: Remove jQuery and use Inferno calls
      var editorEl = findDOMNode(this._editor)
      var topBoundaryNode = this._containerEl; // TODO: We shouldn't hard code this!!!
      
      var bottomBoundary = getElOffset(editorEl).top + editorEl.clientHeight;
      var topBoundary = getElOffset(topBoundaryNode).top;
      
      this.setState({
          toolbarBoundary: { 
              top: topBoundary, 
              bottom: bottomBoundary
          }
      });
    }

    componentDidMount () {
        this._calculateToolbarBoundary();
    }

    didMountWidgets () {
        this._calculateToolbarBoundary();
    }

    doInvokeElement (tagName, opt) {
        this._editor.doInvokeElement(tagName, opt);
    }

    doChangeBlockElement (tagName, opt) {
        this._editor.doChangeBlockElement(tagName, opt);
    }

    doCloseModal () {
        this.setState({
            modalWidget: undefined
        })
    }

    doInsertAction (action, opt) {
        if (!this._editor._selectionIsInEditor()) { return }
        // Execute an insert action
        var actionUtil = registry.getUtility(IRichTextAction, action)
        this.setState({
            modalWidget: actionUtil.action.call(this._editor, opt, this.doCloseModal)
        })
    }

    doAddWidget (utilityName, opt) {
        this.setState({
            modalWidget: this._editor.doAddWidget(utilityName, opt, this.doCloseModal)
        })
    }

    didUpdate (htmlContent, widgetData) {
        /*
        var value = this.props.value;
        this.props.onChange({
            html: htmlContent,
            widget_data: widgetData
        });
        */
        this._calculateToolbarBoundary()
    }

    render () {
        return (
            <div ref={(e) => this._containerEl = e}>
                {this.state.modalWidget}
                <h1>App</h1>
                <FormattingToolbar boundary={this.state.toolbarBoundary}>
                    <FormattingButton tagName="bold" onAction={this.doInvokeElement}><b>B</b></FormattingButton>
                    <FormattingButton tagName="italic" onAction={this.doInvokeElement}><i>I</i></FormattingButton>
                    <FormattingButton tagName="underline" onAction={this.doInvokeElement}><u>U</u></FormattingButton>
                    <FormattingButton tagName="h2" options={{className: 'Article-Header_2'}} onAction={this.doChangeBlockElement}>H2</FormattingButton>
                    <FormattingButton tagName="h3" options={{className: 'Article-Header_3'}} onAction={this.doChangeBlockElement}>H3</FormattingButton>
                    <FormattingButton tagName="h4" options={{className: 'Article-Header_4'}} onAction={this.doChangeBlockElement}>H4</FormattingButton>
                    <FormattingButton tagName="p" options={{className: 'Article-Paragraph'}} onAction={this.doChangeBlockElement}>P</FormattingButton>
                    <FormattingButton tagName="blockquote" options={{className: 'Article-Quote'}} onAction={this.doChangeBlockElement}>""</FormattingButton>

                    <InsertActionButton action="link" options={{className: 'Article-Link'}} onAction={this.doInsertAction}>link</InsertActionButton>
                    <InsertActionButton action="unlink" onAction={this.doInsertAction}>unlink</InsertActionButton>

                    <WidgetButton utilityName="Youtube" options={{}} onAction={this.doAddWidget}>Youtube</WidgetButton>
                    <WidgetButton utilityName="Podcast" options={{}} onAction={this.doAddWidget}>Podcast</WidgetButton>
                </FormattingToolbar>
                <MediumEditor ref={(e) => this._editor = e}
                  content=""
                  placeholder='Type here...'
                  widgets={{}}
                  baseClassName="Article"
                  onChange={this.didUpdate} />
            </div>
        )
    }
}