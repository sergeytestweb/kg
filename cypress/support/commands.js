Cypress.Commands.add('generateTestData', () => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  
  return {
    username: `test_user_${timestamp}_${randomString}`,
    password: `Pass_${timestamp}_${randomString}!`,
    email: `test_${timestamp}_${randomString}@example.com`
  }
})

Cypress.Commands.add('waitForAuth', () => {
  cy.wait('@authRequest').its('response.statusCode').should('eq', 200)
})

Cypress.Commands.add('setAuthToken', () => {
  // Устанавливаем токен в localStorage для имитации авторизации
  cy.window().then((win) => {
    win.localStorage.setItem('sk', 'YJyKb5bbs0XkjR5DmPrD')
    win.localStorage.setItem('auth_token', 'YJyKb5bbs0XkjR5DmPrD')
    win.localStorage.setItem('isAuthenticated', 'true')
    win.localStorage.setItem('user', JSON.stringify({
      username: 'Ochko228',
      id: 'test-user-id',
      email: 'ochko228@example.com',
      role: 'user'
    }))
    win.localStorage.setItem('session_start', Date.now().toString())
  })
})

Cypress.Commands.add('verifyAuthToken', () => {
  // Проверяем наличие токена в localStorage
  cy.window().then((win) => {
    const token = win.localStorage.getItem('sk')
    expect(token).to.equal('YJyKb5bbs0XkjR5DmPrD')
    
    const authToken = win.localStorage.getItem('auth_token')
    expect(authToken).to.exist
    
    const isAuthenticated = win.localStorage.getItem('isAuthenticated')
    expect(isAuthenticated).to.equal('true')
    
    cy.log(`Токен в localStorage: ${token}`)
  })
})

Cypress.Commands.add('verifyNoAuthToken', () => {
  // Проверяем отсутствие токена в localStorage
  cy.window().then((win) => {
    const token = win.localStorage.getItem('sk')
    expect(token).to.be.null
    
    const authToken = win.localStorage.getItem('auth_token')
    expect(authToken).to.be.null
  })
})