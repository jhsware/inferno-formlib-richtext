'use strict'
import Inferno from 'inferno'
import Component from 'inferno-component'
import cheerio from 'cheerio'

import { IRichTextWidget } from './interfaces'

export function injectWidgetHTML (body, widgets) {
    
    // If we don't get any widgets we just return the body as is
    if (!widgets) {
        return body
    }
    
    var $body = cheerio.load(body, { decodeEntities: false }) // Don't convert non-ascii characters to HTML entities
    
    for (var key in widgets) {
        // Get the widget
        var widget = widgets[key]
        
        // Get the widget utility
        try {
            var widgetUtil = registry.getUtility(IRichTextWidget, widget.utilityName)
            var ViewComponent = widgetUtil.ReactComponent
            
            // Render widget HTML. NOTE: This is to allow spiders to get the full html, and also to get immediate rendering of the DOM-tree
            // avoiding delay until componentDidMount is called due to the size of the JS-file to be executed. renderToStaticMarkup rather
            // than renderToString which avoid data-reactid mismatch (server uses random values, client increments from zero).
            var widgetHTML = ReactDOMServer.renderToStaticMarkup(<ViewComponent context={widget.data} widgetId={widget.widgetId} editor={this} />)

            // Now inject the widget
            $body("#" + widget.widgetId).html(widgetHTML)
        } catch (e) {
            console.log("[RichText] We couldn't find and/or mount the widget: " + widget.utilityName + " (#" + widget.widgetId + ")")
            console.log(e)
        }
    }
    return $body.html()
}
    
export function mountWidgets (el, widgets) {
    // IMPORTANT! Mount all widgets explicitly since they are disconnected from rest of app
    for (var key in widgets) {
        // Get the widget
        var widget = widgets[key]
        var $widget = $(el).find("#" + widget.widgetId)
        
        // Get the widget utility
        try {
            var widgetUtil = registry.getUtility(IRichTextWidget, widget.utilityName)
            var ViewComponent = widgetUtil.ReactComponent
            ReactDOM.render(<ViewComponent context={widget.data} widgetId={widget.widgetId} editor={this} />, $widget[0])
        } catch (e) {
            console.log("[RichText] We couldn't find and/or mount the widget: " + widget.utilityName + " (#" + widget.widgetId + ")")
            console.log(e)
        }
        
    }
}
    
export function unmountWidgets (el, widgets) {
    // IMPORTANT! Unmount all widgets explicitly since they are disconnected from rest of app
    for (var key in widgets) {
        // Get the widget
        var widget = widgets[key]
        var $widget = $(el).find("#" + widget.widgetId)
        
        // Get the widget utility
        try {
            ReactDOM.unmountComponentAtNode($widget[0])
        } catch (e) {
            console.log("[RichText] We couldn't unmount the widget: " + widget.utilityName + " (#" + widget.widgetId + ")")
            console.log(e)
        }
        
    }
}

var _blockLevelTags = ['H#', 'P', 'DIV']
var _reNums = /\d/g

export function getBlockEl (editorEl, startEl) {
    var tagName = startEl.tagName.replace(_reNums, '#')
    if (_blockLevelTags.indexOf(tagName) < 0 && $(editorEl).has(startEl.parentNode).length > 0) {
        // Element is not a block level element according to our list and the parent is still within the editor so we
        // should traverse one step further
        return getBlockEl(editorEl, startEl.parentNode)
    } else {
        return startEl
    }
}

export function changeElementType (el, newTagName) {
    var attrs = { }
    var $el = $(el)

    $.each($el[0].attributes, function(idx, attr) {
        attrs[attr.nodeName] = attr.nodeValue
    })


    $el.replaceWith(function () {
        return $("<" + newTagName + " />", attrs).append($(this).contents())
    })
}

export function getSelectionBoundaryElement (isStart) {
    // http://stackoverflow.com/questions/1335252/how-can-i-get-the-dom-element-which-contains-the-current-selection
    var range, sel, container
    if (document.selection) {
        range = document.selection.createRange()
        range.collapse(isStart)
        return range.parentElement()
    } else {
        sel = window.getSelection()
        if (sel.getRangeAt) {
            if (sel.rangeCount > 0) {
                range = sel.getRangeAt(0)
            }
        } else {
            // Old WebKit
            range = document.createRange()
            range.setStart(sel.anchorNode, sel.anchorOffset)
            range.setEnd(sel.focusNode, sel.focusOffset)

            // Handle the case when the selection was selected backwards (from the end to the start in the document)
            if (range.collapsed !== sel.isCollapsed) {
                range.setStart(sel.focusNode, sel.focusOffset)
                range.setEnd(sel.anchorNode, sel.anchorOffset)
            }
       }

        if (range) {
           container = range[isStart ? "startContainer" : "endContainer"]

           // Check if the container is a text node and return its parent if so
           return container.nodeType === 3 ? container.parentNode : container
        }   
    }
}

export function getCurrentSelectionRange () {
    // Store current selection (current browsers)
    var sel = document.getSelection()
    return sel.getRangeAt(0)
}

export function setSelectionRange (range) {
    // Restore selection
    var sel = document.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
}

export function placeCaretInElement (className, start, end) {
    // Position caret in this element
    var range = getCurrentSelectionRange()    
    var $el = $("." + className)
    $el.removeClass(className)
    range.setStart($el[0], start)
    range.setEnd($el[0], end)
    setSelectionRange(range)
}

export function getElOffset (el) {
    var de = document.documentElement
    var box = el.getBoundingClientRect()
    var top = box.top + window.pageYOffset - de.clientTop
    var left = box.left + window.pageXOffset - de.clientLeft
    return { top, left }
}