context("Dado que não fiz login na plataforma", () => {
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
    it("Devo conseguir fazer login e visualizar a homepage com botão de cadastrar", () => {
      cy.contains("h1", "Projetos");
    });
  });
});