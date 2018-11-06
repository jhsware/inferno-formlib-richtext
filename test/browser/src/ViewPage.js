import { globalRegistry } from 'component-registry'
import { Component, createPortal } from 'inferno'
import MediumEditor from '../../../src/MediumEditor'
import { FormattingToolbar, FormattingButton, InsertActionButton, WidgetButton } from '../../../src/Formatting'
import { mountWidgets, unmountWidgets } from '../../../src/utils'
import { IRichTextWidget, IRichTextAction } from '../../../src/interfaces'

import '../../../src/actions/link'
import '../../../src/actions/unlink'
import '../../../src/widgets/YoutubeWidget'

function HTMLContent ({ contentHtml }) {
    return <div dangerouslySetInnerHTML={{__html: contentHtml}}></div>
}

export default class Page extends Component {

    constructor (props) {
        super(...arguments)

        this.state = {
            contentHtml: htmlData,
            widgetData: widgetData,
            portals: []
        }
    }

    componentDidMount () {
        const widgets = this.state.widgetData
        for (var key in widgets) {
            // Get the widget
            var widget = widgets[key]
            var $widget = this._contentEl.querySelector("#" + widget.widgetId)
            
            // Get the widget utility
            try {
                var widgetUtil = globalRegistry.getUtility(IRichTextWidget, widget.utilityName)
                var ViewComponent = widgetUtil.Component
                // ReactDOM.render(<ViewComponent context={widget.data} widgetId={widget.widgetId} editor={this} />, $widget[0])
                this.state.portals.push(
                    createPortal(
                        <ViewComponent context={widget.data} widgetId={widget.widgetId} editor={this} />, 
                        $widget
                    )
                )
            } catch (e) {
                console.log("[RichText] We couldn't find and/or mount the widget: " + widget.utilityName + " (#" + widget.widgetId + ")")
                console.log(e)
            }
            
        }
        this.setState({
            portals: this.state.portals
        })
    }

    render () {
        return (
            <div ref={(e) => this._contentEl = e}>
                <h1>The Article</h1>
                <HTMLContent contentHtml={this.state.contentHtml} />
                {this.state.portals}
            </div>
        )
    }
}

var widgetData = {
  "widget_0": {"utilityName":"Youtube","widgetId":"widget_0","data":{"align":"center","youtubeId":"fKopy74weus"}}
}

var htmlData = '<h2 class="Article-Header_2">Headphones</h2><p class="Article-Paragraph">Every Stockholmer has their phone in their grip 24/7 and much of the time it’s to keep the music flowing from their hand to their ears. &nbsp;Headphones are&nbsp;<em>de rigueur&nbsp;</em>whether you’re 15 or 50 and they can be anything from the humble earbud to the latest wireless. The key here is to have them slung casually about your neck, hanging slightly off your ears, or even on your head when you take a moment to pay attention to the world around you.</p><div id="widget_0" class="RichText-Widget" contenteditable="false"></div>'
htmlData += '<a href="https://cdn.theculturetrip.com/wp-content/uploads/2017/03/headphone.jpg"><img src="https://cdn.theculturetrip.com/wp-content/uploads/2017/03/headphone-650x433.jpg"></a><p class="Article-Paragraph">Headphones are a must <a href="https://flic.kr/p/9BXg3Y">Tommy Ga-Ken Wan/Flickr</a></p><h2 class="Article-Header_2">Bags</h2><p class="Article-Paragraph"></p><p class="Article-Paragraph">Bag fashion is a bit odd in Stockholm: day it seems like everyone’s carrying a&nbsp;<a href="http://www.michaelkors.co.uk/">Michael Kors</a>&nbsp;and the next it’s all about Stella McCartney. The most important bag, though, is your computer bag. There isn’t a Stockholmer worth his or her salt who doesn’t have a unique little bag designed to not just carry their laptop but that also helps them make a statement. This can run from the traditional computer bag bedazzled with some stickers or similar to a high-end messenger bag slung casually across the shoulders.</p>'
