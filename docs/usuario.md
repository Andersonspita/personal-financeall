# Guia do usuário — Bússola Financeira

A Bússola Financeira é um aplicativo de finanças pessoais com apoio emocional. Além de registrar receitas e despesas, ele ajuda a perceber a relação entre humor e dinheiro — sem julgamento, sem cobrança.

Este guia descreve o que você consegue fazer hoje no app.

## Conta e acesso

1. Abra o app e escolha **Criar conta** (`/registrar`).
2. Informe nome, e-mail e uma senha com pelo menos 8 caracteres.
3. Na primeira conta, o app já cria uma **Conta Principal** e categorias iniciais de gasto (Moradia, Alimentação, Delivery…) mais **Salário** (renda). Você pode criar outras depois em Orçamentos.
4. Para sair, use **Sair** no menu (computador) ou no topo da tela (celular).

Quem já tem conta entra em **Entrar** (`/login`).

### Conta de demonstração (só em ambiente local)

Se alguém rodou o seed de desenvolvimento (`npm run db:seed`), existe um usuário de teste:

- E-mail: `demo@bussola.app`
- Senha: `demo12345`

Essa conta **não** deve ser usada em produção.

## Telas

No celular, a navegação fica na barra inferior. No computador, fica na coluna à esquerda.

### Início

Visão geral do mês:

- saldo disponível
- despesas fixas versus variáveis
- gráfico de projeção até o fim do mês
- orçamentos com barra de progresso
- lançamentos recentes
- um indicador de “como você está”, baseado nos padrões recentes de gasto — não é um diagnóstico

O botão **Lançar** abre o cadastro de uma nova receita ou despesa.

### Lançamentos

Lista as movimentações. Em cada uma você vê data, conta, categoria e, se registrou, o estado emocional.

Use **editar** para corrigir valor, data, categoria ou tipo. Use **excluir** se o lançamento não deveria existir.

Se o app marcar um gasto como **possível impulso**, você pode tocar em **não foi impulso**. O marcador é informativo: você sempre tem a última palavra.

### Novo lançamento

1. Escolha **receita** ou **despesa**. A lista de categorias muda junto: receita mostra só entradas (Salário, freelance…); despesa mostra só gastos (Moradia, Delivery…).
2. Para o salário: **Receita** → categoria **Salário** (criada automaticamente) → valor → conta → data → **Salvar**.
3. Descrição ajuda (ex.: “salário agosto”). Estado emocional só aparece em despesa.

Outras entradas (freelance, 13º, reembolso): em **Orçamentos**, crie uma categoria com grupo **Renda**.

Campos principais:

- tipo (receita ou despesa)
- valor, conta e categoria (filtrada pelo tipo)
- se a despesa é essencial (fixa) ou variável
- data e hora
- estado emocional no momento da compra (opcional): ansioso, entediado, estressado, triste, feliz, neutro ou necessidade real
- um comentário privado (opcional)

O comentário emocional fica protegido e **não** entra no extrato financeiro exportado.

### Orçamentos

- categorias de **renda** (só para receitas) separadas dos **tetos de gasto**
- teto mensal por categoria de gasto
- alerta visual ao chegar em 80% e ao atingir 100% do teto
- visão 50-30-20: essencial, variável e poupança em relação à renda do mês
- cadastro de novas categorias: grupo **Renda** para entradas; os outros grupos para gastos

Os avisos usam linguagem de orientação, não de culpa.

### Desejos (trava de resfriamento)

Quando bater vontade de comprar algo que não é urgente:

1. Cadastre o item, o valor estimado e o tempo de espera (24h, 48h ou 72h).
2. Espere o prazo. O app mostra a contagem regressiva.
3. Depois, confirme se ainda faz sentido ou descarte o item.

Se o assistente de IA estiver ligado, o app pode oferecer uma pergunta de reflexão antes da decisão.

### Emoções (Emoção × Gasto)

Gráfico dos últimos 30 dias cruzando sentimento e valor gasto. Destaca qual emoção mais drenou caixa no período. Nenhum sentimento é tratado como “errado”.

Se o padrão de vulnerabilidade ficar crítico várias vezes seguidas, esta tela também mostra canais de apoio (CVV, Devedores Anônimos, clínicas-escola).

### Botão de Pânico

Atalho para o momento em que a urgência de comprar é forte:

1. Toque em **Me ajuda a pausar**.
2. Escolha uma microatividade (respiração, caminhada, lista de gratidão ou leitura curta).
3. Ao terminar, diga se conseguiu esperar ou se comprou mesmo assim.

Qualquer resultado é aceito. O objetivo é criar uma pausa, não pontuar comportamento.

### Aprender

Biblioteca de textos curtos sobre emoção e dinheiro. O bloco **Para você agora** sugere leituras com base no que mais aparece nos seus gastos. Você pode marcar o conteúdo como concluído.

### Configurações

Mostra nome e e-mail da conta. Se o servidor tiver IA configurada, você liga ou desliga o **Assistente de IA**. Ele fica **desligado por padrão**.

O assistente só:

- explica, em linguagem simples, o indicador de “como você está”
- sugere uma pergunta de reflexão na trava de resfriamento

Ele não é terapeuta, não diagnostica e não substitui apoio profissional.

## Exportar extrato

A rota autenticada `/api/export` baixa um JSON com lançamentos financeiros (data, tipo, valor, conta, categoria). **Emoção, intensidade e comentário emocional não entram no arquivo.**

## Instalar no celular (PWA)

O app é mobile-first e pode ser adicionado à tela inicial pelo navegador (Chrome, Safari, Edge), como um aplicativo. Os dados financeiros **não** ficam congelados em cache antigo: só o ícone e o manifesto são guardados localmente.

## Privacidade, em linguagem simples

- Cada conta vê só os próprios dados.
- A nota emocional é gravada criptografada.
- O extrato exportável não leva dados de humor.
- A IA, se existir no servidor, só funciona depois que você liga a opção em Configurações.

## Tom do app

Os textos evitam palavras como “erro”, “falha” ou “você deveria”. O foco é consciência e cuidado. Se algo no app soou punitivo, isso é um defeito — não o comportamento esperado.
