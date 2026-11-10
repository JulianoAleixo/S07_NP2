// Support file, loaded before each test.
// Good place for custom commands and global configuration.
import "cypress-mochawesome-reporter/register";
import "./commands";

// Os testes nunca enviam e-mail real: toda chamada ao EmailJS recebe uma resposta falsa de sucesso.
beforeEach(() => {
  cy.intercept("POST", "https://api.emailjs.com/**", {
    statusCode: 200,
    body: "OK",
  }).as("emailjs");
});
