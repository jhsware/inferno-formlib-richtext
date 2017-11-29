'use strict'
/*

    To use this you either add it as a custom widget or by registering
    an adapter for lookup.

*/
import Inferno from 'inferno'
import Component from 'inferno-component'

// Placeholder

class RichTextWidget extends Component {
    constructor (props) {
        super(...arguments)

        this.state = {
            value: props.value,
            toolbarBoundary: {top: 0, bottom: 0}
        }
        this.didGetInput = this.didGetInput.bind(this)
        this.didGetChange = this.didGetChange.bind(this)
    }

    _calculateToolbarBoundary () {
        if (!this.refs['editor']) { return };
        
        // TODO: Remove jQuery and use Inferno calls
        var editorEl = ReactDOM.findDOMNode(this.refs['editor']);
        var topBoundaryNode = $(".edit-page")[0]; // TODO: We shouldn't hard code this!!!
        
        var bottomBoundary = $(editorEl).offset().top + editorEl.clientHeight;
        var topBoundary = $(topBoundaryNode).offset().top;
        
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
        this.refs['editor'].doInvokeElement(tagName, opt);
    }
    
    doChangeBlockElement (tagName, opt) {
        this.refs['editor'].doChangeBlockElement(tagName, opt);
    }
    
    doInsertAction (action, opt) {
        this.refs['editor'].doInsertAction(action, opt);
    }
    
    doAddWidget (utilityName, opt) {
        this.refs['editor'].doAddWidget(utilityName, opt);
    }

    render () {

    }
}

export default RichTextWidget
