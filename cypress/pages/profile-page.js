export const profilePage = {
  clickAvatar() {
    return cy.get('img[alt="Avatar"]')
  .should('be.visible')
  .click();
  },

  clickSaveButton() {
    return cy.get("div").contains('Save').click()
  },
}