const fs = require('fs');
const path = require('path');

const bienvenidaPath = path.join(__dirname, "mensajes", "bienvenida.txt")
const bienvenida = fs.readFileSync(bienvenidaPath, "utf-8")

// Function to read a file and return its content
const readFileContent = (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.error(`Archivo no encontrado: ${filePath}`);
        return "No se pudo obtener el mensaje.";
    }
    try {
        return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
        console.error(`Error al leer el archivo: ${error.message}`);
        return "No se pudo obtener el mensaje.";
    }
};

const triajeNoPath = path.join(__dirname, "mensajes/Triaje", "triaje-no.txt")
const triajeNo = fs.readFileSync(triajeNoPath, "utf-8")

const numeroIdentidadPath = path.join(__dirname, "mensajes/Triaje", "numero-identidad.txt")
const numeroIdentidad = fs.readFileSync(numeroIdentidadPath, "utf-8")

const verifIdPath = path.join(__dirname, "mensajes/Triaje", "verif_id.txt")
const verifId = fs.readFileSync(verifIdPath, "utf-8")

const maxIntentosIdPath = path.join(__dirname, "mensajes/Triaje", "max_intentos_id.txt")
const maxIntentosId = fs.readFileSync(maxIntentosIdPath, "utf-8")
const getCategoryMessage = (finalPriority) => {
    const categoriaPath = path.join(__dirname, "mensajes/Categoria", `categoria${finalPriority}.txt`);
    return readFileContent(categoriaPath);
};

const encuestaBotPath = path.join(__dirname, "mensajes/Encuesta", "bot.txt")
const encuestaBot = fs.readFileSync(encuestaBotPath, "utf-8")

const encuestaAtencionPath = path.join(__dirname, "mensajes/Encuesta", "atencion_urgencia.txt")
const encuestaAtencion = fs.readFileSync(encuestaAtencionPath, "utf-8")

const seguimientoPath = path.join(__dirname, "mensajes/Seguimiento", "introduccion.txt")
const seguimientoIntroduccion = fs.readFileSync(seguimientoPath, "utf-8")

const gradoRecuperaciónPath = path.join(__dirname, "mensajes/Seguimiento", "grado_recuperacion.txt")
const gradoRecuperación = fs.readFileSync(gradoRecuperaciónPath, "utf-8")

const eventosPath = path.join(__dirname, "mensajes/Seguimiento", "eventos.txt")
const eventos = fs.readFileSync(eventosPath, "utf-8")

module.exports = {
    bienvenida,
    triajeNo,
    numeroIdentidad,
    verifId,
    maxIntentosId,
    getCategoryMessage,
    encuestaBot,
    encuestaAtencion,
    seguimientoIntroduccion,
    gradoRecuperación,
    eventos,
};

// module.exports = {
//     getCategoryMessage,
// };