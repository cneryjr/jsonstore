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


function plain_object_SEM_PERFORMANCE(obj, path) {
    var rs = {}
    Object.keys(obj).forEach(function(key) {
        var rso
        var value = obj[key]
        var newKey = (path) ? [path,key].join(".") : key

        if (typeof(value) === "object") {
            var r = plain_object(value, newKey)
            
            rso = Object.assign({}, rs, r)
            rs = rso
        } else {
            rs[newKey] = value
        }
    })

    return rs
}


function plain_object(obj, path) {
    var rs = {}
   
     for (var key in obj) {
        var value = obj[key]
        var newKey = (path) ? path + "." + key : key

        if (typeof(value) === "object") {
            var r = plain_object(value, newKey)
            Object.assign(rs, r)
        } else {
            rs[newKey] = value
        }
    }

    return rs
}


function plainAndStringifyObject(value, key) {
    var plained = plain_object(value, key)
    return Object.keys(plained).reduce(function (previous, depthKey) {
        return previous + depthKey + ":" + plained[depthKey] + "\r\n"
    }, "")        
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


function set(dbs, key, value) {
    var out = dbs.out
    var keyValueLine
    var k = key + ":"
    var size = 0
    var len = 0

    dbs.in.lines().filter(function(line) {
        return !line.startsWith(k)
    }).forEach(function(line) {
        len = line.length + 2
        out.write(line + "\r\n", 0, len)
        size += len
    })

    keyValueLine = (typeof(value) !== "object")
        ? [key,":",value,"\r\n"].join("")
        : plainAndStringifyObject(value, key)

    size += (len = keyValueLine.length)
    out.write(keyValueLine, 0, len)
    out.flush()
    // out.close()
    // dbs.channel.truncate(size)
}

function insert(dbs, key, value) {
    var out = dbs.out
    var keyValueLine
    // var k = key + ":"
    // var size = 0;
    // var size = dbs.channel.size()
    // var len = 0

    // dbs.channel.position(size)

    keyValueLine = (typeof(value) !== "object")
        ? [key,":",value,"\r\n"].join("")
        : plainAndStringifyObject(value, key)

    // size += (len = keyValueLine.length)
    out.append(keyValueLine, 0, keyValueLine.length)
    out.flush()
    // out.close()
    // dbs.channel.truncate(size)
}


function store(dbs, dataObject) {
    var out = dbs.out
    var size = 0
    var plained = plain_object(dataObject)
    // var data = plainAndStringifyObject(dataObject) 

    Object.keys(plained).forEach(function (key) {
        var data = key + ":" + plained[key] + "\r\n"
        size += data.length
        out.write(data, 0, data.length)
    })  

    out.close()
    // dbs.channel.truncate(size)
}


function get(path, key) {
    var stream = Files.lines(path)
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

    return rs
}

// find("*.first_name", "Eddi")
function find(path, criteria, value, fnc) {
    var re = new RegExp("(.*?\\.)" + criteria, "i")    
    var stream = Files.lines(path)
    var rs = []
    var count = 0

    stream.forEach(function (line) {
        var m = line.match(re)
        
        if (m !== null) {
            var val = line.split(":")[1]

            if (value == val) {
                count++
                // keys.push(m[1])
                new java.lang.Thread(function run() { 
                    fnc(m[1]) 
                }).start()
            }
        }
    }) 

    // stream.filter(function(line) {
    //     return line.match(re) !== null
    // }).forEach(function(line) {
    //     var kv = line.split(":")
    //     var k = kv.shift()

    //     rs[k] = kv.join(":")

    //     if (k.contains(".")) {
    //         combine(rs, k)
    //     } 
    // })

    rs.length = count

    return rs
}

function close(dbs) {
    dbs.in.close()
    dbs.out.close()
    // dbs.channel.close()
}

function jsonfs(filePathName, charset) {
    var cs = charset || java.nio.charset.StandardCharsets.UTF_8
    var filePath = Paths.get(filePathName)
    var inp
    var out
    var chn

    try {
        if (!filePath.toFile().exists())
            filePath.toFile().createNewFile()

        inp = Files.newBufferedReader(filePath, cs)
        out = Files.newBufferedWriter(filePath, cs, StandardOpenOption.WRITE, StandardOpenOption.APPEND)
        chn = null; //Files.newByteChannel(filePath, StandardOpenOption.WRITE)
        // inp = new FileInputStream(filePathName).getChannel()
        // out = new FileOutputStream(filePathName).getChannel()
        // var size = inp.size()
        // out = new FileOutputStream(filePathName).getChannel()
    } catch (e) {
        print(e)
        if (e.printStackTrace)
            e.printStackTrace()
        throw "Unable to read file at: " + filePath + ", " + e
    }

    var fncStore = store.bind(null, {channel: chn, "in": inp, "out": out})
    var fncSet = set.bind(null, {channel: chn, "in": inp, "out": out})
    var fncGet = get.bind(null, Paths.get(filePathName))
    
    return {
        plainAndStringifyObject: plainAndStringifyObject,
        close: close.bind(null, {channel: chn, "in": inp, "out": out}),
        store: fncStore,
        get: fncGet,
        set: fncSet,
        find: find.bind(null, Paths.get(filePathName)),
        insert: insert.bind(null, {channel: chn, "in": inp, "out": out})
    }
}

/* a:1
b:2
c:3
d:4
e:5
 */
exports = jsonfs