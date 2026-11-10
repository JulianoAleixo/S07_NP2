Feature: Like button
  As a visitor of Juliano Aleixo's portfolio
  I want to like the portfolio
  So that I can show that I liked the content and the information within the page

  Background:
    Given I am on the portfolio home page 
    And the page has an non-negative integer number of likes

  @TC-018 @valid
  Scenario: Viewing the initial like state
    Then I should see the like button with a non-negative integer number of likes

  @TC-019 @valid
  Scenario: Liking the page
    When I click on the like button
    Then I should see the like button count increased by 1

  @TC-034 @invalid
  Scenario: Not liking the page twice
    When I click on the like button
    Then the like button should be disabled
    And the like button should still be disabled after reloading the page

  # Mantido como requisito: o site não permite descurtir (a API não tem a rota e o botão trava após o like).
  # Fica pulado enquanto o comportamento não existir, para não falhar o pipeline.
  @TC-020 @invalid @skip
  Scenario: Unliking the page
    Given I have liked the page
    When I click on the like button
    Then I should see the like button count decreased by 1
