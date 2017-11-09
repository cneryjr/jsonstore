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

// var b64 = require('b64')
var JString = java.lang.String
var decoder = java
    .util
    .Base64
    .getDecoder()
var encoder = java
    .util
    .Base64
    .getEncoder()

function btoa(decodedString) {
    return new String(new JString(encoder.encode(new JString(decodedString).getBytes())))
}
function atob(encodedString) {
    return new String(new JString(decoder.decode(new JString(encodedString).getBytes())))
}
// try {     var v64 = btoa("LIxo lixo lixo")     print("v64 (enc) => ", v64)
//  print("v64 (dec) => ", atob(v64)) } catch (e) {     print("error => ", e) }

var cr = "Copyright © 2017 by Softbox"

config.cr = cr

/**
 * Serviço que responde a URI _/test/hello_
 * @param {Object} param - objeto com os parâmetros da requisição.
 * @param {http.Request} request - wrapper da classe Request do Java.
 * @param {http.Response} response - wrapper da classe Response do Java.
 */
function hello(par, req, res) {
    res.write("Hello World!")
}

function __encrypt__() {
    var path = config
        .rootPath
        .replace(/test$/, "thrust") + env
        .CORE_PATH
        .replace(/^\/REPL/, "")
    var str = fs.readAll(path + "/.platform.js")
    // var str = fs.readAll(config.rootPath + env.CORE_PATH + "/.platform.js")
    var k = [
        "\u000b",
            "h",
            "o",
            ",",
            ":",
            "h",
            " "
        ].map(function (c) {
        return String.fromCharCode(c.charCodeAt() ^ 88)
    }).join("")
    var l = k.length

    // str = "Vamos que vamos!! O Thrust é uma plataforma mega power desenvolvida
    // pela Softbox / Nery Jr"

    var crypto = btoa(new JString(str))
        .split("")
        .map(function (c, i) {
            return String.fromCharCode(c.charCodeAt() ^ (k[i % l]).charCodeAt(0))
        })
        .reverse()
        .join("")

    // print(crypto)
    fs.saveToFile(path + "/.platform.cryptx.js", crypto)
    // fs.saveToFile(config.rootPath + env.CORE_PATH + "/.platform.cryptx.js",
    // crypto)

    return crypto
}

function __decrypt__() {
    var path = config
        .rootPath
        .replace(/test$/, "thrust") + env
        .CORE_PATH
        .replace(/^\/REPL/, "")
    var __platformcrypt__ = fs.readAll(path + "/.platform.cryptx.js")
    // var __platformcrypt__ = fs.readAll(config.rootPath + env.CORE_PATH +
    // "/.platform.crypt.js")
    var k = Object.values(Object.assign({}, config.cr.slice(-7).split(""), {
        1: 0,
        2: 7,
        5: 0
    })).join("")
    var l = k.length

    var decrypto = atob(__platformcrypt__.split("").reverse().map(function (c, i) {
        return String.fromCharCode(c.charCodeAt() ^ (k[i % l]).charCodeAt(0))
    }).join(""))

    print(decrypto)
    /* fs.saveToFile(config.rootPath + CORE_PATH + "/.platform.decrypt.js", decrypto) */

    return decrypto
}

/*
var c64 = "ZnVuY3Rpb24gZDcoKSB7DQogICAgdmFyIGsgPSBPYmplY3QudmFsdWVzKE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZy5jci5zbGljZSgtNykuc3BsaXQoIiIpLCB7MTogMCwgMjogNyAsIDU6IDB9KSkuam9pbigiIikNCiAgICB2YXIgbCA9IGsubGVuZ3RoDQoNCiAgICB2YXIgZGVjcnlwdG8gPSBiNjQuYXRvYihfX3BsYXRmb3JtY3J5cHRfXy5zcGxpdCgiIikucmV2ZXJzZSgpLm1hcChmdW5jdGlvbihjLCBpKSB7DQogICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGMuY2hhckNvZGVBdCgpIF4gKGtbaSAlIGxdKS5jaGFyQ29kZUF0KDApKQ0KICAgIH0pLmpvaW4oIiIpKQ0KDQogICAgcmV0dXJuIGRlY3J5cHRvDQp9"
var c64p = c64.replace(/0/g,"%")

*/

var HTTPClient = require('httpclient')

function get_api_viacep(params, request, response) {
    var cep = HTTPClient.get('https://viacep.com.br/ws/38411100/json')
    // .get('https://google.com')
        .fetch()

    response.json(cep)
    // response.write(cep)
}

function botbox(params, req, res) {
    var nlp = new Bravey .Nlp .Fuzzy()
    nlp.addIntent("order_food", [ { entity: "food_name", id: "food_type" }, { entity: "number", id: "quantity" } ])
    // nlp.addIntent("order_drink", [{ entity: "drink_name", id: "drink_type" }])

    var food = new Bravey.StringEntityRecognizer("food_name")
    food.addMatch("pizza", "pizza")
    food.addMatch("pizza", "pizzas")
    food.addMatch("pasta", "pasta")
    nlp.addEntity(food)

    nlp.addEntity(new Bravey.NumberEntityRecognizer("number"))

    nlp.addDocument("I want {number} {food_name}!", "order_food")
    nlp.addDocument("Eu quero {food_name}!", "order_food")



    nlp.addIntent("order_petisco", [ { entity: "petisco", id: "petisco_type" } ])

    var petisco = new Bravey.RegexEntityRecognizer("petisco")
    petisco.addMatch(/queijo|azeitona/g, function(match) {
        // return "the petisco is " + match[0]
        return match[0]
    })
    // petisco.addMatch(new RegExp("\\bazeitona\\b", "g"), function(match) {
    //     return "o petisco eh " + match[1]
    // })
    nlp.addEntity(petisco)

    // show("1. => ", petisco.getEntities("Eu gosto de queijo!"))
    nlp.addDocument("Eu quero {petisco}!", "order_petisco")    
    nlp.addDocument("Eu gosto de {petisco}!", "order_petisco")    
    nlp.addDocument("Me vê um {petisco}!", "order_petisco")    
    nlp.addDocument("Me vê um {petisco}, por favor!", "order_petisco")    
    // show(nlp.test("Eu gosto de queijo!").entitiesIndex)
    // show(nlp.test("Eu quero azeitona!").entitiesIndex)
    // show(nlp.test("Me vê um queijo, por favor!").entitiesIndex)
    // show(nlp.test("Me vê umas azeitonas, por favor!").entitiesIndex)
    show(nlp.test("Me dá umas azeitonas, por favor").entitiesIndex)
    show(nlp.test("Me dá um queijo brother").entitiesIndex)

    
    // console.log(nlp.test("Want a moito, please")) { intent: "order_drink",
    // entitiesIndex: { drink_type: { value: "mojito" } } }
    // show(nlp.test("I'd like 2 pizzas"))
    // { intent: "order_food", entitiesIndex: { food_type: { value: "pizza" },
    // quantity: { value: 2 } } } console.log(nlp.test("I'd like some pasta")) {
    // intent: "order_food", entitiesIndex: { food_type: { value: "pasta" } } }

    return true
}

exports = {
    hello: hello,
    encrypt: __encrypt__,
    decrypt: __decrypt__,
    cep: get_api_viacep,
    botbox: botbox
}
