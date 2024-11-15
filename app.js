const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const PostgreSQLAdapter = require('@bot-whatsapp/database/postgres')
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.POSTGRES_DB_HOST,
    user: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
    port: process.env.POSTGRES_DB_PORT,
    idleTimeoutMillis: 30000, // Configurar el tiempo de inactividad
});

pool.on('error', (err) => {
    console.error('Error en la conexión con PostgreSQL:', err);
    // Aquí podrías intentar reconectar o manejar la interrupción
});

module.exports = pool;

// const pool = new Pool({
//     host: process.env.POSTGRES_DB_HOST,
//     user: process.env.POSTGRES_DB_USER,
//     database: process.env.POSTGRES_DB_NAME,
//     password: process.env.POSTGRES_DB_PASSWORD,
//     port: process.env.POSTGRES_DB_PORT,
// });

// let intentosFallidos = 0; // Contador de intentos fallidos

// const flujoTriajeSi = addKeyword('hola')
//     .addAnswer('numeroIdentidad', { capture: true }, async (ctx, { fallBack, flowDynamic }) => {
//         const docIdentidad = ctx.body;

//         try {
//             // Realizar la consulta para verificar el DNI y obtener las columnas necesarias
//             const result = await pool.query(
//                 'SELECT id, dni, name, lastname FROM "Modulo_patient" WHERE dni = $1 LIMIT 1',
//                 [docIdentidad]
//             );

//             // Verificar si el DNI fue encontrado en la base de datos
//             if (result.rowCount > 0) {
//                 // Si el DNI es encontrado, obtener los valores
//                 const { id, dni, name, lastname } = result.rows[0];

//                 // Obtener el telefono desde ctx.from
//                 const telefono = ctx.from;

//                 // Copiar los datos de Modulo_patient a Chat_patient, incluyendo el teléfono
//                 await pool.query(
//                     'INSERT INTO "chat_patient" (patient_id, dni, name, lastname, telefono) VALUES ($1, $2, $3, $4, $5)',
//                     [id, dni, name, lastname, telefono]
//                 );

//                 // Buscar el attention_id correspondiente al patient_id
//                 const attentionResult = await pool.query(
//                     'SELECT id FROM "Modulo_attention" WHERE patient_id = $1 LIMIT 1',
//                     [id]
//                 );

//                 // Si se encuentra el attention_id, insertar en la tabla chat_patient
//                 if (attentionResult.rowCount > 0) {
//                     const attention_id = attentionResult.rows[0].id;
//                     await pool.query(
//                         'UPDATE "chat_patient" SET attention_id = $1 WHERE patient_id = $2',
//                         [attention_id, id]
//                     );
//                 }

//                 // Responder que los datos fueron correctamente copiados
//                 await flowDynamic('DNI verificado, datos copiados exitosamente, y atención asociada.');
//             } else {
//                 intentosFallidos++;
//                 if (intentosFallidos >= 3) {
//                     return fallBack('maxIntentosId');
//                 }
//                 return fallBack('verifId');
//             }
//         } catch (error) {
//             console.error("Error en la consulta de verificación del DNI:", error);
//             return fallBack("Hubo un problema al verificar el DNI. Inténtelo más tarde.");
//         }

//         intentosFallidos = 0; // Reiniciar el contador si se encuentra un número válido
//     })
//     .addAnswer('categoría');

let intentosFallidos = 0; // Contador de intentos fallidos

const flujoTriajeSi = addKeyword('hola')
    .addAnswer('numeroIdentidad', { capture: true }, async (ctx, { fallBack, flowDynamic }) => {
        const docIdentidad = ctx.body;

        try {
            // Realizar la consulta para verificar el DNI y obtener las columnas necesarias
            const result = await pool.query(
                'SELECT id, dni, name, lastname FROM "Modulo_patient" WHERE dni = $1 LIMIT 1',
                [docIdentidad]
            );

            // Verificar si el DNI fue encontrado en la base de datos
            if (result.rowCount > 0) {
                // Si el DNI es encontrado, obtener los valores
                const { id, dni, name, lastname } = result.rows[0];

                // Obtener el telefono desde ctx.from
                const telefono = ctx.from;

                // Copiar los datos de Modulo_patient a Chat_patient, incluyendo el teléfono
                await pool.query(
                    'INSERT INTO "chat_patient" (patient_id, dni, name, lastname, telefono) VALUES ($1, $2, $3, $4, $5)',
                    [id, dni, name, lastname, telefono]
                );

                // Buscar el attention_id correspondiente al patient_id
                const attentionResult = await pool.query(
                    'SELECT id FROM "Modulo_attention" WHERE patient_id = $1 LIMIT 1',
                    [id]
                );

                // Si se encuentra el attention_id, insertar en la tabla chat_patient
                if (attentionResult.rowCount > 0) {
                    const attention_id = attentionResult.rows[0].id;
                    await pool.query(
                        'UPDATE "chat_patient" SET attention_id = $1 WHERE patient_id = $2',
                        [attention_id, id]
                    );

                    // Buscar el final_priority correspondiente al attention_id en Modulo_evaluation
                    const evaluationResult = await pool.query(
                        'SELECT final_priority FROM "Modulo_evaluation" WHERE attention_id = $1 LIMIT 1',
                        [attention_id]
                    );

                    // Si se encuentra el final_priority, insertar en la tabla chat_patient
                    if (evaluationResult.rowCount > 0) {
                        const final_priority = evaluationResult.rows[0].final_priority;
                        await pool.query(
                            'UPDATE "chat_patient" SET final_priority = $1 WHERE patient_id = $2',
                            [final_priority, id]
                        );
                    }
                }

                // Responder que los datos fueron correctamente copiados
                await flowDynamic('DNI verificado, datos copiados exitosamente, atención asociada y prioridad final actualizada.');
            } else {
                intentosFallidos++;
                if (intentosFallidos >= 3) {
                    return fallBack('maxIntentosId');
                }
                return fallBack('verifId');
            }
        } catch (error) {
            console.error("Error en la consulta de verificación del DNI:", error);
            return fallBack("Hubo un problema al verificar el DNI. Inténtelo más tarde.");
        }

        intentosFallidos = 0; // Reiniciar el contador si se encuentra un número válido
    })
    .addAnswer('categoría');

const main = async () => {
    const adapterDB = new PostgreSQLAdapter({
        host: process.env.POSTGRES_DB_HOST,
        user: process.env.POSTGRES_DB_USER,
        database: process.env.POSTGRES_DB_NAME,
        password: process.env.POSTGRES_DB_PASSWORD,
        port: process.env.POSTGRES_DB_PORT,
    })
    const adapterFlow = createFlow([flujoTriajeSi])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()