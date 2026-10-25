# Overwatch RPG — Ficha Interativa

Ficha de agentes para o sistema próprio de Overwatch RPG.

## Estrutura do repositório

| Arquivo | Finalidade |
|---|---|
| `index.html` | Ficha principal: combate, proficiências, perks, inventário, passivas, habilidades e árvores de talentos. |
| `agentes.html` | Biblioteca única de modelos de agentes prontos para adicionar à ficha. |
| `storage.js` | Salvamento e migração automática de fichas para IndexedDB. |

### Agentes disponíveis

- **Emre** — DPS, assalto cibernético.
- **Jetpack Cat (Fika)** — Suporte, voo e resgate.
- **Hanzo** — DPS, arco e reconhecimento.
- **Winston** — Tanque, Canhão de Tesla, Salto a Jato, Projetor de Barreira e Fúria Primata; escudo com integridade própria e vida temporária da Ultimate.
- **D.Mon** — Tanque, Sabre de Plasma e Barreira de Poder; marcas de comando, troca para piloto e Quebra de Limites.
- **D.Va (Tier II; 6 PO)** — Tanque, Quebra-Linha, ficha de NPC: MEKA de 550 HP (reconvocação com 400 HP), Piloto de 100 HP, Canhões de Fusão de 30/60, Boosters (1 Energia), Matriz de Defesa (2 Energia e amplificação), Micro-Mísseis (2 Energia), Chamar MEKA (6 Energia) e Self-Destruct (12 Energia; 40m, 1.000 dano, DT 40, incluindo aliados). Possui chamada gratuita condicionada à Ultimate, passiva especial Jogada de Destaque e reserva de 12 Energia. Atributos literais informados: 8/6/3/6/3 = 26 pontos; 8 PTec e 20 PH.
- **Echo** — DPS, Tiro Triplo, Bombas Aderentes, Feixe Concentrado e Duplicar; Algoritmo Evolutivo.
- **Tracer** — DPS, Teleportar, Recordação e Bomba Eletromagnética; Paradoxo Cronal.
- **Sojourn (Tier II; 6 PO)** — DPS, Atirador de Elite, Canhão Elétrico com Carga própria, Deslizada Enérgica, Disparo Disruptivo, Designação Tática e Sobrecarga. Passiva especial Execução Craniana: headshot triplica o Tiro Carregado (600 de dano com 100 Carga; 720 durante a Ultimate) e ignora metade da RD. Possui 25 atributos, 8 PTec, 20 PH e até 12 Energia; valores de combate de NPC.
- **Mizuki** — Suporte, 25 pontos de atributos (20 + 5), 8 PTec e 15 PH disponíveis; retrato enviado pelo jogador. Kit preenchido a partir do site oficial e dos patches: Glaive Espiritual, Kasa Medicinal, Corrente Paralisante, Retorno ao Katashiro, Aura Medicinal e Santuário Kekkai. Duas barras especiais (Aura e Cargas de Kasa); valores de mesa adaptados. Ao abrir Mizuki pelo compêndio, os campos genéricos de fichas antigas são atualizados sem sobrescrever alterações manuais.

Os modelos estão **integrados no próprio `agentes.html`**, sem depender de uma página HTML por personagem. Os antigos arquivos `emre.html`, `jetpack-cat.html` e `hanzo.html` foram consolidados e removidos.

## Como usar

1. Abra a [Ficha Overwatch RPG](https://n4nd0-hub.github.io/Overwatch-RPG/).
2. Clique em **Agentes prontos** para abrir a [Biblioteca de Agentes](https://n4nd0-hub.github.io/Overwatch-RPG/agentes.html).
3. Pesquise ou filtre os modelos, consulte os detalhes e clique em **Adicionar à ficha**.
4. O herói será adicionado ao menu de agentes da ficha. Se já estiver salvo, o botão apenas abrirá o personagem existente.

É possível usar **Adicionar todos os modelos** de uma vez. Isso não elimina nem substitui os personagens previamente salvos.

## Dados e progresso

As fichas são armazenadas no **IndexedDB** do navegador (banco `OverwatchRPGData`, registro `overwatch_rpg_sheet_v1`), que oferece mais espaço para personagens e retratos personalizados. O arquivo `storage.js` compartilha os dados entre a ficha principal e o compêndio. Na primeira abertura, fichas que estavam no `localStorage` são migradas automaticamente; a cópia antiga só é retirada após a gravação no IndexedDB ser confirmada. Os agentes importados da biblioteca passam a ser editáveis como os demais.

- Os arquivos HTML do GitHub não contêm as alterações pessoais feitas pelo jogador.
- Os dados não são sincronizados automaticamente entre dispositivos ou navegadores.
- Use **Exportar** e **Importar** na ficha principal para fazer cópias de segurança. Limpar os dados do site no navegador pode apagar fichas, inclusive as armazenadas no IndexedDB.
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

