// var File  = Java.type("java.io.File")
// var InputStream  = Java.type('java.io.InputStream')
// var BufferedReader  = Java.type('java.io.BufferedReader')
// var InputStreamReader  = Java.type('java.io.InputStreamReader')
// var Path  = Java.type('java.nio.file.Path')
// var Channels = Java.type("java.nio.channels.Channels")
// var FileInputStream = Java.type("java.io.FileInputStream")
// var FileOutputStream  = Java.type("java.io.FileOutputStream")
// var ByteBuffer = Java.type("java.nio.ByteBuffer")
// var JString = Java.type("java.lang.String")
var Files  = Java.type("java.nio.file.Files")
var Paths = Java.type("java.nio.file.Paths")
var StandardOpenOption = Java.type("java.nio.file.StandardOpenOption")


// const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
// s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

function ObjectId() {
    var m = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math
    var d = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date
    var h = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16
    var s = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (s) {
        return m.floor(s).toString(h)
    }
    return s(d.now() / 1000) + " ".repeat(h).replace(/./g, function () {
        return s(m.random() * h)
    })
}


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


function combine(rs, key) {
    var path = key.split(".")
    var last = rs
    var ak

    while (path.length > 1) {
        ak = path.shift()
        last[ak] = last[ak] || {}
        last = last[ak]
    }

    ak = path.shift()
    last[ak] = rs[key]
    delete rs[key]
}


function set(chn, inp, out, key, value) {
    var keyValueLine
    var k = key + ":"
    var size = 0
    var len = 0

    function applyObject(value, key) {
        var plained = plain_object(value, key)
        return Object.keys(plained).reduce(function (previous, depthKey) {
            return previous + depthKey + ":" + plained[depthKey] + "\r\n"
        }, "")        
    }

    inp.lines().filter(function(line) {
        return !line.startsWith(k)
    }).forEach(function(line) {
        len = line.length + 2
        out.write(line + "\r\n", 0, len)
        size += len
    })

    keyValueLine = (typeof(value) !== "object")
        ? [key,":",value,"\r\n"].join("")
        : applyObject(value, key)


    size += (len = keyValueLine.length)
    out.write(keyValueLine, 0, len)
    out.close()
    chn.truncate(size)
}


function get(stream, key) {
    var kp = key + "."
    var kdp = key + ":"
    var rs = {}

    stream.filter(function(line) {
        return line.startsWith(kp) || line.startsWith(kdp)
    }).forEach(function(line) {
        var kv = line.split(":")
        var k = kv.shift()

        rs[k] = kv.join(":")

        if (k.contains(".")) {
            combine(rs, k)
        } 
    })

    /* if (hasPoint) {
        var r = rs
        var ak

        for (var k in rs) {
            var path = k.split(".")
            var last = r

            while (path.length > 1) {
                ak = path.shift()
                last[ak] = last[ak] || {}
                last = last[ak]
            }

            ak = path.shift()
            last[ak] = rs[k]
            delete rs[k]
        }

        show("R => ", r)
    } */

    return rs
}


function jsonfs(filePathName, charset) {
    var cs = charset || java.nio.charset.StandardCharsets.UTF_8
    var filePath = Paths.get(filePathName)
    var inp
    var out
    var chn

    try {
        inp = Files.newBufferedReader(filePath, cs)
        out = Files.newBufferedWriter(filePath, cs, StandardOpenOption.WRITE)
        chn = Files.newByteChannel(filePath, StandardOpenOption.WRITE)
        // inp = new FileInputStream(filePathName).getChannel()
        // out = new FileOutputStream(filePathName).getChannel()
        // var size = inp.size()
        // out = new FileOutputStream(filePathName).getChannel()
    } catch (e) {
        show(e)
        throw "Unable to read file at: " + filePath + ", " + e
    }

    var fncSet = set.bind(null, chn, inp, out)
    var fncGet = get.bind(null, Files.lines(Paths.get(filePathName)))
    
    return {
        get: fncGet,
        set: fncSet
    }
}

/* a:1
b:2
c:3
d:4
e:5
 */
exports = jsonfs