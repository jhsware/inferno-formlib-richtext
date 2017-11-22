(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('before')) {
      return;
    }
    Object.defineProperty(item, 'before', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function before() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();
        
        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.parentNode.insertBefore(docFrag, this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

function ReplaceWith(Ele) {
  'use-strict'; // For safari, and IE > 10
  var parent = this.parentNode,
      i = arguments.length,
      firstIsNode = +(parent && typeof Ele === 'object');
  if (!parent) return;
  
  while (i-- > firstIsNode){
    if (parent && typeof arguments[i] !== 'object'){
      arguments[i] = document.createTextNode(arguments[i]);
    } if (!parent && arguments[i].parentNode){
      arguments[i].parentNode.removeChild(arguments[i]);
      continue;
    }
    parent.insertBefore(this.previousSibling, arguments[i]);
  }
  if (firstIsNode) parent.replaceChild(Ele, this);
}
if (!Element.prototype.replaceWith)
    Element.prototype.replaceWith = ReplaceWith;
if (!CharacterData.prototype.replaceWith)
    CharacterData.prototype.replaceWith = ReplaceWith;
if (!DocumentType.prototype.replaceWith) 
    DocumentType.prototype.replaceWith = ReplaceWith;