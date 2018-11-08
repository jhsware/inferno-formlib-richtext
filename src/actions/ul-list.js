'use strict';
import { Utility } from 'component-registry'
import { IRichTextAction } from '../interfaces'
import { getCurrentSelectionRange, getBlockEl, placeCaretInElement } from '../utils'

const ActionUtil = new Utility({
    implements: IRichTextAction,
    name: 'ul-list',
    
    action: function(options) {
    	var ul = document.createElement('ul'),
    		li = document.createElement('li');

    	ul.className = options.className;
    	ul.appendChild(li);

    	li.className = options.className + '-Item placeCaretHereNow';
        li.innerHTML = "Type here...";

        var range = getCurrentSelectionRange();
        var startEl = (range.startContainer.tagName ? range.startContainer : range.startContainer.parentNode);
        var blockEl = getBlockEl(this.refs['editor'].getDOMNode(), startEl);
        if (blockEl.textContent == "") {
            // Replace current block
            $(blockEl).replaceWith(ul)
        } else {
            // Insert at caret
            var dummy = document.createElement('div');
            dummy.appendChild(ul);
            var html = dummy.innerHTML;
        
            this.medium.focus();
            this.medium.insertHtml(html);
        }
    
        placeCaretInElement('placeCaretHereNow', 0, 1);
        // Signal change
        this.didChange();
    }
    
});
