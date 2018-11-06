import { globalRegistry } from 'component-registry'
import { Component } from 'inferno'

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
            var widgetUtil = globalRegistry.getUtility(IRichTextWidget, widget.utilityName)
            var ViewComponent = widgetUtil.Component
            
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