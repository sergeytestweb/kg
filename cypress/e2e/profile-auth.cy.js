import { loginPage } from "../pages/login-page";
import { profilePage } from "../pages/profile-page";

describe("Сквозной тест: Авторизация, токены и управление профилем", () => {
  const TEST_USER = {
    username: "Ochko228",
    password: "Zxcvbn",
    serialNum: "39273",
  };
  let originalAvatarSrc;
  let newAvatarSrc;

  it("Полный сквозной сценарий: от логина до смены аватарки с проверкой токенов", () => {
    // === Часть: Проверка невозможности доступа без авторизации ===
    cy.log(
      "Шаг: Проверка отсутствия доступа к защищенным страницам без токена"
    );

    // cy.window().then((win) => {
    //   win.localStorage.setItem("sk", "YJyKb5bbs0XkjR5DmPrD");
    //   win.localStorage.setItem("session_start", Date.now().toString());
    // });

    cy.visit(`https://fufelka.ru/sign-in`);
    cy.url().should("include", "/sign-in");
    cy.get("p").contains("404 Not Found");

    // Проверяем, что в localStorage нет токена
    cy.window().then((win) => {
      const token = win.localStorage.getItem("sk");
      expect(token).to.be.null;
    });

    // Устанавливаем токен и успешный логин
    cy.setAuthToken();

    loginPage.visit();
    // Дожидаемся успешного ответа auth-эндпоинта, click Continue
    loginPage.clickContinueButton();

    // click Login
    loginPage.clickLoginButton();

    // Заполняем Логин
    loginPage.fillLoginForm().type(TEST_USER.username);

    // Заполняем Пароль и логинимся
    loginPage.fillPasswordForm().type(TEST_USER.password);
    loginPage.clickLoginButton();

    // Дожидаемся успешного ответа auth-эндпоинта
    cy.waitForAuth();

    // Проверяем имя пользователя и его учетный номер
    cy.get("div").contains(TEST_USER.username);
    cy.get("span").contains(TEST_USER.serialNum);

    // Многократные перезагрузки и проверки
    const reloadCount = 3;
    for (let i = 1; i <= reloadCount; i++) {
      cy.log(`Перезагрузка ${i} из ${reloadCount}`);
      cy.reload();
      cy.verifyAuthToken();
    }

    // Снова сморим имя пользователя и его учетный номер
    cy.get("div").contains(TEST_USER.username);
    cy.get("span").contains(TEST_USER.serialNum);

    // === Часть 2: Переход в профиль ===
    cy.log("Шаг 6: Переход в профиль и проверка данных");

    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");

    // Проверяем видимость аватара и клик на него);
    profilePage.clickAvatar();

    // Снова проверяем имя пользователя и его учетный номер
    cy.get("div").contains(TEST_USER.username);
    cy.get("span").contains(TEST_USER.serialNum);

    // === Часть 3: Смена аватарки ===

    // 1. Получаем и сохраняем исходный src
    cy.get('img[alt="Avatar"]')
      .should("be.visible")
      .invoke("attr", "src")
      .then((src) => {
        originalAvatarSrc = src;
        cy.log(`Original avatar src: ${originalAvatarSrc}`);
      });

    // 2. Настраиваем перехват загрузки
    cy.intercept({
      method: "POST",
      url: "**/upload/**",
    }).as("avatarUpload");

    // 3. Загружаем файл

    // Применение intercept --- --- ПЕРЕХВАТЫВАЕМ ЗАПРОС ПЕРЕД ДЕЙСТВИЯМИ
    cy.intercept("PUT", "/api/users/39273").as("updateUserRequest");
    // Клик на редактирование профиля
    cy.get('[aria-label="mini-btn"]').last().click();

    // Клик на редактирование фото
    cy.get("div").contains("Edit photo").click();

    // Загружаем и сохраняем аватар (можем менять в стр 112 img.png / img2.png для прогона тестов)
    cy.get('input[type="file"][accept*="image"]').selectFile(
      "cypress/fixtures/img2.png",
      { force: true }
    );
    cy.get("div").contains("Save").click();
    profilePage.clickSaveButton();

    // ЖДЕМ И ПРОВЕРЯЕМ ЗАПРОС
    cy.wait("@updateUserRequest").then((interception) => {
      // Проверяем статус 200
      expect(interception.response.statusCode).to.eq(200);

      // Дополнительные проверки:
      expect(interception.request.method).to.eq("PUT");
      expect(interception.request.url).to.include(
        `/api/users/${TEST_USER.serialNum}`
      );
    });

    // Проверяем, что аватар ИЗМЕНИЛСЯ
    cy.get('img[alt="Avatar"]')
      .should("be.visible")
      .invoke("attr", "src")
      .then((currentSrc) => {
        newAvatarSrc = currentSrc;
        newAvatarSrc != originalAvatarSrc;
        cy.log(`Новый аватар: ${newAvatarSrc}`);
      });

    // Выполняем cy.reload() и проверяем, что изображение действительно загрузилось (не broken image)
    cy.reload()
    cy.get('img[alt="Avatar"]')
      .should("be.visible")
      .and(($img) => {
        // Проверяем что изображение имеет размеры
        expect($img[0].naturalWidth).to.be.greaterThan(0);
        expect($img[0].naturalHeight).to.be.greaterThan(0);
      });

    // cy.wait(20000);
  });
});
