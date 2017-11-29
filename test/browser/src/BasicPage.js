import Component from 'inferno-component'
import MediumEditor from '../../../lib/MediumEditor'
import { FormattingToolbar, FormattingButton } from '../../../lib/Formatting'
import { getElOffset } from '../../../lib/utils'

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
    }

    _calculateToolbarBoundary () {
      if (!this._editor) { return };
      
      // TODO: Remove jQuery and use Inferno calls
      var editorEl = this._editor._vNode.dom
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

    doInsertAction (action, opt) {
      this._editor.doInsertAction(action, opt);
    }

    doAddWidget (utilityName, opt) {
      this._editor.doAddWidget(utilityName, opt);
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
                <h1>App</h1>
                <FormattingToolbar boundary={this.state.toolbarBoundary}>
                    <FormattingButton tagName="bold" onAction={this.doInvokeElement}><b>B</b></FormattingButton>
                    <FormattingButton tagName="italic" onAction={this.doInvokeElement}><i>I</i></FormattingButton>
                    <FormattingButton tagName="underline" onAction={this.doInvokeElement}><u>U</u></FormattingButton>
                </FormattingToolbar>
                <MediumEditor ref={(e) => this._editor = e}
                  content="<p>Hej</p>"
                  widgets={{}}
                  baseClassName="Article"
                  onChange={this.didUpdate} />
            </div>
        )
    }
}