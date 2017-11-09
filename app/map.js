var jsonfs = require("jsonfs")

function plain_object(obj, path) {
    var rs = {}
    Object.keys(obj).forEach(function(key) {
        var value = obj[key]
        var newKey = (path) ? [path,key].join(".") : key

        if (typeof(value) === "object") {
            var r = plain_object(value, newKey)
            var rso = Object.assign({}, rs, r)

            rs = rso
        } else {
            rs[newKey] = value
        }
    })

    return rs
}

function init(params, req, res) {
    var data = {a: 1234, b: 2345, c: 3456, d: 4567, x: {a:"A", b:"B", c:"C"}}

    show("data => ", plain_object(data))

    var jdb = jsonfs("/temp/data.properties")

    // print("jsonfs => ", jdb.set)
    // jdb.set("e", {x:"B0", y:"C1"})
    show("rs => ", jdb.get("e"))

    res.json({rs: "OK"})
}

exports = {
    init: init
}