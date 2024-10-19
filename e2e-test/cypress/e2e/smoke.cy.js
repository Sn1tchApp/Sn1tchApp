context("Dado que não fiz login na plataforma", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("https://sn1tch-app-github-contribs-front.vercel.app/login");
      cy.contains("h1", "Sn1tch Auth");
      cy.get("button").contains("Login").click();
      cy.origin("https://github.com", () => {
        cy.get('input[name="login"]').type(Cypress.env('GITHUB_USERNAME'));
        cy.get('input[name="password"]').type(Cypress.env('GITHUB_PASSWORD'), { log: false });
      
        cy.get('input[type="submit"]').click();
      })
      cy.get("button").contains("Sign in").click();
  });
  describe("Quando acesso a plataforma", () => {
    it("Devo conseguir fazer login e visualizar a homepage com botão de cadastrar", () => {
      cy.contains("h1", "Projetos");
    });
  });
})

