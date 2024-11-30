context("Dado que fiz login na plataforma", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.setCookie("__Host-next-auth.csrf-token", Cypress.env("CRF_TOKEN"), {
      secure: true, // O cookie deve ser seguro
      path: "/", // O caminho deve ser '/'
      httpOnly: true, // Evitar acesso via JavaScript para segurança extra
    });
    cy.setCookie(
      "__Secure-next-auth.callback-url",
      "https%3A%2F%2Fsn1tch-app-github-contribs-front.vercel.app%2Flogin",
      {
        secure: true, // O cookie deve ser seguro
        path: "/", // O caminho deve ser '/'
        httpOnly: true, // Evitar acesso via JavaScript para segurança extra
      }
    );
    cy.setCookie(
      "__Secure-next-auth.session-token",
      Cypress.env("SESSION_TOKEN"),
      {
        secure: true, // O cookie deve ser seguro
        path: "/", // O caminho deve ser '/'
        httpOnly: true, // Evitar acesso via JavaScript para segurança extra
      }
    );
    cy.visit("https://sn1tch-app-github-contribs-front.vercel.app/login");
  });
  describe("Quando acesso a plataforma", () => {
    it("Devo visualizar a homepage", () => {
      cy.contains("h1", "Projetos");
      cy.contains("a", "Cadastrar");
    });
  });
  describe("Quando acesso a plataforma e clico em um projeto", () => {
    it("Devo conseguir acessar o detalhe do projeto clicado", () => {
      cy.get("h2")
        .contains("OtacilioN/sn1tch-app-github-contribs-front")
        .click();
      cy.contains("h1", "Dados do projeto");
    });
  });
  describe("Quando acesso a plataforma e clico em cadastrar", () => {
    it("Devo conseguir acessar a página de cadastro de um novo projeto ao clicar no botão de cadastrar", () => {
      cy.contains("a", "Cadastrar").click();
      cy.contains("h1", "Cadastrar Projeto e Estudantes");
    });
  });
});
