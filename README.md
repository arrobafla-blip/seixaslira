# seixaslira — pasta `pwa`

Esta pasta contém a primeira versão instalável do planner familiar, feita com HTML, CSS e JavaScript sem dependências de build.

## O que funciona nesta versão

- Navegação entre Nosso dia, Tarefas, Mercado, ZOE e Notas.
- Adicionar, editar, excluir e concluir tarefas.
- Filtros de status e responsável.
- Adicionar produtos, quantidades, marcar como comprados e limpar itens comprados.
- Lista de atividades da ZOE.
- Notas com salvamento automático.
- Salvamento local no navegador (`localStorage`).
- Cache básico para abrir a interface offline depois da primeira visita, quando o navegador permitir.
- Layout adaptável a celular e computador.

## Importante sobre dados e privacidade

**Esta versão ainda não está conectada ao Supabase nem sincroniza dados entre dispositivos ou entre os adultos.** Os dados ficam no armazenamento local do navegador e podem ser perdidos se os dados do site forem apagados. Não registre informações sensíveis. A tela não possui autenticação real; não publique nem trate esta versão como um sistema privado multiusuário.

Para compartilhar tarefas e compras com segurança, a próxima etapa é conectar o app ao Supabase e configurar autenticação e políticas de Row Level Security (RLS). A integração com o Google Agenda também não está implementada nesta pasta.

## Como colocar no GitHub

1. No GitHub, abra seu repositório.
2. Clique em **Add file → Upload files**.
3. Extraia o ZIP no computador.
4. Envie os arquivos e a pasta `icons` que estão dentro da pasta `pwa` para o local desejado do repositório.
5. Clique em **Commit changes**.

Se o projeto tiver a pasta `pwa` na raiz do repositório, os arquivos podem permanecer dentro dela. Para abrir no navegador, use o endereço do arquivo publicado, por exemplo `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/pwa/` depois de configurar o Pages para esse repositório.

## Como publicar como PWA

- Sirva os arquivos por HTTPS. GitHub Pages fornece HTTPS.
- No repositório, vá em **Settings → Pages** e escolha a branch e a pasta que contêm os arquivos.
- Aguarde a publicação e abra a URL publicada no celular.
- No Android/Chrome, use o menu do navegador e escolha **Instalar app** ou **Adicionar à tela inicial**. No iPhone, abra no Safari, toque em Compartilhar e escolha **Adicionar à Tela de Início**.
- O service worker só funciona em HTTPS ou localhost. Abrir `index.html` diretamente pelo explorador de arquivos não é suficiente para testar todos os recursos PWA.

## Arquivos

- `index.html`: estrutura da interface.
- `styles.css`: cores, tipografia, layout responsivo.
- `app.js`: interações e armazenamento local.
- `manifest.webmanifest`: metadados de instalação.
- `sw.js`: cache offline básico.
- `icons/icon.svg`: ícone vetorial.

## Próximos passos recomendados

1. Conectar Supabase Auth para contas individuais.
2. Criar tabelas com `family_id` e políticas RLS para isolar os dados.
3. Substituir o armazenamento local das listas por operações no banco e atualização em tempo real.
4. Configurar recuperação de acesso e exportação/backup.
5. Implementar a integração OAuth com Google Agenda através de um backend seguro.
