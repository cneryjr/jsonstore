
var times = function (x) {
    return function (f) {
        if (x > 0) {
            f(x)
            times(x - 1)(f)
        }
    }
}

var data_generators = {
    generators: {},

    handle_events: {},

    on: function name(event_name, fnc_handle) {
        this.handle_events[event_name] = fnc_handle
    },

    emit: function name(event_name, handle_params) {
        this.handle_events[event_name](handle_params)
    },

    add: function name(generator) {
        this.generators[generator.name] = generator 
    },

    times: times
}


function static_value(value) {
    return {
        next: function () {
            return value
        }
    }
}
data_generators.add(static_value)


function gen_loja() {
    var primeiro_nome = ['Jardim', 'Praia', 'Shopping', 'Mall', 'Setor', 'Cidade', 'Rodovia']
    var segundo_nome = ['Paulista', 'Patricia', 'Eldorado', 'Morumbi', 'Ibirapuera', 'Das Flores', 'Das Acassias',
        'Do Siri', 'Dos Girassois', 'Das Luzes', 'Porto Belo', 'Novo Horizonte', 'Pereque', 'Airto Senna',
        'Regis Bitencourt', 'Dos Bandeirantes', 'Primavera', 'Dos Imigrantes', 'Dos cocais', 'Maravilha',
        'Dos Engenheiros', 'Das Margarias']
    var ipn = 0
    var isn = 0
    var count = 0
    var pn_len = primeiro_nome.length
    var sn_len = segundo_nome.length

    var genloja = {
        on_next: function () {
            var loja = ["000".concat(++count).slice(-4), " - ", primeiro_nome[ipn], " ", segundo_nome[isn++]]

            if (isn === sn_len) {
                isn = 0
                ipn++
            }
            if (ipn === pn_len) {
                ipn = 0
                data_generators.emit('inc_date')
            }

            return (ultima_loja = loja.join(""))
        },

        next: function () {
            return ultima_loja
        },

        peek: function () {
            return ultima_loja
        }
    }

    data_generators.on('next_store', function __next_store() {
        genloja.on_next()
    })

    var ultima_loja = genloja.on_next()
    
    return genloja
}
data_generators.add(gen_loja)

function gen_date(initial_date) {
    var next_date = initial_date || new Date()

    function iso_to_number(date) {
        var fator = 1000000

        return date
            .toISOString()
            .substring(0, 10)
            .split("-")
            .map(function (d) { fator /= 100; return parseInt(d) * fator })
            .reduce(function (prev, curr) { return prev + curr; }, 0)
    }

    var gendate = {
        on_next: function () {
            var current_date = next_date

            next_date = new Date(next_date.getTime() + 24 * 60 * 60 * 1000)

            // ultima_data = iso_to_number(current_date)
            // print(ultima_data)
            return (ultima_data = iso_to_number(current_date))
        },
        
        next: function () {
            return ultima_data    
        },
        
        peek: function () {
            return ultima_data
        }        
    }

    data_generators.on('inc_date', function _inc_date() {
        gendate.on_next()
    })

    var ultima_data = gendate.on_next()
    
    return gendate
}
data_generators.add(gen_date)


function gen_integer(limit) {
    var last_number

    return {
        next: function () {
            return (last_number = Math.floor(Math.random() * limit))
        },

        peek: function () {
            return last_number
        }
    }
}
data_generators.add(gen_integer)

function gen_decimal(limit) {
    var last_number

    return {
        next: function () {
            return (last_number = Math.random() * limit)
        },

        peek: function () {
            return last_number
        }
    }
}
data_generators.add(gen_decimal)

function gen_from_object_array(data_array, emmit_msg) {
    var idx = 0
    var len = data_array.length
    var last_data

    return {
        next: function () {
            var data = data_array[idx++]

            if (idx === len) {
                idx = 0
                data_generators.emit(emmit_msg)
                
            }

            return (last_data = data)
        },
        
        peek: function () {
            return last_data
        }
    } 
}
data_generators.add(gen_from_object_array)

function gen_from_object_array_with_on(data_array, emmit_msg, on_msg) {
    var idx = 0
    var len = data_array.length
    var last_data = data_array[idx++]

    var gen = {
        on_next: function () {
            var data = data_array[idx++]

            if (idx === len) {
                idx = 0
                data_generators.emit(emmit_msg)
                
            }

            return (last_data = data)
        },

        next: function() {
            return last_data
        },
        
        peek: function () {
            return last_data
        }
    } 

    data_generators.on(on_msg, function _inc_date() {
        gen.on_next()
    })

    return gen
}
data_generators.add(gen_from_object_array_with_on)


function row_generator(config_row, limit) {
    var rowid = 0
    var last_row

    return {
        hasNextLine: function _has_next_line() {
            return rowid < limit
        },

        nextLine: function () {
            var row = []
            
            for(var col in config_row) {
                // print("col => ", col)
                // print("config_row => ", config_row[col])
                row.push(config_row[col].next())
            }
                    
            rowid++
            last_row = row.join('\t')

            return last_row
        },

        peek: function () {
            return last_row
        }
    }
}


function gerarVendasJson(limit, jss) {
    var matEscolar = require("generator/produtos")
    var atacDist = require("generator/atacados")
    var listaVnd = require("generator/vendedor")

    var produtos = gen_from_object_array(matEscolar, "next_vendedor")
    var vendedores = gen_from_object_array_with_on(listaVnd, "next_atacado", "next_vendedor")
    var atacados = gen_from_object_array_with_on(atacDist, "next_mes", "next_atacado")
    var meses = gen_from_object_array_with_on(["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov", "dez"], "next_ano", "next_mes")
    var anos = gen_from_object_array_with_on([1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017], "", "next_ano")
    var uniades = gen_integer(5000)
    var vendas = []

    var di = new Date().getTime()
    
    for (var i=0; i < limit; i++) {
        var prd = produtos.next()
        var vnd = vendedores.next()
        var qtd = uniades.next()

        var pedido = {
            codigo: prd.codigo,
            descricao: prd.descricao,
            preco: prd.preco,
            quantidade: qtd,
            total: prd.preco * qtd,
            codigoVendedor: vnd.codigo,
            nomeVendedor: vnd.nome,
            estado: vnd.regiao,
            cliente: atacados.next(),
            mes: meses.next(),
            ano: anos.next()
        }

        if (jss) {
            jss.insert(pedido)
        } else {
            vendas.push(pedido)
        }
    }

    var df = new Date().getTime()
    show("", limit, " registros inseridos em", (df-di), "ms.")
    
    
    return vendas
}

exports = {
    times: times,
    gerarVendasJson: gerarVendasJson
}
