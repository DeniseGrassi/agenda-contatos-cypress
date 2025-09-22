/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

declare global {
  namespace Cypress {
    interface Chainable {
      criarContato(): Chainable<{ nome: string; email: string; telefone: string }>;
      editarContato(nomeAtual: string, novoTelefone: string): Chainable<void>;
      removerContato(nome: string): Chainable<void>;
    }
  }
}

/* ======================= helpers ======================= */

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const makePhoneBR = () => {
  const d = faker.string.numeric(11); // ex: 71987654321
  return `${d.slice(0, 2)} ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
};

// Encontra o contêiner (linha) do contato que realmente contém os botões de ação
const findRowByName = (nome: string) =>
  cy
    .contains(new RegExp(`^\\s*${esc(nome)}\\s*$`, 'i'))
    .should('be.visible')
    .parents() // sobe pelos ancestrais
    .filter((_i, el) => {
      // se tiver .delete/.edit é a linha certa
      if (el.querySelector('button.delete, button.edit')) return true;

      // fallback: procurar botões com label DELETAR/EDITAR
      const btns = el.querySelectorAll(
        'button, [role="button"], a, input[type="button"], input[type="submit"]'
      );
      for (const b of Array.from(btns)) {
        const t = (b.textContent || (b as HTMLInputElement).value || '').trim();
        if (/^(deletar|excluir|remover|editar)$/i.test(t)) return true;
      }
      return false;
    })
    .first()
    .scrollIntoView();

/* ======================= commands ======================= */

Cypress.Commands.add('criarContato', () => {
  const contato = {
    nome: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    telefone: makePhoneBR()
  };

  // Formulário do topo
  cy.get('input[placeholder="Nome"]').clear().type(contato.nome);
  cy.get('input[placeholder="E-mail"]').clear().type(contato.email);
  cy.get('input[placeholder="Telefone"]').clear().type(contato.telefone);

  cy.contains('button', /^adicionar$/i).click();

  cy.contains(contato.nome, { timeout: 10000 }).should('be.visible');
  return cy.wrap(contato);
});

Cypress.Commands.add('editarContato', (nomeAtual: string, novoTelefone: string) => {
  // 1) Clica no "Editar" da linha (classe .edit OU label EDITAR)
  findRowByName(nomeAtual).within(() => {
    cy.get('button.edit').then(($b) => {
      if ($b.length) {
        cy.wrap($b.first()).click({ force: true });
      } else {
        cy.contains(/^editar$/i).click({ force: true });
      }
    });
  });

  // 2) O formulário do topo entra em modo de edição
  cy.get('input[placeholder="Telefone"]').should('be.visible').clear().type(novoTelefone);

  // 3) Salvar no topo
  cy.contains('button', /^salvar$/i).click({ force: true });

  // 4) Validar
  cy.contains(new RegExp(`^\\s*${esc(nomeAtual)}\\s*$`, 'i'))
    .parents()
    .filter((_i, el) => !!el.querySelector('button.delete, button.edit'))
    .first()
    .should('contain.text', novoTelefone);
});

Cypress.Commands.add('removerContato', (nome: string) => {
  // 1) Clicar no "Deletar" da linha (classe .delete OU label DELETAR/EXCLUIR/REMOVER)
  findRowByName(nome).within(() => {
    cy.get('button.delete').then(($b) => {
      if ($b.length) {
        cy.wrap($b.first()).click({ force: true });
      } else {
        cy.contains(/^(deletar|excluir|remover)$/i).click({ force: true });
      }
    });
  });

  // 2) Se houver modal de confirmação, trate aqui (parece não haver):
  // cy.contains(/^(sim|confirmar|ok)$/i).click({ force: true });

  // 3) Validar remoção
  cy.contains(new RegExp(`^\\s*${esc(nome)}\\s*$`, 'i')).should('not.exist');
});

export {};
