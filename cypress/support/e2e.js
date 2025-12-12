import './commands'

beforeEach(() => {
  // Перехватываем auth запросы
  cy.intercept('POST', '**/auth/**', (req) => {
    req.alias = 'authRequest'
  }).as('auth')
  
  // Перехватываем запросы профиля
  cy.intercept('GET', '**/profile/**').as('getProfile')
  cy.intercept('PUT', '**/profile/**').as('updateProfile')
  cy.intercept('POST', '**/upload/**').as('uploadAvatar')
  
  // Перехватываем запросы для проверки авторизации
  cy.intercept('GET', '**/api/verify**').as('verifyToken')
  cy.intercept('GET', '**/api/session**').as('sessionCheck')
})

// After hook для очистки после всех тестов
after(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})