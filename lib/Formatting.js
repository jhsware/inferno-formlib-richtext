'use strict';
import { Component } from 'inferno'
import { getElOffset } from './utils'

const _getElOffset = getElOffset

export class FormattingToolbar extends Component {
    // TODO: Make this sticky AF
    constructor (props) {
        super(...arguments)
        
        this.state = {
            isSticky: false
        }

        this.didScroll = this.didScroll.bind(this)
    }
    
    didScroll (e) {
        // Don't do this more than once per animation frame
        if (this.scrollAnimationFrame) { return }
        
        // Ok so we haven't done this since last frame... let's go
        this.scrollAnimationFrame = window.requestAnimationFrame(function() {
            // Don't do this if we can't find the element
            if (!this._flowingEl) {
                delete this.scrollAnimationFrame
                return
            }
        
            var flowNode = this._flowingEl
        
            var isSticky = _getElOffset(flowNode).top < (window.scrollY + this.props.boundary.top) && window.scrollY < this.props.boundary.bottom
        
            if (isSticky !== this.state.isSticky) {
                this.setState({
                    isSticky: isSticky
                });            
            }
            delete this.scrollAnimationFrame
        }.bind(this));
    }
    
    componentDidUpdate () {
        this.didScroll();
    }
    
    componentDidMount () {        
        window.addEventListener('scroll', this.didScroll)
        window.addEventListener('resize', this.didScroll)
        this.didScroll();   
    }
    
    componentWillUnmount () {
        window.removeEventListener('scroll', this.didScroll)
        window.removeEventListener('resize', this.didScroll)
    }
    
    render () {
        return (
            <div className="RichEditor-FormattingToolbarContainer">
                <div ref={(e) => this._flowingEl = e} className="RichEditor-FormattingToolbar">
                    {this.props.children}
                </div>
                <div className={"RichEditor-FormattingToolbar RichEditor-StickyFormattingToolbar" + (this.state.isSticky ? "" : " RichEditor-StickyFormattingToolbar--hidden")}
                    style={{top: this.props.boundary.top}}>
                    {this.props.children}
                </div>
                
            </div>
        )
    }
}

export class FormattingButton extends Component {
    constructor (props) {
        super(...arguments)
        this.doInvoke = this.doInvoke.bind(this)
    }

    doInvoke (e) {
        e.preventDefault()
        this.props.onAction(this.props.tagName, this.props.options || {})
    }
    
    render () {
        return (
            // IMPORTANT! We need to listen to onMouseDown or else we clear the current selection
            <div className="RichEditor-FormattingButton" onMouseDown={this.doInvoke}>
                {this.props.children || this.props.title}
            </div>
        )
    }
}

export class InsertActionButton extends Component {
    constructor (props) {
        super(...arguments)
        this.doInvoke = this.doInvoke.bind(this)
    }

    doInvoke (e) {
        e.preventDefault();
        this.props.onAction(this.props.action, this.props.options || {});
    }

    render () {
        return (
            // IMPORTANT! We need to listen to onMouseDown or else we clear the current selection
            <div className="RichEditor-InsertActionButton" onMouseDown={this.doInvoke}>
                {this.props.children || this.props.title}
            </div>
        )
    }
}

export class WidgetButton extends Component {
    constructor (props) {
        super(...arguments)
        this.doInsert = this.doInsert.bind(this)
    }

    doInsert (e) {
        e.preventDefault();
        this.props.onAction(this.props.utilityName, this.props.options || {})
    }

    render () {
        return (
            // IMPORTANT! We need to listen to onMouseDown or else we clear the current selection
            <div className="RichEditor-WidgetButton" onMouseDown={this.doInsert}>
                {this.props.children || this.props.title}
            </div>
        )
    }
}
