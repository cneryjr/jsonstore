/**
 * @project Thrust
 * @author nery
 */

 
declare var config: { 
    cacheScript: boolean;
    reloadPlatform: boolean;
    developmentMode: boolean;
    cacheScript: boolean;
    database: object;
};

declare namespace java.io {
    var File: any;
}

declare namespace java.nio.file {
    var Files: any;
}

declare namespace java.nio.charset {
    var Charset: any;
    var StandardCharsets: any;
}

declare namespace java.util {
    var Scanner: any;
}

declare var APP_PATH: string;
declare var CORE_PATH: string;
declare var LIB_PATH: string;

/**
 * Controla cache dos scripts
 *
 */
declare var scripts: {};

/**
 * Agrupa *builtin functions*.
 * Módulo de funções relacionadas à plataforma Thrust.
 *
 * @author nery
 * @version 0.5.201709b02
 * @namespace platf
 */
declare var platf: {
    addSoftwareLibrary: (file: java.io.File) => void;
    loadjs: (filename: string) => void;
    parseParams: (strParams: string, contentType: string) => {};
    serializeParams: (obj: object, prefix: string) => string;
};

/**
 * Carrega um *m&oacute;dulo* Javascript disponibilizando no contexto somente as
 * vari&aacute;veis e funções que foram exportadas.
 * @param {string} filename O nome do arquivo (m&oacute;dulo) a ser importado.
 * @returns {Object}
 */
declare function require(filename: string): object;

declare var _internal_: {
    improperRequest: (paramsObject: any, request: any, response: any) => void;
    processRoute: (paramsObject: any, request: any, response: any) => void;
    service: (javaRequest: any, javaResponse: any, servlet: any) => void;
};

declare function print(): void;
declare function show(): void;
declare var console: Console;

/**
 * Agrupa funcionalidades relativas a file system.
 * Módulo de manipulação de arquivos.
 */
declare namespace fs {
    /**
     * @desc Verifica se o arquivo *fileName* existe.
     * @param {string} fileName - caminho absoluto ou relativo do arquivo que se deseja verificar a existência.
     * @returns {boolean} - *true* if the file exists; *false* if the file does not exist or its existence cannot be determined.
     */
    export function exists(fileName : string);
    export function readAll(fileName : string, charset : string) : string;
    export function readJson(fileName : string, charset : string) : object;
    export function lines(fileObject : string | File | InputStream, charset : string) : Stream < String >;
    export function saveToFile(fileName : string, content : string);
}

interface RequestWrapper {
    queryString: string;
    contentType: string;
    method: string;
    pathInfo: string;
    requestURI: string;
    session: object;
    scheme: string;
    host: string;
    port: string;
    contextPath: string;
    rest: string;
    getHeader: (name: string) => string;
} 

interface ResponseWrapper {
    clean: void;
    getContentType: () => string;
    setContentType: (type: string) => void;
    getCharacterEncoding: () => string;
    setCharacterEncoding: (charset: string) => void;
    write: (content: string) => void;
    addHeader: (name: string, value: string) => void;
    getStatus: () => number;
    setStatus: (status: number) => void;
    getContentLength: () => number;
    setContentLength: (length: number) => void;
    json: (data: object, statusCode: number, headers: object) => void;
    error: {
        json: (message: string, statusCode: number, headers: object) => void;
    }
}  



/**
 * Agrupa funcionalidades relativas a comunica&ccedil;&atilde;o http
 * entre o browser e o servidor.
 */
declare var http : {
    endpoints : object;
    vroutes : object;
    middlewares: any[];
    mapEndPoint: (virtual: any, realRoute: any) => void;
    addRoute: (virtualRoute: any, realRoute: any) => void;
    addMiddleware: (middleware: any) => void;
    mimes: string[];
    serializeParams: any;
    parseParams: any;
    // Response: (javaResponse: any) => void;
    // Request: (javaRequest: any) => void;  
    Response: ResponseWrapper;
    Request: RequestWrapper
}

interface ObjectRequest {
    params: (params: object) => ObjectRequest;
    property: (property: string, value: string) => ObjectRequest;
    charset: (value: string) => ObjectRequest;
    contentType: (value: string) => ObjectRequest;
    fetch: () => string;
}

/* declare namespace HTTPClient {
    export function get(url: string, params: object) : ObjectRequest;
    export function post(url: string, params: object) : ObjectRequest;
    export function put(url: string, params: object) : ObjectRequest;
    export function delete(url: string, params: object) : ObjectRequest;
} */
/**
 * Object que implementea a execução de chamadas HTTP do lado do cliente 
 * a um servidor ( endereço URL) atrvés dos métodos GET, PUT, DELETE e POST.
 */
declare var HTTPClient: {
    get: (url: string, params: object) => ObjectRequest;
    post: (url: string, params: object) => ObjectRequest;
    put: (url: string, params: object) => ObjectRequest;
    delete: (url: string, params: object) => ObjectRequest;
}


