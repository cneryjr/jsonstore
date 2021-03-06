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
var System = Java.type("java.lang.System")
var Files  = Java.type("java.nio.file.Files")
var Paths = Java.type("java.nio.file.Paths")
var FileChannel = Java.type("java.nio.channels.FileChannel")
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


function plainAndStringifyObject(value, key) {
    var plained = plain_object(value, key)
    return Object.keys(plained).reduce(function (previous, depthKey) {
        return previous + depthKey + ":" + plained[depthKey] + "\r\n"
    }, "")        
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


function parseRecord(plainedRecord) { 
    // var plainedRecord = recc
    var rec = plainedRecord.replace(/^\u001F|\u001F$/g, "").split("\u001F")
    var rs = {}

    rec.forEach(function(keyValue) {
        var kv = keyValue.split(":")
        var key = kv.shift()
        var value = kv.join(":")

        var path = key.split(".")
        var last = rs
        var ak
    
        while (path.length > 1) {
            ak = path.shift()
            last[ak] = last[ak] || {}
            last = last[ak]
        }

        ak = path.shift()
        last[ak] = value
        // delete rs[key]
    })
    
    // show("RS => ", rs)

    return rs
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


function insert(dbs, data) {
    var out = dbs.out
    var plained = plain_object(data)

    var line = Object.keys(plained).reduce(function (previous, key) {
        return previous + key + ":" + plained[key] + "\u001f"
    }, "\u001f")

    line += "\r\n"
    out.append(line, 0, line.length)
    out.flush()
    // out.close()
    // dbs.channel.truncate(size)
}


function store(dbs, data) {
    var out = dbs.out
    var plained
    var line
    
    if (Array.isArray(data)) {
        data.forEach(function (obj) {
            var record = []

            plained = plain_object(obj)

            Object.keys(plained).forEach(function (key) {
                record.push( key + ":" + plained[key] )
            })

            line = "\u001f" + record.join("\u001f") + "\r\n"
            out.write(line, 0, line.length)
        }) 
    } else if (typeof(data) === "object") {
        plained = plain_object(data)
        Object.keys(plained).forEach(function (key) {
            line = [key, ":", plained[key], "\r\n"].join("")
            out.write(line, 0, line.length)
        })
    }
 
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
function findx(path, criteria, value, fnc) {
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

    rs.length = count

    return rs
}


function find(dbs, criteria, value, fnc) {
    var expr = "\u001f" +  criteria + ":" + value
    // var re = new RegExp(".*?" + criteria + ":" + value, "i")
    var path = dbs.path   
    var stream = Files.lines(path)
    var rs = []
    // var count = 0
    // var found = 0

    stream.forEach(function (line) {
        if (line.indexOf(expr) > -1) {
            // rs.push(found++)
            rs.push(line)
        }
        // System.out.print(" " + (count++) + " / " + found + "                       \r")
    }) 

    // return rs
    return {
        toArray: (function(rs) {
            return rs.map(parseRecord)
        }).bind(null, rs),

        forEach: (function(rs, cb_fnc, scope) {
            // rs.map(parseRecord).forEach(cb_fnc, scope)
            for(var i = 0, len = rs.length; i < len; ++i) {
                cb_fnc.call(scope, parseRecord(rs[i]), i, null)
            }

        }).bind(null,rs)
    }
}


function find_chnn(dbs, criteria, value, fnc) {
    var expr = "\u001f" +  criteria + ":" + value
    var rs = []
    var count = 0
    var found = 0
    var line

    function readline(buffer) {
        var linha = []
        var ch = buffer.get()

        while ((buffer.position() < buffer.limit()) && ch != 13 && ch != 10) {
            // System.out.println("" + ch + ",")
            linha.push(ch)
            // String.fromCharCode.apply(null,[78,79,80,81])
            ch = buffer.get()
        }

        if (ch == 10)
            linha.push(buffer.getChar)

        return String.fromCharCode.apply(null, linha)
    }

    var channel = Files.newByteChannel(dbs.path, StandardOpenOption.READ)
    var buffer = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size());

    System.out.println(buffer.isLoaded());  //prints false
    buffer.load();
    System.out.println(buffer.isLoaded());  //prints false
    System.out.println(buffer.capacity());  //Get the size based on content size of file

    while (buffer.position() < buffer.limit()) {
        // System.out.print(String.fromCharCode( buffer.get()) ) //Print the content of file
        line = readline(buffer)
        // System.out.println(line.substring(0,30) + "                                                     \r")
        
        var m = line.indexOf(expr)
        
        if (m > -1) {
            rs.push(found++)
        }


            System.out.print(" " + count + " / " + ch + "                                                     \r")
    }

    buffer.clear()
    channel.close()

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

        return null
    }

    var dbs = {
        path: filePath,
        channel: chn, 
        "in": inp, 
        "out": out
    }

    var fncStore = store.bind(null, dbs)
    var fncSet = set.bind(null, dbs)
    var fncGet = get.bind(null, Paths.get(filePathName))
    
    return {
        plainAndStringifyObject: plainAndStringifyObject,
        close: close.bind(null, dbs),
        store: fncStore,
        get: fncGet,
        set: fncSet,
        // find: find.bind(null, Paths.get(filePathName)),
        find: find.bind(null, dbs),
        insert: insert.bind(null, dbs)
    }
}

/* a:1
b:2
c:3
d:4
e:5
 */
exports = jsonfs