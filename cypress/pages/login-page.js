export const loginPage = {
  visit() {
    cy.visit("/sign-in");
  },

  clickContinueButton() {
    return cy.get("div").contains("Continue").click();
  },

  clickLoginButton() {
    return cy.get("div").contains("Login").click();
  },

  fillLoginForm() {
    return cy.get('[inputmode="email"]').click()
  },

    fillPasswordForm() {
    return cy.get('[placeholder="Password"]').click()
  },
};