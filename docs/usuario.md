# Guia do usuário — Bússola Financeira

A Bússola Financeira é um aplicativo de finanças pessoais com apoio emocional. Além de registrar receitas e despesas, ele ajuda a perceber a relação entre humor e dinheiro — sem julgamento, sem cobrança.

Este guia descreve o que você consegue fazer hoje no app.

## Conta e acesso

1. Abra o app e escolha **Criar conta** (`/registrar`), ou **Continuar com Google** se o servidor tiver o login Google ligado.
2. No cadastro por e-mail, informe nome, e-mail e uma senha com pelo menos 8 caracteres. Se algum campo estiver incompleto (nome em branco, e-mail inválido, senha curta), o aviso aparece **embaixo do campo** que precisa de correção.
3. Na primeira conta, o app já cria uma **Conta Principal** e categorias iniciais de gasto (Moradia, Alimentação, Delivery…) mais **Salário** (renda). Outras contas de dinheiro (carteira, cartão, poupança) você cria em **Configurações**.
4. Para sair, use **Sair** no menu (computador) ou no topo da tela (celular).

Quem já tem conta entra em **Entrar** (`/login`). E-mail inválido ou senha em branco são apontados no próprio campo; e-mail ou senha incorretos aparecem como recado geral, sem dizer se o e-mail existe. Enquanto o app processa o login ou o cadastro, o botão mostra um indicador de espera.

**Esqueci a senha:** em `/login`, toque em **Esqueci a senha**, informe o e-mail e abra o link que chegar (vale 1 hora). O app não diz se o e-mail existe. Contas que só entram com Google também podem criar uma senha por esse caminho.

Se o e-mail da conta Google já existir (cadastro anterior), o Google só **liga** as duas entradas — não cria uma segunda conta.

### Conta de demonstração (só em ambiente local)

Se alguém rodou o seed de desenvolvimento (`npm run db:seed`), existe um usuário de teste:

- E-mail: `demo@bussola.app`
- Senha: `demo12345`

Essa conta **não** deve ser usada em produção.

## Telas

No celular, a navegação fica na barra inferior (acima da faixa do iPhone). No computador, fica na coluna à esquerda.

### Início

Visão geral do mês:

- saldo disponível
- despesas fixas versus variáveis
- gráfico de projeção até o fim do mês
- um recado pontual (teto de gasto ou dica contextual), se houver, com botão **Entendi**
- orçamentos com barra de progresso
- lançamentos recentes
- um indicador de “como você está”, baseado nos padrões recentes de gasto — não é um diagnóstico

O botão **Lançar** abre o cadastro de uma nova receita ou despesa.

### Lançamentos

Lista as movimentações. Em cada uma você vê data, conta, categoria e, se registrou, o estado emocional.

Use o ícone de lápis para corrigir valor, data, categoria ou tipo. Use a lixeira se o lançamento não deveria existir. Se o comentário privado não puder ser lido (chave de cifra diferente, por exemplo), a tela avisa e você pode escrever um novo.

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

Se o valor for zero, negativo ou a data estiver inválida, o app explica o problema no campo — não só com uma mensagem genérica no rodapé. O botão de salvar gira enquanto grava.

### Orçamentos

- categorias de **renda** (só para receitas) separadas dos **tetos de gasto**
- teto mensal por categoria de gasto
- alerta visual ao chegar em 80% e ao atingir 100% do teto
- ao cruzar o teto num lançamento, o recado aparece na hora e também no Início (uma vez por mês, por categoria)
- visão 50-30-20: essencial, variável e poupança em relação à renda do mês
- cadastro de novas categorias: grupo **Renda** para entradas; os outros grupos para gastos. Nome vazio ou teto inválido são apontados no campo
- botão **Salvar** ao lado do teto (não é um link sublinhado)

Os avisos usam linguagem de orientação, não de culpa.

### Desejos (trava de resfriamento)

Quando bater vontade de comprar algo que não é urgente:

1. Cadastre o item, o valor estimado e o tempo de espera (24h, 48h ou 72h). Nome em branco, valor zero ou espera fora desse intervalo são apontados no campo.
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

Três **cursos** curtos (emoções e compras, ferramentas da Bússola, dinheiro no dia a dia). Cada um tem aulas de 2–4 minutos, com um **vídeo do YouTube** sugerido sobre o tema (o vídeo é de canais de educação financeira ou saúde, não da Bússola). Você vê quantas aulas já concluiu; não há prova nem prazo. O bloco **Para você agora** sugere aulas com base no que mais aparece nos seus gastos. Dá para marcar a aula como concluída e ir para a anterior ou a próxima.

No celular, o atalho fica no Início (**Ver os cursos**) e no computador no menu **Aprender**.

### Configurações

Mostra nome e e-mail do perfil. Em **Contas de dinheiro** você cria, edita o nome/tipo/saldo inicial e arquiva destinos de lançamento (corrente, carteira, cartão…). Arquivar some da lista de lançamentos novos; o histórico continua. Não dá para arquivar a última conta ativa. O saldo inicial entra no Início.

No formulário de lançamento há o atalho **Gerenciar contas**.

Se o servidor tiver IA configurada, você liga ou desliga o **Assistente de IA**. Ele fica **desligado por padrão**.

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
