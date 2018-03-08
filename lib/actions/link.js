'use strict'
import { globalRegistry, createUtility } from 'component-registry'
import { Component } from 'inferno'

var IRichTextAction = require('../interfaces').IRichTextAction

var utils = require('../utils')
var AnchorModal = require('./modals/AnchorModal')

var ActionUtil = createUtility({
    implements: IRichTextAction,
    name: 'link',
    
    action: function (options, onClose) {        
        var range = utils.getCurrentSelectionRange()
        
        // Check if we are in a link, if found edit it, otherwise create a link later in the callback
        var startEl = (range.startContainer.tagName ? range.startContainer : range.startContainer.parentNode)
        var newEl = startEl.tagName === 'A' ? startEl : startEl.closest('a')
        if (newEl) {
            var data = {
                href: newEl.getAttribute('href')
                // TODO: Add more attributes
            };
        } else {
            var data = {}
        }
        
        // This is called by the modal when finished if anything should be saved
        var doSave = function (context, callback) {
            
            // If the anchor el wasn't found, we need to create it
            if (!newEl) {
                newEl = document.createElement('a')
                newEl.className = (options.className || "") // TODO: Why did we add this class? =>   + " createdElementNow";
                newEl.setAttribute("href", "")
                
                // Don't allow selecting across block elements   
                try {
                    range.surroundContents(newEl)
                } catch (e) {
                    var endOffset = range.startContainer.textContent.length
                    range.setEnd(range.startContainer, endOffset)
                    utils.setSelectionRange(range)

                    range.surroundContents(newEl)
                }
            }
            
            // Set all the attributes
            for (var key in context) {
                newEl.setAttribute(key, context[key] || "")
            }

            // And finished
            callback()
            
            // Signal change
            this.didChange()
        }.bind(this)
        
        var didCancel = function (callback) {
            // Reset the selection
            utils.setSelectionRange(range)
            callback()
        };
        
        return <AnchorModal context={data} onSave={doSave} onCancel={didCancel} onClose={onClose} />
    }
    
});
registry.registerUtility(ActionUtil)
