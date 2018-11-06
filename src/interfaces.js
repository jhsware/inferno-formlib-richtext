'use strict'
import { createInterfaceClass } from 'component-registry'
const Interface = createInterfaceClass('inferno-formlib-richtext')

export const IRichTextWidget = new Interface({
    name: 'IRichTextWidget'
})

export const IRichTextEditWidget = new Interface({
    name: 'IRichTextEditWidget'
})

export const IRichTextAction = new Interface({
    name: 'IRichTextAction'
})
