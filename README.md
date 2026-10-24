# Overwatch RPG — Ficha Interativa

Ficha de agentes para o sistema próprio de Overwatch RPG.

## Estrutura do repositório

| Arquivo | Finalidade |
|---|---|
| `index.html` | Ficha principal: combate, proficiências, perks, inventário, passivas, habilidades e árvores de talentos. |
| `agentes.html` | Biblioteca única de modelos de agentes prontos para adicionar à ficha. |

### Agentes disponíveis

- **Emre** — DPS, assalto cibernético.
- **Jetpack Cat (Fika)** — Suporte, voo e resgate.
- **Hanzo** — DPS, arco e reconhecimento.
- **Mizuki** — Suporte, 25 pontos de atributos (20 + 5), 8 PTec e 15 PH disponíveis; retrato enviado pelo jogador. Kit preenchido a partir do site oficial e dos patches: Glaive Espiritual, Kasa Medicinal, Corrente Paralisante, Retorno ao Katashiro, Aura Medicinal e Santuário Kekkai. Duas barras especiais (Aura e Cargas de Kasa); valores de mesa adaptados. Ao abrir Mizuki pelo compêndio, os campos genéricos de fichas antigas são atualizados sem sobrescrever alterações manuais.

Os modelos estão **integrados no próprio `agentes.html`**, sem depender de uma página HTML por personagem. Os antigos arquivos `emre.html`, `jetpack-cat.html` e `hanzo.html` foram consolidados e removidos.

## Como usar

1. Abra a [Ficha Overwatch RPG](https://n4nd0-hub.github.io/Overwatch-RPG/).
2. Clique em **Agentes prontos** para abrir a [Biblioteca de Agentes](https://n4nd0-hub.github.io/Overwatch-RPG/agentes.html).
3. Pesquise ou filtre os modelos, consulte os detalhes e clique em **Adicionar à ficha**.
4. O herói será adicionado ao menu de agentes da ficha. Se já estiver salvo, o botão apenas abrirá o personagem existente.

É possível usar **Adicionar todos os modelos** de uma vez. Isso não elimina nem substitui os personagens previamente salvos.

## Dados e progresso

As fichas são armazenadas no **localStorage** do navegador (chave `overwatch_rpg_sheet_v1`). Os agentes importados da biblioteca passam a ser editáveis como os demais.

- Os arquivos HTML do GitHub não contêm as alterações pessoais feitas pelo jogador.
- Os dados não são sincronizados automaticamente entre dispositivos ou navegadores.
- Use **Exportar** e **Importar** na ficha principal para fazer cópias de segurança.
- As estatísticas dos modelos são adaptações para este RPG, não valores oficiais do jogo.

## Uso no celular

- As abas **Combate**, **Arsenal** e **Árvore** ficam disponíveis na barra superior.
- O botão **⋯** reúne tema, mecânicas, agentes prontos, criação de agente, exportação e importação.
- Em Combate, vida, energia e movimento aparecem primeiro. Os atalhos levam diretamente aos recursos, atributos, habilidades e retrato.
- O menu **☰** abre os agentes sobre a ficha. Toque fora dele, em **Fechar** ou em um agente para voltar.

## Expansão

Para adicionar novos agentes prontos, inclua seus objetos de ficha no catálogo `TEMPLATES` do arquivo `agentes.html`, com identificadores `_templateId` exclusivos, e apresente-os na coleção `INFO`. Evite criar um novo HTML para cada agente.

---

Projeto de fãs independente, sem vínculo oficial com Blizzard Entertainment.

