import { existsSync } from "node:fs";
import { basename } from "node:path";
import nodemailer from "nodemailer";

// Tudo vem de variável de ambiente: o endereço nunca fica fixo no código.
// NOTIFY_EMAIL, SMTP_* e SMTP_FROM vêm do compose; as demais, do próprio Jenkins.
const { NOTIFY_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_FROM } = process.env;
// Só para servidor real (Gmail, por exemplo). Com o Mailpit, ficam vazias e não há login.
const { SMTP_USER, SMTP_PASS } = process.env;
const { BUILD_STATUS, JOB_NAME, BUILD_NUMBER, BUILD_URL, GIT_COMMIT } = process.env;

for (const [name, value] of Object.entries({ NOTIFY_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_FROM })) {
    if (!value) {
        console.error(`Variável de ambiente ausente: ${name}`);
        process.exit(1);
    }
}

if (SMTP_USER && !SMTP_PASS) {
    console.error("SMTP_USER definido sem SMTP_PASS");
    process.exit(1);
}

// Os argumentos são caminhos de arquivos para anexar. Os que não existem
// (por exemplo, o pacote de um build que falhou antes de empacotar) são ignorados.
const attachments = process.argv
    .slice(2)
    .filter(existsSync)
    .map((path) => ({ filename: basename(path), path }));

const subject = `[${JOB_NAME}] build #${BUILD_NUMBER}: ${BUILD_STATUS}`;
const text = [
    `Status: ${BUILD_STATUS}`,
    `Job: ${JOB_NAME}`,
    `Build: #${BUILD_NUMBER}`,
    `Commit: ${GIT_COMMIT ?? "desconhecido"}`,
    `Link: ${BUILD_URL}`,
    `Anexos: ${attachments.map((a) => a.filename).join(", ") || "nenhum"}`,
].join("\n");

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    // Na porta 587 do Gmail, a conexão começa aberta e o nodemailer ativa a criptografia (STARTTLS).
    secure: false,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

await transporter.sendMail({ from: SMTP_FROM, to: NOTIFY_EMAIL, subject, text, attachments });
console.log(`E-mail enviado para ${NOTIFY_EMAIL} via ${SMTP_HOST}:${SMTP_PORT}`);
