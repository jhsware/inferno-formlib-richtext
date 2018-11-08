'use strict';
import { Utility } from 'component-registry'
import { IRichTextAction } from '../interfaces'
import { getCurrentSelectionRange } from '../utils'

const ActionUtil = new Utility({
    implements: IRichTextAction,
    name: 'unlink',
    
    action: function () {
        var range = getCurrentSelectionRange()
        var startEl = (range.startContainer.tagName ? range.startContainer : range.startContainer.parentNode)
        if (startEl.tagName !== 'A') {
            startEl = startEl.closest('a')
        }
        startEl.outerHTML = startEl.innerHTML
        
        // Signal change
        this.didChange()
    }
})
