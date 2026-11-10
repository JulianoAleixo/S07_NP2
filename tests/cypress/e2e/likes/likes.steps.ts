import {
  Given,
  When,
  Then,
  After,
} from "@badeball/cypress-cucumber-preprocessor";
import MainPage from "../../pages/MainPage";

let initialCount: number;

Given("I am on the portfolio home page", () => {
  MainPage.visit();
});

Given(
  "the page has an non-negative integer number of likes",
  (_placeholder: string) => {
    MainPage.getStableLikeCount().then((count) => {
      initialCount = count;
    });
  },
);

Then(
  "I should see the like button with a non-negative integer number of likes",
  () => {
    MainPage.getLikeCount().should((count) => {
      expect(count).to.be.a("number");
      expect(Number.isInteger(count)).to.be.true;
      expect(count).to.be.at.least(0);
    });
  },
);

When("I click on the like button", () => {
  // Observa o pedido sem alterá-lo, para os passos seguintes esperarem a resposta real da API.
  cy.intercept("POST", "/api/likes").as("sendLike");
  MainPage.clickLikeButton();
});

Then("I should see the like button count increased by 1", () => {
  MainPage.reloadUntilLikeCountIs(initialCount + 1);
  MainPage.getLikeCount().should("eq", initialCount + 1);
});

// O botão também fica travado enquanto carrega; por isso, só confere depois da resposta da API.
Then("the like button should be disabled", () => {
  cy.wait("@sendLike");
  MainPage.getLikeButton().should("be.disabled");
});

// Depois de recarregar, o botão só continua travado se a API lembrar que este dispositivo já curtiu.
Then("the like button should still be disabled after reloading the page", () => {
  cy.intercept("GET", "/api/likes*").as("loadLikes");
  cy.reload();
  cy.wait("@loadLikes").its("response.body.liked").should("eq", true);
  MainPage.getLikeButton().should("be.disabled");
});

Given("I have liked the page", () => {
  MainPage.clickLikeButton();
  MainPage.reloadUntilLikeCountIs(initialCount + 1);
});

Then("I should see the like button count decreased by 1", () => {
  MainPage.reloadUntilLikeCountIs(initialCount);
  MainPage.getLikeCount().should("eq", initialCount);
});

// Só para o TC-020 (descurtir, hoje pulado). Nos outros cenários, o botão fica travado depois do like
// e este clique falharia; a limpeza entre cenários já dá um dispositivo novo a cada teste.
After({ tags: "@TC-020" }, () => {
  MainPage.getLikeCount().then((currentCount) => {
    if (currentCount !== initialCount) {
      MainPage.clickLikeButton();
      MainPage.reloadUntilLikeCountIs(initialCount);
    }
  });
});
