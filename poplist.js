function Poplist(node) {
    this.node = node;
    this.list = [];

    this.onDblClickCb = function(){};
}

Poplist.prototype.getList = function() {
    var list = [];
    for(var i = 0, l = this.node.children.length; i < l; i++) {
        list.push({title: this.node.children[i].innerHTML, sourceURL: this.node.children[i].value});
    }
    return list;
}

Poplist.prototype.getURLs = function() {
    var list = [];
    for(var i = 0, l = this.node.children.length; i < l; i++) {
        list.push(this.node.children[i].value);
    }
    return list;
};

Poplist.prototype.contains = function(item) {
    for(var i = 0, l = this.node.children.length; i < l; i++) {
        var child = this.node.children[i];
        if(child.title == item.title && child.sourceURL && item.sourceURL) {
            return true;
        }
    }
    return false;
};

Poplist.prototype.add = function(url, title) {
    if(!title) {
        title = url;
    }
    var elem = document.createElement("option");
    elem.innerHTML = title;
    elem.value = url;
    elem.ondblclick = this.onDblClickCb;

    this.node.appendChild(elem);
    return false;
};
