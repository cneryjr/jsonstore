var File  = Java.type('java.io.File')
var InputStream  = Java.type('java.io.InputStream')
var BufferedReader  = Java.type('java.io.BufferedReader')
var InputStreamReader  = Java.type('java.io.InputStreamReader')
var Files  = Java.type('java.nio.file.Files')
var Path  = Java.type('java.nio.file.Path')
var Paths = Java.type('java.nio.file.Paths')
//  var Scanner = Java.type('java.util.Scanner');
var StandardOpenOption = Java.type('java.nio.file.StandardOpenOption')
var StandardCharsets = Java.type('java.nio.charset.StandardCharsets')
 

/**
 * Agrupa funcionalidades relativas a file system.
 * Módulo de manipulçaão de arquivos.
 * 
 * @author nery
 * @version 0.5.201709b01 
 * @namespace fs
 */
var fs = {

    /**
     * @desc Apaga o arquivo *filePathName*.
     * @param {string} filePathName - caminho absoluto ou relativo do arquivo a ser apagado.
     * @returns {boolean} - retorna *true* se a operação foi executada sem erro e *false* caso contrário.
     */
    delete: function(filePathName) {
        try {
            new File(filePathName).delete()
            return true
        } catch (error) {
            return false
        }
    },

    /**
     * @desc Verifica se o arquivo *filePathName* existe.
     * @param {string} filePathName - caminho absoluto ou relativo do arquivo que se deseja verificar a existência.
     * @returns {boolean} - *true* if the file exists; *false* if the file does not exist or its existence cannot be determined.
     */
    exists: function(filePathName) {
        return Files.exists(Paths.get(filePathName), java.nio.file.LinkOption.NOFOLLOW_LINKS)
    },

    /**
     * @desc Lê o conteúdo do arquivo *filePathName* e retorna em uma string.
     * @param {string} filePathName - caminho absoluto ou relativo do arquivo a ser lido e ter o seu conteúdo retornado.
     * @param {java.nio.charset.Charset} charset - o *charset* as ser usado para decodificação (default é UTF_8)
     * @returns {string} - o conteúdo do arquivo.
     * @throws Irá gerar uma exceção caso ocorra algum problema ao ler o arquivo.
     */
    readAll: function (filePathName, charSet) {
        var content = null
        var cs = charSet || StandardCharsets.UTF_8

        try {        
            content = new java.lang.String(Files.readAllBytes(Paths.get(filePathName)), cs)
        } catch (e) {
            // print('Error: ' + e.message);
            throw 'Unable to read file at: ' + filePathName + ', ' + e
        }
        return content
    },

    /**
     * @desc Lê o conteúdo do arquivo *filePathName* em formato JSON e retorna o objeto.
     * @param {string} filePathName - caminho absoluto ou relativo do arquivo a ser lido e ter o seu conteúdo retornado.
     * @param {java.nio.charset.Charset} charset - o *charset* as ser usado para decodificação (default é UTF_8)
     * @returns {string} - o conteúdo do arquivo.
     * @throws Irá gerar uma exceção caso ocorra algum problema ao ler o arquivo.
     */
    readJson: function (filePathName, charSet) {
        var content = null
        var cs = charSet || StandardCharsets.UTF_8

        try {        
            content = new java.lang.String(Files.readAllBytes(Paths.get(filePathName)), cs)
        } catch (e) {
            // print('Error: ' + e.message);
            throw 'Unable to read file at: ' + filePathName + ', ' + e
        }
        return JSON.parse(content)
    },

    /**
     * @desc Read all lines from a file as a Stream. Unlike readAllLines, this method does not read 
     *       all lines into a List, but instead populates lazily as the stream is consumed.
     * @param {string} fileObject - caminho absoluto ou relativo do arquivo a ser lido e ter o seu conteúdo retornado.
     * @param {java.nio.charset.Charset} charset - o *charset* as ser usado para decodificação (default é UTF_8)
     * @returns {java.util.stream.Stream<String>} - the lines from the file as a Stream.
     */
    lines: function (fileObject, charSet) {
        var cs = charSet || StandardCharsets.UTF_8

        if (typeof(fileObject) === "string") {
              return Files.lines(Paths.get(fileObject), cs)
        }
        
        var is_java_io_File = fileObject.class.getCanonicalName() === "java.io.File"
        if (fileObject.class || is_java_io_File) {
            return Files.lines(fileObject.toPath(), cs)
        }
        
        var is_java_io_InputStream = fileObject.class.getInterfaces()
            .find(function(item) {
                return item.getCanonicalName() === "java.io.InputStream" 
            }) !== undefined
        if (fileObject.class || is_java_io_InputStream) {
            return new BufferedReader(new InputStreamReader(inputStream, cs)).lines()
        }

        throw 'fileObject type is not valid on fs.lines function!'
    },

    /**
     * @desc Salva a string passada no parâmetro *content* para o arquivo definido por *fileName*.
     * @param {string} filePathName - caminho absoluto ou relativo do arquivo o qual receberá o conteúdo.
     * @param {string} content - o conteúdo a ser gravado no arquivo.
     */
    saveToFile: function(fileName, content) {
        Files.write(Paths.get(fileName), new java.lang.String(content).getBytes(), 
            StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE/*, StandardOpenOption.READ*/)
    }

}

exports = fs
