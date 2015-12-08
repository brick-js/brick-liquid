
function Brick(render) {
    this.render = render;
    this.children = [];
    this.parent = undefined;
}

Brick.prototype.pending = function() {
    var pendingTable = {};
    return Promise.all(this.children).then(results => {
        results.forEach(info => pendingTable[info.id] = info.html);
        return pendingTable;
    });
};

module.exports = Brick;
