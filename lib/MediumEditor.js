'use strict'
import { globalRegistry } from 'component-registry'
import Inferno from 'inferno'
import Component from 'inferno-component'
import utils from './utils'

// TODO: Can we drop cheerio to reduce bundle size?
import cheerio from 'cheerio'

import { IRichTextWidget, IRichTextAction } from './interfaces')

if (typeof window !== 'undefined') {
    var Medium = require('medium.js')    
}

function _getCleanedContent (editorEl) {
    const clone = editorEl.cloneNode(true)
    clone.querySelector(".RichText-Widget").children.forEach((el) => el.remove())
    return clone.outerHtml
}

function _renderPlaceHolderHTML (widgetId) {
    return '<div id="' + widgetId + '" class="RichText-Widget" contenteditable="false">This is a widget placeholder. If you can see this text, the actual widget failed to render.</div>'
}

function _cleanHTML (str, baseClassName) {
    var $in = cheerio.load(str, { decodeEntities: false })

    // Remove tags we don't want    
    ['meta', 'img'].forEach(function (tagName) {
        $in(tagName).remove()
    })
    
    // Unwrap tags by replacing them with their children
    ['span', 'div'].forEach(function (tagName) {
        $in(tagName).each(function () {
            $in(this).replaceWith($in(this).html())
        })        
    })
    
    // Strip ALL attributes
    $in("*").each(function (i, el) {
        if (el.name === 'a') {
            el.attribs = {
                href: el.attribs.href
            }
        } else {
            el.attribs = {}
        }
    })
    
    // Add classes to tags
    var blockLevelTags = {
        'p': 'Paragraph', 
        'h1': 'Header_1',
        'h2': 'Header_2',
        'h3': 'Header_3',
        'h4': 'Header_4',
        'blockquote': 'Quote'
    }
    for (var tagName in blockLevelTags) {
        $in(tagName).addClass(baseClassName + '-' + blockLevelTags[tagName])
    }
    
    return $in.html()
}

class MediumEditor extends Component {
    
    constructor (props) {
        super(props)

        this.state = {
          content: props.content || "",
          widgets: props.widgets
        }

        this.didChange = this.didChange.bind(this)
        this.didClick = this.didClick.bind(this)
    }
    
    _widgetDidLoadOrFail () {
        this.widgetsLeftToMount--
        if (this.widgetsLeftToMount == 0) {
            this.props.onWidgetsLoaded && this.props.onWidgetsLoaded()
        }
    }
    
    componentDidMount () {
        var editorEl = ReactDOM.findDOMNode(this.refs['editor'])
        
        editorEl.innerHTML = this.props.content

        // IMPORTANT! Mount all widgets explicitly since they are disconnected from rest of app
        
        this.widgetsLeftToMount = Object.keys(this.state.widgets).length
        
        for (var key in this.state.widgets) {
            // Get the widget
            var widget = this.state.widgets[key]
            var $widget = $(editorEl).find("#" + widget.widgetId)
            
            // Get the widget utility
            try {
                var widgetUtil = registry.getUtility(IRichTextWidget, widget.utilityName)
                var ViewComponent = widgetUtil.ReactComponent
                ReactDOM.render(<ViewComponent allowEditing context={widget.data} widgetId={widget.widgetId} editor={this}
                                onChange={this.didUpdateWidget}
                                onLoad={this._widgetDidLoadOrFail} />, $widget[0])
            } catch (e) {
                this._widgetDidLoadOrFail()
                console.log("[MediumEditor] We couldn't find and/or mount the widget: " + widget.utilityName + " (#" + widget.widgetId + ")")
                console.log(e)
            }
            
        }
        
        // Update state
        this.setState({
            content: editorEl.innerHTML
        })

        var defaultParagraphClassName = this.props.baseClassName + '-Paragraph'
        
        // Initialize Medium editor...
        this.medium = new Medium({
	        element: editorEl,
	        mode: Medium.richMode,
	        placeholder: this.props.placeholder,
	        attributes: null, // TODO: Hook into paste methods to cleanup tags and attr (seems pretty complicated :( )
	        tags: null,
          pasteAsText: false,
          keyContext: {
            enter: function(e, element) {
                      // Add default paragraph class
                      if (element && element.tagName === 'P') {
                          element.className = defaultParagraphClassName
                      }
                      
                      // Make sure we don't create empty divs, convert them to paragraphs instead
                      if (element && element.tagName === 'DIV') {
                          element.className = defaultParagraphClassName + " placeCaretHereNow"
                          utils.changeElementType(element, 'p')
                          utils.placeCaretInElement('placeCaretHereNow', 0, 0)
                      }
                                          
                      // Handle list items... (is this needed?)
              var sib = element.previousSibling
              if (sib && sib.tagName == 'LI') {
                element.className = sib.className
                this.cursor.caretToBeginning(element)
              }
            }
          },
          pasteEventHandler: (e) => {
              
              // TODO: Use HTML if available and clean it, otherwise use plaintext
              // TODO: Insert at current position, overwriting if selection is made
              
              var data = e.clipboardData.items
              if (e.clipboardData.types.indexOf('text/html') >= 0) {
                  var getTypeMatch = "^text/html"
              } else {
                  var getTypeMatch = "^text/plain"
                  
                  // Let Medium handle this!
                  return
              }
              
              // We'll handle this!
              e.preventDefault()
              
              for (var i = 0; i < data.length; i += 1) {
                  if ((data[i].kind == 'string') && (data[i].type.match(getTypeMatch))) {
                      data[i].getAsString((s) => {
                          
                          var html = _cleanHTML(s, this.props.baseClassName)
                          
                          // NOTE: This is not supported by IE!!!
                          // https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#Commands
                          if (!document.execCommand('insertHTML', true, html)) {
                              console.log("[MediumEditor] Paste failed! 'insertHTML' not supported!")
                          }
                          
                          // Trigger update
                          this.didChange()
                          
                      })
                  } else if ((data[i].kind == 'file') && (data[i].type.match('^image/'))) {
                      // TODO: Upload image an inject image widget
                      var f = data[i].getAsFile()
                      console.log("... Drop: File ")
                  }
              }
              
          }
	    })
                
      $(editorEl).on('change', this.didChange)
    }
    
    didClick (e) {
        // The click handler should be used to catch clicks on anchor elements
        console.log(e)
    }
    
    didUpdateWidget (widgetId, data, callback) {
        var widgets = this.state.widgets
        for (var key in widgets) {
            if (widgets[key].widgetId === widgetId) {
                widgets[key].data = data
                break
            }
        }
                
        this.setState({
            widgets: widgets
        }
        
        // Call the callback so we can get on with our life...
        callback && callback(
        
        // And do the change notification process
        this.didChange(
        
    }
    
    didChange (e) {
        // TODO: Need to catch onPaste
        var editorEl = ReactDOM.findDOMNode(this.refs['editor']
        
        if (editorEl.childElementCount == 0 && editorEl.textContent !== "") {
            // Text only, so we need to wrap it in a paragraph before proceeding
            editorEl.innerHTML = '<p class="' + this.props.baseClassName + "-Paragraph" + ' placeCaretHereNow">' + editorEl.innerHTML + '</p>'
            utils.placeCaretInElement('placeCaretHereNow', 1, 1
        }
        
        this.setState({
            content: editorEl.innerHTML
        }
        this.props.onChange(_getCleanedContent(editorEl), this.state.widgets
    }
    
    componentWillUnmount () {
        this.medium.destroy(
        
        // IMPORTANT! Unmount all widgets explicitly since they are disconnected from rest of app
        var editorEl = ReactDOM.findDOMNode(this.refs['editor'])
        
        for (var key in this.state.widgets) {
            // Get the widget
            var widget = this.state.widgets[key]
            var $widget = $(editorEl).find("#" + widget.widgetId)
            
            // Get the widget utility
            try {
                React.unmountComponentAtNode($widget[0])
            } catch (e) {
                console.log("[MediumEditor] We couldn't unmount the widget: " + widget.utilityName + " (#" + widget.widgetId + ")")
                console.log(e)
            }
            
        }
    }
    
    componentWillReceiveProps (nextProps) {
        if (this.props.content !== this.state.content) {
            this.setState({
                content: this.props.content
            })
            // TODO: Check widget ids and mount / unmount
        }
    }
    
    _selectionIsInEditor () {
        // Check if current seltion is outside editor
        var startEl = utils.getSelectionBoundaryElement(true)
        return $(ReactDOM.findDOMNode(this.refs['editor'])).has(startEl).length > 0
    }
    
    doInvokeElement (elType, opt) {
        if (!this._selectionIsInEditor()) { return }
        this.medium.invokeElement(elType, opt || {})
    }
    
    doInsertAction (action, opt) {
        if (!this._selectionIsInEditor()) { return }
        // Execute an insert action
        var actionUtil = registry.getUtility(IRichTextAction, action)
        actionUtil.action.call(this, opt)
    }
    
    doChangeBlockElement (tagName, opt) {
        if (!this._selectionIsInEditor()) { return }
        
        // Get current selection so we can restore it
        var range = utils.getCurrentSelectionRange()
        var startOffset = range.startOffset
        
        // 1 Get start el
        var startEl = utils.getSelectionBoundaryElement(true)
        
        // 2 Find closest parent block level element
        var blockEl = utils.getBlockEl(ReactDOM.findDOMNode(this.refs['editor']), startEl)
        
        // 3 Mutate it
        var $el = $(blockEl)
        $el.removeClass() // Remove all classes
        $el.addClass(opt.className + " placeCaretHereNow")
        utils.changeElementType(blockEl, tagName)
        
        // Restore selection
        range = utils.getCurrentSelectionRange()
        var $el = $(".placeCaretHereNow")
        $el.removeClass("placeCaretHereNow")
        var startNode = $el[0].childNodes[0]
        range.setStart(startNode, startOffset)
        range.setEnd(startNode, startOffset)
        utils.setSelectionRange(range)
        
        // Trigger update
        this.didChange()
    }
    
    doAddWidget (utilityName, opt) {
        if (!this._selectionIsInEditor()) { return }
        
        // Store current selection (current browsers)
        var currentSelectionRange = utils.getCurrentSelectionRange()
        
        var widgetUtil = registry.getUtility(IRichTextWidget, utilityName)
        
        // TODO: Add currentUser as first parameter
        // TODO: What to do with this.context.currentUser?
        widgetUtil.add(this.context.currentUser, (data, ViewComponent, callback) => {
            
            // Restore selection
            utils.setSelectionRange(currentSelectionRange)
            
            var widgets = this.state.widgets
            
            var idNr = Object.keys(widgets).length
            // Check that widget name is unique!!!
            while (widgets['widget_' + idNr]) {
                idNr++
            }
            var widgetId = 'widget_' + idNr
            
            var html = _renderPlaceHolderHTML(widgetId)
            
            // Add new widget
            widgets[widgetId] = {
                utilityName: utilityName,
                widgetId: widgetId,
                data: data
            }
            this.setState({
                widgets: widgets
            })
                    
            var editorEl = this.refEditor
            var selBoundEl = utils.getSelectionBoundaryElement(true)
            var blockEl = utils.getBlockEl(editorEl, selBoundEl)
            
            // Remove existing placeholder if there is one left behind by mistake
            let tmpEl = editorEl.querySelectorAll("#" + widgetId)
            if (tmpEl.length > 0) {
              tmpEl.forEach((el) => el.remove())
            }
            
            if (blockEl.innerHTML === "") {
                // If empty replace the block level element with widget
                blockEl.replaceWith(html)
            } else {
                // Otherwise just insert before the selected block node
                blockEl.before(html)
            }
                
            // Mount image view component in widget (it is disconnected from the rest of the React model)
            var widget = editorEl.querySelector("#" + widgetId)
            
            // We need to mount the react component explicitly
            // TODO: Perform Inferno render!
            ReactDOM.render(<ViewComponent allowEditing context={data} widgetId={widgetId} editor={this} />, widget)
                        
            // We are done!
            callback()
            
            // Restore selection again
            utils.setSelectionRange(currentSelectionRange)
            
            // Trigger update
            this.didChange()
        })
    }
    
    doDeleteWidget (widgetId) {
        var widgets = this.state.widgets
        var _widget = this.state.widgets[widgetId]
        
        var editorEl = this.refEditor
        var widget = editorEl.querySelector("#" + widgetId)
        
        // Get the widget utility
        try {
            // Unmount the element..
            // TODO: This needs to be done the react way (check inferno-bootstrap)
            ReactDOM.unmountComponentAtNode(widget)
            // ...and remove from DOM
            widget.remove()
            
            delete widgets[widgetId]
            this.setState({
                widgets: widgets
            })
        } catch (e) {
            console.log("[MediumEditor] We couldn't unmount the widget: " + _widget.utilityName + " (#" + _widget.widgetId + ")")
            console.log(e)
        }
    }
        
    render () {
        return (
            <div ref={(e) this.refEditor = e} onKeyUp={this.didChange} onClick={this.didClick}/>
        )
    }
})

export default Editor
