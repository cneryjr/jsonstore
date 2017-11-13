var jsonfs = require("jsonstore")
require("filesystem")


function show() {
    var args = Array .prototype .slice .call(arguments)
        .map(function (arg) {
            if (arg === null)
                return "null"
            if (arg === undefined)
                return "undefined"
            var constr = arg .constructor .toString()
            return  (constr.contains("function Object()") || constr.contains("function Array()"))
                ? JSON.stringify(arg, null, 4)
                : arg
        })
    print.apply(null, args)
}

function store_persons() {
    var jdb = jsonfs("/temp/persons.dbs")
    var di, df, d1
    var persons

    di = new Date().getTime()
    // persons = Object.assign({}, JSON.parse(fs.readAll("/temp/input.json")))
    persons = require("data/persons")
    d1 = new Date().getTime()
    jdb.store(persons)
    df = new Date().getTime()
    jdb.close()
    
    show("parse => ", (d1-di), " ms")
    show("store => ", (df-di), " ms")
}

function store_vendas() {
    var jss = jsonfs("/temp/vendas.dbs")    
    var jsonGenerator = require("generator/generators").gerarVendasJson
    var num_registros = 100000000
    var di = new Date().getTime()
    var vendasJson = jsonGenerator(num_registros, jss)
    var df = new Date().getTime()

    show("", num_registros, " registros inseridos em", (df-di), "ms.")
    jss.close()
}

function findCB(key) {
    java.lang.System.out.print("KEY => " + key + "                                         \r")
}

function test_find() {
    var jdb = jsonfs("/temp/vendas.dbs")
    // var jdb = jsonfs("/temp/teste.dbs")
    // show([jdb.get("4999"), jdb.get("9876")])
    var di = new Date().getTime()
    var result = jdb.find("nomeVendedor", "Joaquim")
    // var rs = jdb.find("codigo", "200214", findCB)
    // show("FIND => ", jdb.find("first_name", "Eddi"))
    var df = new Date().getTime()
    var t1 = df-di
    var count = 0

    show("", result, " registros encontrados em", t1, "ms.")

    di = new Date().getTime()
    result.forEach(function (rec) {
        count++
        // java.lang.System.out.print("" + count + " => " + rec.nomeVendedor + "                                  \r")
    })
    t1 = new Date().getTime() - di

    show("", count, " registros encontrados em", t1, "ms.")
    
    // show("Rec(49.900) => ", rs[49899])

    jdb.close()
}


function init(params, req, res) {
    // var data = {a: 1234, b: 2345, c: 3456, d: 4567, x: {a:"A", b:"B", c:"C"}}
    var data = {a: 1, b: 2, c: 3, "e": {"x": {"nome":"B0","codigo":"77"},"y":"C1"}}
    var persons = [
        {"id":1,"first_name":"Bancroft","last_name":"Duckering","email":"bduckering0@adobe.com","gender":"Male","ip_address":"42.153.61.80"},
        {"id":2,"first_name":"Athena","last_name":"Winsom","email":"awinsom1@globo.com","gender":"Female","ip_address":"209.175.102.146"},
        {"id":3,"first_name":"Quillan","last_name":"Calken","email":"qcalken2@msu.edu","gender":"Male","ip_address":"115.26.44.40"},
        {"id":4,"first_name":"Joannes","last_name":"Morten","email":"jmorten3@canalblog.com","gender":"Female","ip_address":"212.54.233.196"},
        {"id":5,"first_name":"Dana","last_name":"Tidman","email":"dtidman4@free.fr","gender":"Male","ip_address":"199.85.180.89"},
        {"id":6,"first_name":"Livvie","last_name":"Skyme","email":"lskyme5@about.com","gender":"Female","ip_address":"41.51.156.149"},
        {"id":7,"first_name":"Kai","last_name":"Craft","email":"kcraft6@behance.net","gender":"Female","ip_address":"169.160.225.94"},
        {"id":8,"first_name":"Karissa","last_name":"Guiu","email":"kguiu7@mysql.com","gender":"Female","ip_address":"115.25.71.67"},
        {"id":9,"first_name":"Hedvige","last_name":"Rooke","email":"hrooke8@dyndns.org","gender":"Female","ip_address":"124.77.52.236"},
        {"id":10,"first_name":"Alano","last_name":"Rennick","email":"arennick9@webnode.com","gender":"Male","ip_address":"95.53.180.189"}
    ]
    var record = "codigo:100101descricao:Lápis grafite preto 1.0preco:1.15quantidade:1278total:1469.6999999999998codigoVendedor:10101nomeVendedor:Joseestado:MGcliente:Mega Fortemes:janano:2010"
    var rs
         
    // var jdb = jsonfs("/temp/persons.dbs")
    // var jdb = jsonfs("/temp/data.properties")
    // var rs = jdb.get("e")
    // print("jsonfs => ", jdb.set)
    // jdb.set("e", {x:"B0", y:"C1"})
    // jdb.close()
    
    // function run(data) {
    //     show("DATA => ", data)
    // }
    // var r = run.bind(null, data)

    // new java.lang.Thread( r ).start()

    
    // store_persons()
    // store_vendas()
    test_find()


    res.json({OK: true})
}

var recc = "codigo:100101descricao:Lápis grafite preto 1.0preco:1.15quantidade:1278total:1469.6999999999998codigoVendedor:10101nomeVendedor:Joseestado:MGcliente:Mega Fortemes:janano:2010"
var user = "codigo:100101nome:Davidpais.pai.nome:Nerypais.pai.idade:49pais.mae.nome:cassiaidade:10"


exports = {
    init: init,
    comb: function parse(params, req, res) { var plainedRecord = recc
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
        
        show("RS => ", rs)

        res.write("OK!")
    }
}