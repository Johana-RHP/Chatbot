const { createBot, createProvider, createFlow, addKeyword,  EVENTS } = require('@bot-whatsapp/bot', 'some-bot-library');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const PostgreSQLAdapter = require('@bot-whatsapp/database/postgres');
require('dotenv').config();
const schedule = require('node-schedule'); // Importar la librería node-schedule
// const { numeroIdentidad, verifId, maxIntentosId, getCategoryMessage } = require('./leer_archivo');
const { bienvenida, triajeNo, numeroIdentidad, verifId, maxIntentosId, getCategoryMessage, encuestaAtencion, encuestaBot, eventos, gradoRecuperación, seguimientoIntroduccion } = require('./leer_archivo');
const { Pool } = require('pg');
const { delay } = require('@whiskeysockets/baileys');

let chatBotId = 0;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.POSTGRES_DB_HOST,
    user: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
    port: process.env.POSTGRES_DB_PORT,
    idleTimeoutMillis: 3600000, // Configurar el tiempo de inactividad
});

// Manejo de errores en la conexión de la base de datos
pool.on('error', (err) => {
    console.error('Error en la conexión con PostgreSQL:', err);
});

// Función para realizar consultas SQL
const queryDatabase = async (queryText, params) => {
    try {
        const result = await pool.query(queryText, params);
        return result;
    } catch (error) {
        console.error('Error en consulta SQL:', error);
        throw new Error('Error en la base de datos');
    }
};

const FlujoMotivoComplicacion = addKeyword(EVENTS.ACTION)
    .addAnswer('¿Motivo de la complicación médica?',  { capture: true }, async (ctx, { state}) => {
        console.log(`Motivo de la complicación médica`, ctx.body);

        // Actualizar la columna "motivo"
        const updateMotivoQuery = `
        UPDATE chat_seguimiento7 
        SET motivo = $1 
        WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateMotivoQuery, params);
            console.log("Motivo actualizado correctamente.");
        } catch (err) {
            console.error("Error al actualizar el motivo:", err);
        }
        }
    )
    .addAnswer([
        '¿Continua presentando el problema referido?',
        '👉 *Si*',
        '👉 *No*',],
        { capture: true }, async (ctx, { state, fallBack, endFlow}) => {
        // Capturamos la respuesta del usuario después de la bienvenida
        const userCM = ctx.body.toLowerCase();
        console.log(`¿continua?`, ctx.body);

        // Condicional para redirigir al flujo correspondiente
        if (userCM=== 'si' || userCM === 'sí') {
            const horaUTCcm = new Date();
            const fechaCM = new Date(horaUTCcm.getTime());
            const formattedDate = fechaCM.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            // Actualizar la columna "fecha_actual"
            const updateFechaActualQuery = `
                UPDATE chat_seguimiento7 
                SET fecha_actual = $1 
                WHERE chat_id = $2
                `;
            const params = [formattedDate, chatBotId];

            try {
                await queryDatabase(updateFechaActualQuery, params);
                console.log("Fecha actualizada correctamente.");
            } catch (err) {
                console.error("Error al actualizar la fecha actual:", err);
            }
            console.log('Fecha:', fechaCM.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
            return endFlow(`Gracias`);
        } else if (userCM === 'no') {
            return;
        } else {
            // Si la respuesta no es ni "sí" ni "no", usa flowDynamic para enviar un mensaje adicional
            return fallBack("Por favor, responde 'sí' o 'no' para continuar.");
        }
        }
    )
    .addAnswer('¿A que fecha dejo de presentar el problema referido? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state}) => {
        console.log(`¿A que fecha dejo de presentar el problema referido?`, ctx.body);
        // Actualizar la columna "fecha_inicio"
        const updateFechaComplicacionQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_complicacion = $1 
            WHERE chat_id = $2
            `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaComplicacionQuery, params);
            console.log("Fecha de inicio actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha de inicio:", err);
        }
        }
    );

const FlujoMotivoCirugia = addKeyword(EVENTS.ACTION)
    .addAnswer('¿Motivo de la cirugía de emergencia?',  { capture: true }, async (ctx, { state}) => {
        console.log(`Motivo de la cirugía de emergencia`, ctx.body);

        // Actualizar la columna "motivo"
        const updateMotivoQuery = `
        UPDATE chat_seguimiento7 
        SET motivo = $1 
        WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateMotivoQuery, params);
            console.log("Motivo actualizado correctamente.");
        } catch (err) {
            console.error("Error al actualizar el motivo:", err);
        }
        }
    )
    .addAnswer([
        '¿Ya se realizó la cirugía?',
        '👉 *Si*',
        '👉 *No*',],
        { capture: true }, async (ctx, { state, fallBack, endFlow}) => {
        // Capturamos la respuesta del usuario después de la bienvenida
        const userCE = ctx.body.toLowerCase();
        console.log(`¿Ya se realizó la cirugía?`, ctx.body);

        // Condicional para redirigir al flujo correspondiente
        if (userCE=== 'si' || userCE === 'sí') {
            return;
        } else if (userCE === 'no') {
            return;
        } else {
            // Si la respuesta no es ni "sí" ni "no", usa flowDynamic para enviar un mensaje adicional
            return fallBack("Por favor, responde 'sí' o 'no' para continuar.");
        }
        }
    )
    .addAnswer('¿En qué fecha se realiza la cirugía de emergencia? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state}) => {
        console.log(`¿En qué fecha se realiza la cirugía de emergencia?`, ctx.body);
        // Actualizar la columna "fecha_inicio"
        const updateFechaInicioQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_cirugia = $1 
            WHERE chat_id = $2
            `;
            const params = [ctx.body, chatBotId];

            try {
                await queryDatabase(updateFechaInicioQuery, params);
                console.log("Fecha de inicio actualizada correctamente.");
            } catch (err) {
                console.error("Error al actualizar la fecha de inicio:", err);
            }
        }
    );

const FlujoMotivoUCI = addKeyword(EVENTS.ACTION)
    .addAnswer('¿Motivo del ingreso a UCI?',  { capture: true }, async (ctx, { state}) => {
        console.log(`¿Motivo del ingreso a UCI?`, ctx.body);

        // Actualizar la columna "motivo"
        const updateMotivoQuery = `
        UPDATE chat_seguimiento7 
        SET motivo = $1 
        WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateMotivoQuery, params);
            console.log("Motivo actualizado correctamente.");
        } catch (err) {
            console.error("Error al actualizar el motivo:", err);
        }
        }
    )
    .addAnswer('¿Cuál es la fecha de ingreso a UCI? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state}) => {
        console.log(`¿Cuál es la fecha de inicio del ingreso a UCI?`, ctx.body);

        // Actualizar la columna "fecha_inicio"
        const updateFechaInicioQuery = `
        UPDATE chat_seguimiento7 
        SET fecha_inicio = $1 
        WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaInicioQuery, params);
            console.log("Fecha de inicio actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha de inicio:", err);
        }
        }
    )
    .addAnswer([
        '¿Se encuentra internado en UCI actualmente?',
        '👉 *Si*',
        '👉 *No*',],
        { capture: true }, async (ctx, { state, fallBack, endFlow}) => {
        // Capturamos la respuesta del usuario después de la bienvenida
        const userUCI = ctx.body.toLowerCase();
        console.log(`¿Se encuentra internado en UCI actualmente?`, ctx.body);

        // Condicional para redirigir al flujo correspondiente
        if (userUCI === 'si' || userUCI === 'sí') {
            const horaUTCuci = new Date();
            const fechaUCI = new Date(horaUTCuci.getTime());
            const formattedDate = fechaUCI.toISOString().split('T')[0]; // Formato YYYY-MM-DD

            // Actualizar la columna "fecha_actual"
            const updateFechaActualQuery = `
                UPDATE chat_seguimiento7 
                SET fecha_actual = $1 
                WHERE chat_id = $2
            `;
            const params = [formattedDate, chatBotId];

            try {
                await queryDatabase(updateFechaActualQuery, params);
                console.log("Fecha actualizada correctamente.");
            } catch (err) {
                console.error("Error al actualizar la fecha actual:", err);
            }
            console.log('Fecha:', fechaUCI.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
            return endFlow(`Gracias`);
        } else if (userUCI === 'no') {
            return;
        } else {
            // Si la respuesta no es ni "sí" ni "no", usa flowDynamic para enviar un mensaje adicional
            return fallBack("Por favor, responde 'sí' o 'no' para continuar.");
        }
        }
    )
    .addAnswer('¿Cuál es la fecha de alta del internamiento UCI? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state, fallBack}) => {
        console.log(`¿Cuál es la fecha de alta del internamiento UCI?`, ctx.body);

        // Actualizar la columna "fecha_final"
        const updateFechaFinalQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_final = $1 
            WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaFinalQuery, params);
            console.log("Fecha de alta actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha de alta:", err);
        }
        }
    );

const FlujoMotivoHospitalizacion = addKeyword(EVENTS.ACTION)
    .addAnswer(
        '¿Motivo de la hospitalización?',
        { capture: true },
        async (ctx, { state }) => {
            console.log(`¿Motivo de la hospitalización?`, ctx.body);

            // Actualizar la columna "motivo"
            const updateMotivoQuery = `
                UPDATE chat_seguimiento7 
                SET motivo = $1 
                WHERE chat_id = $2
            `;
            const params = [ctx.body, chatBotId];

            try {
                await queryDatabase(updateMotivoQuery, params);
                console.log("Motivo actualizado correctamente.");
            } catch (err) {
                console.error("Error al actualizar el motivo:", err);
            }
        }
    )
    .addAnswer(
        '¿Cuál es la fecha de inicio de la hospitalización? (YYYY-MM-DD)',
        { capture: true },
        async (ctx, { state, fallBack }) => {
            console.log(`¿Cuál es la fecha de inicio de la hospitalización?`, ctx.body);

        // Transformar la entrada del usuario a formato de fecha (YYYY-MM-DD)
        let formattedDate;
        try {
            const userInputDate = new Date(ctx.body);
            if (isNaN(userInputDate.getTime())) {
                throw new Error("Fecha inválida proporcionada por el usuario.");
            }
            formattedDate = userInputDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        } catch (err) {
            console.error("Error al procesar la fecha proporcionada:", err.message);
            return fallBack("Por favor, ingresa una fecha válida en formato YYYY-MM-DD.");
        }

        // Actualizar la columna "fecha_inicio"
        const updateFechaInicioQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_inicio = $1 
            WHERE chat_id = $2
        `;
        const params = [formattedDate, chatBotId];

        try {
            await queryDatabase(updateFechaInicioQuery, params);
            console.log("Fecha de inicio actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha de inicio:", err);
        }
    }
    )
    .addAnswer(
        [
            '¿Se encuentra hospitalizado actualmente?',
            '👉 *Si*',
            '👉 *No*',
        ],
        { capture: true },
        async (ctx, { state, fallBack, endFlow }) => {
            const userHospitalizado = ctx.body.toLowerCase();
            console.log(`¿Se encuentra hospitalizado actualmente?`, ctx.body);
            console.log('Último chatBotId obtenido:', chatBotId);

            if (userHospitalizado === 'si' || userHospitalizado === 'sí') {
                const horaUTCh = new Date();
                const fechaHospitalizado = new Date(horaUTCh.getTime());
                const formattedDate = fechaHospitalizado.toISOString().split('T')[0]; // Formato YYYY-MM-DD

                // Actualizar la columna "fecha_actual"
                const updateFechaActualQuery = `
                    UPDATE chat_seguimiento7 
                    SET fecha_actual = $1 
                    WHERE chat_id = $2
                `;
                const params = [formattedDate, chatBotId];

                try {
                    await queryDatabase(updateFechaActualQuery, params);
                    console.log("Fecha actualizada correctamente.");
                } catch (err) {
                    console.error("Error al actualizar la fecha actual:", err);
                }

                return endFlow(`Gracias por tu respuesta.`);
            } else if (userHospitalizado === 'no') {
                return;
            } else {
                return fallBack("Por favor, responde 'sí' o 'no' para continuar.");
            }
        }
    )
    .addAnswer(
        '¿Cuál es la fecha de alta de la hospitalización?',
        { capture: true },
        async (ctx, { state, fallBack }) => {
            console.log(`¿Cuál es la fecha de alta de la hospitalización?`, ctx.body);
        // Transformar la entrada del usuario a formato de fecha (YYYY-MM-DD)
        let formattedDate;
        try {
            const userInputDate = new Date(ctx.body);
            if (isNaN(userInputDate.getTime())) {
                throw new Error("Fecha inválida proporcionada por el usuario.");
            }
            formattedDate = userInputDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        } catch (err) {
            console.error("Error al procesar la fecha proporcionada:", err.message);
            return fallBack("Por favor, ingresa una fecha válida en formato YYYY-MM-DD.");
        }

        // Actualizar la columna "fecha_final"
        const updateFechaFinalQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_final = $1 
            WHERE chat_id = $2
        `;
        const params = [formattedDate, chatBotId];

        try {
            await queryDatabase(updateFechaFinalQuery, params);
            console.log("Fecha final actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha final:", err);
        }
        }
    );

const FlujoMasEventos = addKeyword(EVENTS.ACTION)
    .addAnswer(
        '¿Motivo del evento presentado?',
        { capture: true },
        async (ctx, { state }) => {
            console.log(`Evento`, ctx.body);

            // Actualizar la columna "motivo"
            const updateMotivoQuery = `
                UPDATE chat_seguimiento7 
                SET motivo = $1 
                WHERE chat_id = $2
            `;
            const params = [ctx.body, chatBotId];

            try {
                await queryDatabase(updateMotivoQuery, params);
                console.log("Evento actualizado correctamente.");
            } catch (err) {
                console.error("Error al actualizar el evento:", err);
            }
        }
    )
    .addAnswer('¿Cuál es la fecha de inicio? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state}) => {
        console.log(`¿Cuál es la fecha de inicio?`, ctx.body);

        // Actualizar la columna "fecha_inicio"
        const updateFechaInicioQuery = `
        UPDATE chat_seguimiento7 
        SET fecha_inicio = $1 
        WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaInicioQuery, params);
            console.log("Fecha de inicio actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha de inicio:", err);
        }
        }
    )
    .addAnswer('¿Cuál es la fecha final del evento? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state, fallBack}) => {
        console.log(`¿Cuál es la fecha final del evento?`, ctx.body);

        // Actualizar la columna "fecha_final"
        const updateFechaFinalQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_final = $1 
            WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaFinalQuery, params);
            console.log("Fecha de final del evento");
        } catch (err) {
            console.error("Error al actualizar la fecha final del evento:", err);
        }
        }
    );

// Capturar el comentario del usuario
const FlujoOtroEvento = addKeyword(EVENTS.ACTION)
    .addAnswer(
        '¿Qué evento a presentado?',
        { capture: true },
        async (ctx, { state }) => {
            console.log(`Evento`, ctx.body);

            // Actualizar la columna "motivo"
            const updateMotivoQuery = `
                UPDATE chat_seguimiento7 
                SET otro_evento = $1 
                WHERE chat_id = $2
            `;
            const params = [ctx.body, chatBotId];

            try {
                await queryDatabase(updateMotivoQuery, params);
                console.log("Evento actualizado correctamente.");
            } catch (err) {
                console.error("Error al actualizar el evento:", err);
            }
        }
    )
    .addAnswer('¿Cuál es la fecha de inicio? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state}) => {
        console.log(`¿Cuál es la fecha de inicio?`, ctx.body);

        // Actualizar la columna "fecha_inicio"
        const updateFechaInicioQuery = `
        UPDATE chat_seguimiento7 
        SET fecha_inicio = $1 
        WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaInicioQuery, params);
            console.log("Fecha de inicio actualizada correctamente.");
        } catch (err) {
            console.error("Error al actualizar la fecha de inicio:", err);
        }
        }
    )
    .addAnswer('¿Cuál es la fecha final del evento? (YYYY-MM-DD)',  { capture: true }, async (ctx, { state, fallBack}) => {
        console.log(`¿Cuál es la fecha final del evento?`, ctx.body);

        // Actualizar la columna "fecha_final"
        const updateFechaFinalQuery = `
            UPDATE chat_seguimiento7 
            SET fecha_final = $1 
            WHERE chat_id = $2
        `;
        const params = [ctx.body, chatBotId];

        try {
            await queryDatabase(updateFechaFinalQuery, params);
            console.log("Fecha de final del evento");
        } catch (err) {
            console.error("Error al actualizar la fecha final del evento:", err);
        }
        }
    );

const globalSessionStore = {}; // Almacenamiento temporal global

const flujoEventos = addKeyword(EVENTS.ACTION)
    .addAnswer(eventos, { capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        // Identificar al usuario por un ID único
        const userId = ctx.userId || "default_user"; // Usa ctx.userId o un valor único disponible

        // Inicializar o recuperar la sesión desde el almacenamiento global
        if (!globalSessionStore[userId]) {
            globalSessionStore[userId] = { history: [] };
        }

        // Almacenar la respuesta actual en el historial
        const session = globalSessionStore[userId];
        session.history.push(ctx.body);

        // Obtener el último id de la tabla "chat_patient"
        try {
            const chatPatientQuery = 'SELECT id FROM "chat_patient" ORDER BY id DESC LIMIT 1';
            const chatPatientResult = await queryDatabase(chatPatientQuery);

            if (chatPatientResult.rowCount > 0) {
                chatBotId = chatPatientResult.rows[0].id; // Actualizar chatBotId
                console.log('Último chatBotId obtenido:', chatBotId);
            } else {
                console.error("No se encontró ningún registro en la tabla chat_patient.");
                return fallBack("No se pudo recuperar el último ID de la base de datos.");
            }
        } catch (error) {
            console.error("Error al obtener el último chatBotId:", error);
            return fallBack("Hubo un problema al acceder a la base de datos. Inténtelo más tarde.");
        }

        console.log("Estado actual de ctx.session:", JSON.stringify(session, null, 2));

        // Validar la respuesta
        if (!["0", "1", "2", "3", "4", "5"].includes(ctx.body)) {
            return fallBack("Respuesta no válida.");
        }

        // Si es la primera interacción del usuario, registrar la hora de la interacción
        if (session.history.length === 1) {
            const horaSeguimiento = new Date(); // Captura la hora actual

            // Insertar en la tabla chat_seguimiento7
            const insertQuery = `
                INSERT INTO chat_seguimiento7 (
                    hora_seguimiento, 
                    chat_id, 
                    hospitalizado, 
                    uci, 
                    cirugia, 
                    complicacion_medica
                ) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const params = [
                horaSeguimiento, // hora_seguimiento
                chatBotId, // chat_id (último id obtenido de chat_patient)
                0, // hospitalizado (valor por defecto)
                0, // uci (valor por defecto)
                0, // cirugia (valor por defecto)
                0  // complicacion_medica (valor por defecto)
            ];

            try {
                await queryDatabase(insertQuery, params); // Ejecuta la inserción
                console.log("Primera interacción registrada en chat_seguimiento7.");
            } catch (err) {
                console.error("Error al insertar en chat_seguimiento7:", err);
            }
        }

        // Actualizar la tabla 'chat_seguimiento7' dependiendo de la respuesta
        let updateQuery = '';
        let updateParams = [];
        if (ctx.body === "1") {
            updateQuery = `
                UPDATE chat_seguimiento7 
                SET hospitalizado = 1
                WHERE chat_id = $1
            `;
            updateParams = [chatBotId];
        } else if (ctx.body === "2") {
            updateQuery = `
                UPDATE chat_seguimiento7 
                SET uci = 1
                WHERE chat_id = $1
            `;
            updateParams = [chatBotId];
        } else if (ctx.body === "3") {
            updateQuery = `
                UPDATE chat_seguimiento7 
                SET cirugia = 1
                WHERE chat_id = $1
            `;
            updateParams = [chatBotId];
        } else if (ctx.body === "4") {
            updateQuery = `
                UPDATE chat_seguimiento7 
                SET complicacion_medica = 1
                WHERE chat_id = $1
            `;
            updateParams = [chatBotId];
        }

        // Ejecutar la actualización si es necesario
        if (updateQuery) {
            try {
                await queryDatabase(updateQuery, updateParams);
                console.log(`Columna actualizada para el evento: ${ctx.body}`);
            } catch (err) {
                console.error("Error al actualizar en chat_seguimiento7:", err);
            }
        }

        // Procesar respuesta para "5"
        if (ctx.body === "5") {
            return gotoFlow(FlujoOtroEvento);
        }

        // Procesar respuesta para "0"
        if (ctx.body === "0") {
            const interactionsCount = session.history.length;
            const firstInteraction = session.history[0];

            if (interactionsCount === 1 && firstInteraction === "0") {
                // Primera interacción fue 0
                await flowDynamic("El flujo ha terminado.");
            }

            if (interactionsCount === 2 && firstInteraction !== "0") {
                switch (firstInteraction) {
                    case "1":
                        return gotoFlow(FlujoMotivoHospitalizacion);
                    case "2":
                        return gotoFlow(FlujoMotivoUCI);
                    case "3":
                        return gotoFlow(FlujoMotivoCirugia);
                    case "4":
                        return gotoFlow(FlujoMotivoComplicacion);
                }
            }

            if (interactionsCount > 2) {
                // Más de dos interacciones
                return gotoFlow(FlujoMasEventos);
            }
        } else {
            await flowDynamic(
                "Si tiene adicional otro evento, escribir el número de lo contrario colocar 0:"
            );
            console.log("Historial de respuestas:", session.history);
            return gotoFlow(flujoEventos);
        }
    });

const flujoSeguimiento = addKeyword(EVENTS.ACTION)
    .addAnswer(seguimientoIntroduccion)
    .addAnswer(
        gradoRecuperación,
        { capture: true, },
        async(ctx, { gotoFlow, fallBack }) =>{
            if (!["1", "2", "3", "4", "5"].includes(ctx.body)) {
                return fallBack ("Respuesta no válida.");
            }
            switch (ctx.body) {
                case "1":
                    return gotoFlow(flujoEventos);
                case "2":
                    return gotoFlow(flujoEventos);
                case "3":
                    return gotoFlow(flujoEventos);
                case "4":
                    return gotoFlow(flujoEventos);
                case "5":
                    return gotoFlow(flujoEventos);
            }
        }
    );

const flowAtencionRegular = addKeyword(EVENTS.ACTION)
.addAnswer("Deje su comentario.", { capture: true }, async (ctx, { state, flowDynamic, gotoFlow }) => {
    console.log(`Comentario del usuario: `, ctx.body);

    // Obtener el último id de la tabla chat_encuesta
    const result = await queryDatabase(
        'SELECT chat_id FROM "chat_encuesta" WHERE chat_id = $1 ORDER BY chat_id DESC LIMIT 1',
        [chatBotId] // Pasamos chatBotId como parámetro
    );

    if (result.rowCount > 0) {
        const lastChatEncuestaId = result.rows[0].chat_id;
        console.log('Último id de chat_encuesta:', lastChatEncuestaId);

        // Actualizar la columna opinion_atencion con el comentario del usuario
        await queryDatabase(
            'UPDATE "chat_encuesta" SET opinion_atencion = $1 WHERE id = $2',
            [ctx.body, lastChatEncuestaId]
        );
        console.log(`Valor de opinion_atencion actualizado con: ${ctx.body}`);
    } else {
        console.log('No se encontró ningún registro en chat_encuesta.');
    }

    await flowDynamic('Gracias por responder la encuesta');
        const hora = new Date();
        const horaEncuestaAtencion = new Date(hora.getTime());

        const horaSeguimiento = new Date(horaEncuestaAtencion.getTime());
        horaSeguimiento.setSeconds(horaSeguimiento.getSeconds() + 5);

        console.log('Hora de la encuesta Atención:', horaEncuestaAtencion.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
        console.log('Hora del seguimiento:', horaSeguimiento.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
        // Programar el envío del seguimiento
        schedule.scheduleJob(horaSeguimiento, function () {
            console.log('gotoFlow enviado');
            return gotoFlow(flujoSeguimiento);
        });
    })

const flowAtencionMala = addKeyword(EVENTS.ACTION)
    .addAnswer("Deje su comentario.", { capture: true }, async (ctx, { state, flowDynamic, gotoFlow }) => {
        console.log(`Comentario del usuario: `, ctx.body);

        // Obtener el último id de la tabla chat_encuesta
        const result = await queryDatabase(
            'SELECT chat_id FROM "chat_encuesta" WHERE chat_id = $1 ORDER BY chat_id DESC LIMIT 1',
            [chatBotId] // Pasamos chatBotId como parámetro
        );

        if (result.rowCount > 0) {
            const lastChatEncuestaId = result.rows[0].chat_id;
            console.log('Último id de chat_encuesta:', lastChatEncuestaId);

            // Actualizar la columna opinion_atencion con el comentario del usuario
            await queryDatabase(
                'UPDATE "chat_encuesta" SET opinion_atencion = $1 WHERE id = $2',
                [ctx.body, lastChatEncuestaId]
            );
            console.log(`Valor de opinion_atencion actualizado con: ${ctx.body}`);
        } else {
            console.log('No se encontró ningún registro en chat_encuesta.');
        }

        await flowDynamic('Gracias por responder la encuesta');
        const hora = new Date();
        const horaEncuestaAtencion = new Date(hora.getTime());

        const horaSeguimiento = new Date(horaEncuestaAtencion.getTime());
        horaSeguimiento.setSeconds(horaSeguimiento.getSeconds() + 5);

        console.log('Hora de la encuesta Atención:', horaEncuestaAtencion.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
        console.log('Hora del seguimiento:', horaSeguimiento.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
        // Programar el envío del seguimiento
        schedule.scheduleJob(horaSeguimiento, function () {
            console.log('gotoFlow enviado');
            return gotoFlow(flujoSeguimiento);
        });
        });

const flowEncuestaAtencion = addKeyword(EVENTS.ACTION)
    .addAnswer(
        encuestaAtencion,
        { capture: true },
        async(ctx, { gotoFlow, fallBack, flowDynamic}) =>{
            if (!["1", "2", "3"].includes(ctx.body)) {
                return fallBack ("Respuesta no válida.");
            }

            // Obtener el último id de la tabla chat_encuesta
            const result = await queryDatabase(
                'SELECT chat_id FROM "chat_encuesta" WHERE chat_id = $1 ORDER BY chat_id DESC LIMIT 1',
                [chatBotId] // Pasamos chatBotId como parámetro
            );

            if (result.rowCount > 0) {
                const lastChatEncuestaId = result.rows[0].chat_id;
                console.log('Último id de chat_encuesta:', lastChatEncuestaId);

                // Actualizar la columna encuesta_atencion con la opción seleccionada
                await queryDatabase(
                    'UPDATE "chat_encuesta" SET encuesta_atencion = $1 WHERE id = $2',
                    [ctx.body, lastChatEncuestaId]
                );
                console.log(`Valor de encuesta_atencion actualizado con: ${ctx.body}`);
            } else {
                console.log('No se encontró ningún registro en chat_encuesta.');
            }

            switch (ctx.body) {
                case "1":
                    await flowDynamic('Gracias por responder la encuesta');
                    const hora = new Date();
                    const horaEncuestaAtencion = new Date(hora.getTime());

                    const horaSeguimiento = new Date(horaEncuestaAtencion.getTime());
                    horaSeguimiento.setSeconds(horaSeguimiento.getSeconds() + 5);

                    console.log('Hora de la encuesta Atención:', horaEncuestaAtencion.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
                    console.log('Hora del seguimiento:', horaSeguimiento.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
                    // Programar el envío del seguimiento
                    schedule.scheduleJob(horaSeguimiento, function () {
                        console.log('gotoFlow enviado');
                        return gotoFlow(flujoSeguimiento);
                    });
                    break;
                case "2":
                    return gotoFlow(flowAtencionRegular);
                case "3":
                    return gotoFlow(flowAtencionMala);
            }
        }
    );

const flowBotMala = addKeyword(EVENTS.ACTION)
    .addAnswer("Dejar su opinión", 
        {capture: true},
        async(ctx, { gotoFlow, state }) => {
            console.log(`Comentario del usuario: `, ctx.body)
            // Obtener el último id de la tabla chat_encuesta
            const result = await queryDatabase(
                'SELECT chat_id FROM "chat_encuesta" WHERE chat_id = $1 ORDER BY chat_id DESC LIMIT 1',
                [chatBotId] // Pasamos chatBotId como parámetro
            );

            if (result.rowCount > 0) {
                const lastChatEncuestaId = result.rows[0].chat_id;
                console.log('Último id de chat_encuesta:', lastChatEncuestaId);

                // Actualizar la columna opinion_bot con el comentario del usuario
                await queryDatabase(
                    'UPDATE "chat_encuesta" SET opinion_bot = $1 WHERE id = $2',
                    [ctx.body, lastChatEncuestaId]
                );
                console.log(`Valor de opinion_bot actualizado con: ${ctx.body}`);
            } else {
                console.log('No se encontró ningún registro en chat_encuesta.');
            }

            return gotoFlow(flowEncuestaAtencion);
        }
    )

const flowBotRegular = addKeyword(EVENTS.ACTION)
    .addAnswer(
        "Dejar su opinión", 
        { capture: true },
        async (ctx, { gotoFlow, state }) => {
            console.log(`Comentario del usuario: `, ctx.body);

            try {
                // Obtener el último chat_id de la tabla chat_encuesta que coincide con chatBotId
                const result = await queryDatabase(
                    'SELECT chat_id FROM "chat_encuesta" WHERE chat_id = $1 ORDER BY chat_id DESC LIMIT 1',
                    [chatBotId] // Pasamos chatBotId como parámetro
                );

                if (result.rowCount > 0) {
                    const lastChatEncuestaId = result.rows[0].chat_id; // Extraemos el último chat_id
                    console.log('Último chat_id de chat_encuesta:', lastChatEncuestaId);

                    // Actualizar la columna opinion_bot con el comentario del usuario
                    await queryDatabase(
                        'UPDATE "chat_encuesta" SET opinion_bot = $1 WHERE chat_id = $2',
                        [ctx.body, lastChatEncuestaId] // Pasamos el comentario y el chat_id
                    );
                    console.log(`Valor de opinion_bot actualizado con: ${ctx.body}`);
                } else {
                    console.log('No se encontró ningún registro en chat_encuesta con el chatBotId proporcionado.');
                }
            } catch (error) {
                console.error('Error en el flujo de actualización:', error);
            }

            return gotoFlow(flowEncuestaAtencion); // Redirigir al flujo deseado
        }
    );

// Flujo de encuesta
const flujoEncuesta = addKeyword(EVENTS.ACTION)
    .addAnswer(
        encuestaBot,
        { capture: true },
        async (ctx, { gotoFlow, fallBack }) => {
            console.log("Iniciando la encuesta...");
            if (!["1", "2", "3"].includes(ctx.body)) {
                return fallBack("Respuesta no válida.");
            }
            
            // Obtener el último id de la tabla chat_encuesta
            const result = await queryDatabase(
                'SELECT chat_id FROM "chat_encuesta" WHERE chat_id = $1 ORDER BY chat_id DESC LIMIT 1',
                [chatBotId] // Pasamos chatBotId como parámetro
            );

            if (result.rowCount > 0) {
                const lastChatEncuestaId = result.rows[0].chat_id;
                console.log('Último id de chat_encuesta:', lastChatEncuestaId);

                // Actualizar la columna encuesta_bot con el valor elegido (1, 2 o 3)
                await queryDatabase(
                    'UPDATE "chat_encuesta" SET encuesta_bot = $1 WHERE id = $2',
                    [ctx.body, lastChatEncuestaId]
                );
                console.log(`Valor de encuesta_bot actualizado con la opción: ${ctx.body}`);
            } else {
                console.log('No se encontró ningún registro en chat_encuesta.');
            }

            switch (ctx.body) {
                case "1":
                    return gotoFlow(flowEncuestaAtencion);
                case "2":
                    return gotoFlow(flowBotRegular);
                case "3":
                    return gotoFlow(flowBotMala);
            }
        }
    );

const flujoTriajeSi = addKeyword(EVENTS.ACTION)
    .addAnswer(numeroIdentidad, { capture: true }, async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
        const docIdentidad = ctx.body;
        console.log('DNI recibido:', docIdentidad);

        try {
            // Buscar el paciente en "Modulo_patient"
            const result = await queryDatabase(
                'SELECT id, dni, name, lastname FROM "Modulo_patient" WHERE dni = $1 LIMIT 1',
                [docIdentidad]
            );

            if (result.rowCount > 0) {
                const { id: patient_id, dni, name, lastname } = result.rows[0];
                const telefono = ctx.from;
                console.log('Datos del paciente obtenidos:', { patient_id, dni, name, lastname });

                // Insertar datos en "chat_patient"
                await queryDatabase(
                    'INSERT INTO "chat_patient" (patient_id, dni, name, lastname, telefono) VALUES ($1, $2, $3, $4, $5)',
                    [patient_id, dni, name, lastname, telefono]
                );

                // Obtener el attention_id desde "Modulo_attention" usando patient_id
                const attentionResult = await queryDatabase(
                    'SELECT id FROM "Modulo_attention" WHERE patient_id = $1 LIMIT 1',
                    [patient_id]
                );

                if (attentionResult.rowCount > 0) {
                    const attentionId = attentionResult.rows[0].id;
                    console.log('attention_id obtenido:', attentionId);

                    // Actualizar el campo attention_id en "chat_patient"
                    await queryDatabase(
                        'UPDATE "chat_patient" SET attention_id = $1 WHERE patient_id = $2',
                        [attentionId, patient_id]
                    );
                    console.log('Actualización de attention_id completada.');

                    // Obtener final_priority desde "Modulo_evaluation" usando attention_id
                    const evaluationResult = await queryDatabase(
                        'SELECT final_priority FROM "Modulo_evaluation" WHERE attention_id = $1 LIMIT 1',
                        [attentionId]
                    );

                    if (evaluationResult.rowCount > 0) {
                        const finalPriority = evaluationResult.rows[0].final_priority;
                        console.log('final_priority obtenido:', finalPriority);

                        // Actualizar el campo final_priority en "chat_patient"
                        await queryDatabase(
                            'UPDATE "chat_patient" SET final_priority = $1 WHERE patient_id = $2',
                            [finalPriority, patient_id]
                        );
                        console.log('Actualización de final_priority completada.');

                        // Registrar fecha y hora de envío de categoría
                        const categoriaMensaje = getCategoryMessage(finalPriority);
                        await flowDynamic(categoriaMensaje);

                        const horaUTC = new Date();
                        const horaCategoria = new Date(horaUTC.getTime());
                        await queryDatabase(
                            'UPDATE "chat_patient" SET categoria_sent_at = $1 WHERE patient_id = $2',
                            [horaCategoria, patient_id]
                        );
                        // const horaEncuesta = new Date(horaCategoria.getTime());
                        // horaEncuesta.setMinutes(horaEncuesta.getMinutes() + 1);

                        const horaEncuesta = new Date(horaCategoria.getTime());
                        horaEncuesta.setSeconds(horaEncuesta.getSeconds() + 5);

                        // Obtener el id verdadero de chat_patient
                        const getChatPatientIdQuery = `
                            SELECT id 
                            FROM "chat_patient" 
                            WHERE patient_id = $1;
                        `;
                        const chatPatientResult = await queryDatabase(getChatPatientIdQuery, [patient_id]);

                        if (chatPatientResult.rowCount > 0) {
                            const chatId = chatPatientResult.rows[0].id;
                            chatBotId = chatId; // Guardar el valor en la variable global
                            console.log('chatBotId actualizado:', chatBotId);

                            // Insertar en "chat_encuesta"
                            await queryDatabase(
                                'INSERT INTO "chat_encuesta" (hora_encuesta, chat_id) VALUES ($1, $2)',
                                [horaEncuesta, chatId]
                            );
                            console.log("Registro insertado correctamente en chat_encuesta.");
                        } else {
                            console.error("No se encontró un registro en chat_patient con ese patient_id.");
                        }

                        console.log('Hora de la categoría:', horaCategoria.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
                        console.log('Hora de la encuesta:', horaEncuesta.toLocaleString('es-PE', { timeZone: 'America/Lima' }));

                        // Programar el envío de encuesta
                        schedule.scheduleJob(horaEncuesta, function () {
                            console.log('gotoFlow enviado');
                            return gotoFlow(flujoEncuesta);
                        });

                    } else {
                        console.log('final_priority no disponible.');
                    }
                } else {
                    console.log('attention_id no encontrado en Modulo_attention.');
                }
            } else {
                intentosFallidos++;
                console.log(`Intentos fallidos: ${intentosFallidos}`);
                if (intentosFallidos >= 3) {
                    return fallBack(maxIntentosId);
                }
                return fallBack(verifId);
            }
        } catch (error) {
            console.error("Error en el flujo principal:", error);
            return fallBack("Hubo un problema al verificar el DNI. Inténtelo más tarde.");
        }
    });

const flujoTriajeNo = addKeyword(EVENTS.ACTION)
    .addAnswer(triajeNo)

const FlujoBienvenida = addKeyword(["hola"])
    .addAnswer(
        bienvenida,
        { capture: true },
        async (ctx, { gotoFlow, fallBack }) => {
            console.log(ctx.from);       // Muestra el ID del usuario
            console.log(ctx.pushName);   // Muestra el nombre del usuario

            // Capturamos la respuesta del usuario después de la bienvenida
            const userResponse = ctx.body.toLowerCase();

            // Condicional para redirigir al flujo correspondiente
            if (userResponse === 'si' || userResponse === 'sí') {
                return gotoFlow(flujoTriajeSi);
            } else if (userResponse === 'no') {
                return gotoFlow(flujoTriajeNo);
            } else {
                // Si la respuesta no es ni "sí" ni "no", usa flowDynamic para enviar un mensaje adicional
                return fallBack("Por favor, responde 'sí' o 'no' para continuar.");
            }
        }
    );

// Función principal para iniciar el bot
const main = async () => {
    const adapterDB = new PostgreSQLAdapter({
        host: process.env.POSTGRES_DB_HOST,
        user: process.env.POSTGRES_DB_USER,
        database: process.env.POSTGRES_DB_NAME,
        password: process.env.POSTGRES_DB_PASSWORD,
        port: process.env.POSTGRES_DB_PORT,
    });

    const adapterFlow = createFlow([FlujoBienvenida, flujoTriajeNo, flujoTriajeSi, flujoEncuesta, flowEncuestaAtencion, flowBotRegular, flowBotMala, flowAtencionMala, flowAtencionRegular, flujoSeguimiento, flujoEventos, FlujoOtroEvento, FlujoMotivoHospitalizacion, FlujoMotivoUCI, FlujoMotivoCirugia, FlujoMotivoComplicacion, FlujoMasEventos ]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

// Iniciar la aplicación
main().catch((error) => {
    console.error('Error al iniciar el bot:', error);
});