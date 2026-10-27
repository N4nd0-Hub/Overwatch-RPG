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

Os modelos estão **integrados no próprio `agentes.html`**, sem depender de uma página HTML por personagem. Os antigos arquivos `emre.html`, `jetpack-cat.html` e `hanzo.html` foram consolidados e removidos.

## Como usar

1. Abra a [Ficha Overwatch RPG](https://n4nd0-hub.github.io/Overwatch-RPG/).
2. Clique em **Agentes prontos** para abrir a [Biblioteca de Agentes](https://n4nd0-hub.github.io/Overwatch-RPG/agentes.html).
3. Pesquise ou filtre os modelos, consulte os detalhes e clique em **Adicionar à ficha**.
4. O herói será adicionado ao menu de agentes da ficha. Se já estiver salvo, o botão apenas abrirá o personagem existente.

É possível usar **Adicionar todos os modelos** de uma vez. Isso não elimina nem substitui os personagens previamente salvos.

## Dados e progresso

As fichas são armazenadas no **IndexedDB** do navegador, com migração dos dados antigos da chave `overwatch_rpg_sheet_v1`. Os agentes importados da biblioteca passam a ser editáveis como os demais.

- Os arquivos HTML do GitHub não contêm as alterações pessoais feitas pelo jogador.
- Os dados não são sincronizados automaticamente entre dispositivos ou navegadores.
- Use **Exportar** e **Importar** na ficha principal para fazer cópias de segurança.
- As estatísticas dos modelos são adaptações para este RPG, não valores oficiais do jogo.

## Uso no celular

- As abas **Combate**, **Arsenal** e **Árvore** ficam disponíveis na barra superior.
- O botão **⋯** reúne tema, mecânicas, agentes prontos, criação de agente, exportação e importação.
- Em Combate, vida, energia e movimento aparecem primeiro. Os atalhos levam diretamente aos recursos, atributos, habilidades e retrato.
- O menu **☰** abre os agentes sobre a ficha. Toque fora dele, em **Fechar** ou em um agente para voltar.

## Modo GM e personagens

Abra o **Modo GM** pela ficha principal. O bestiário e os encontros são salvos em um banco separado, criptografado com a senha do GM. Use **Exportar backup** para guardar e transferir esses dados.

- **Bestiário:** tropas, elites e chefes, com pastas e modelos de Talon e Setor Nulo.
- **Personagens:** NPCs com retrato, atributos, recursos, rolagens, ataques, passivas, Ultimate, história e notas. Use **Criar personagem**, mude o **Tipo de ficha** no editor ou importe um JSON de player.
- **Ramattra:** ficha pronta em **Personagens → Personagens prontos → Usar modelo**. É uma adaptação para este RPG do [kit oficial](https://overwatch.blizzard.com/pt-br/heroes/ramattra/).
- A escala do Ramattra aplica **2× a HP, dano, cura, escudos e redução de dano** uma única vez. Base: **1.200 HP, dano 80, redução 20, barreira 600 e armadura temporária 200**. Na Forma Nêmesis, a Agressão causa **120 de dano**.
- Usar habilidades desconta Energia, aplica os efeitos vinculados e inicia recargas. **Próxima rodada** concede +2 Energia e avança as durações. Direção dos ataques, alvos, condições e aplicação do dano continuam sob controle do GM.
- Cada cópia adicionada a um encontro começa com seus próprios recursos e efeitos. As alterações da cópia não afetam a ficha original.

Os multiplicadores, as reservas e os bônus de formas podem ser editados na aba **Personagem** do editor. Nas habilidades, abra **Efeitos na ficha do personagem** para vincular uma forma ou reserva.

Os retratos e ícones do Ramattra são assets da Blizzard usados neste projeto de fãs. O ícone de Overwatch substitui o símbolo anterior feito em CSS.

Para verificar os cálculos e a compatibilidade dos modelos, execute `node --test tests/gm-characters.test.js`.

## Expansão do catálogo de agentes

Para adicionar novos agentes prontos, inclua seus objetos de ficha no catálogo `TEMPLATES` do arquivo `agentes.html`, com identificadores `_templateId` exclusivos, e apresente-os na coleção `INFO`. Evite criar um novo HTML para cada agente.

---

Projeto de fãs independente, sem vínculo oficial com Blizzard Entertainment.

