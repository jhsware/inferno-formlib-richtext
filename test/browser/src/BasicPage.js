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
        this.doRegisterEditor = this.doRegisterEditor.bind(this)
        this.doInvokeElement = this.doInvokeElement.bind(this)
        this.doChangeBlockElement = this.doChangeBlockElement.bind(this)
        this.doInsertAction = this.doInsertAction.bind(this)
        this.doAddWidget = this.doAddWidget.bind(this)
    }

    _calculateToolbarBoundary () {
      if (!this._editorEl) { return };
      
      // TODO: Remove jQuery and use Inferno calls
      var editorEl = this._editorEl
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

    doRegisterEditor (editor) {
      this._editor = editor
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

    render () {
        return (
            <div ref={(e) => this._containerEl}>
                <h1>App</h1>
                <FormattingToolbar boundary={this.state.toolbarBoundary}>
                    <FormattingButton tagName="bold" onAction={this.doInvokeElement}><b>B</b></FormattingButton>
                    <FormattingButton tagName="italic" onAction={this.doInvokeElement}><i>I</i></FormattingButton>
                    <FormattingButton tagName="underline" onAction={this.doInvokeElement}><u>U</u></FormattingButton>
                </FormattingToolbar>
                <MediumEditor ref={(e) => this._editorEl}
                  content="<p>Hej</p>"
                  widgets={{}}
                  baseClassName="Article"
                  onInit={this.doRegisterEditor}
                  onChange={(d, c) => console.log(d, c)} />
            </div>
        )
    }
}