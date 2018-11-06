'use strict';
import { globalRegistry, createUtility } from 'component-registry'

import { IRichTextAction } from '../interfaces'

import { getCurrentSelectionRange } from '../utils'

var ActionUtil = createUtility({
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
}).registerWith(globalRegistry)
