describe('Agenda de Contatos', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Inclui um contato', () => {
    cy.criarContato().then((contato) => {
      cy.contains(contato.nome).should('be.visible');
      cy.contains(contato.email).should('be.visible');
    });
  });

  it('Edita um contato', () => {
    cy.criarContato().then((contato) => {
      const novoTelefone = '71 9 9999-0000';
      cy.editarContato(contato.nome, novoTelefone);
      cy.contains(contato.nome).parent().should('contain.text', novoTelefone);
    });
  });

  it('Remove um contato', () => {
    cy.criarContato().then((contato) => {
      cy.removerContato(contato.nome);
    });
  });
});
