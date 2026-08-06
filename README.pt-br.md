# SG Health Check

[English](README.md) | **Português (Brasil)**

Stack **ASP.NET Core** para **health checks** com **dashboard web** (Health Checks UI), pensada para monitorizar APIs e dependências em plataformas SG / Source Genesys.

Este repositório é um **fork** orientado à marca e pacotes **SG.**, baseado no projeto comunitário [**AspNetCore.Diagnostics.HealthChecks**](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks).

---

## Projeto upstream (documentação oficial)

Toda a documentação detalhada — lista completa de pacotes NuGet, Kubernetes, Docker, Azure DevOps e exemplos — está no repositório oficial:

**[https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks)**

| Tema no upstream | O que encontrar |
|------------------|-----------------|
| **Health Checks** | Dezenas de integrações (SQL, Redis, Azure, AWS, etc.) e modelo *push* de resultados. |
| **Health Checks UI** | Storage providers, migrações, histórico, webhooks, personalização HTTP client. |
| **Kubernetes** | Operator e descoberta automática de serviços. |
| **DevOps** | Release Gates para Azure Pipelines. |
| **Docker** | Imagens publicadas (`xabarilcoding/healthchecksui`, operator K8s). |

Para comportamento dos pacotes, APIs e configuração em `appsettings`, use o README e a pasta `doc/` do upstream como referência principal; este README foca no que é específico do fork SG.

---

## Pacotes NuGet

Os projetos em `src/` usam **ProjectReference** entre si — padrão normal para uma única solução: `dotnet pack` gera um `.nupkg` por projeto e dependências entre os IDs publicados (`SG.*`). **PackageReference** entra em cena quando outro repositório consome estes pacotes a partir de um feed (por exemplo NuGet.org).

**Instalação (após publicação):**

```bash
dotnet add package SG.HealthChecks
dotnet add package SG.HealthChecks.UI
```

**Versão:** defina a variável de ambiente **`PACKAGE_VERSION`** antes do `pack` local, ou use o fluxo em [`.github/workflows/publish.yml`](.github/workflows/publish.yml): tag `v*`, entrada manual no `workflow_dispatch`, ou **patch automático** na `main` (consulta a última versão estável de `SG.HealthChecks.UI` no NuGet.org e publica `patch + 1`). Publicação no NuGet.org usa **Trusted Publishing** (OIDC); configure a política em nuget.org e a variável de repositório **`NUGET_USERNAME`**, conforme a secção **NuGet packages** do [`README.md`](README.md).

---

## O que está incluído (neste repo)

| Área | Descrição |
|------|-----------|
| **HealthChecks.UI** | SPA React + middleware ASP.NET Core que serve o dashboard e as APIs do UI. |
| **HealthChecks.UI.Client** | `UIResponseWriter` para expor JSON compatível com o dashboard. |
| **HealthChecks.UI.Core / Data / Storage** | Modelos, armazenamento em memória ou SQL Server (EF Core + migrações). |
| **HealthChecks.SqlServer, System, Uris, ApplicationStatus** | Checks reutilizáveis (BD, disco, URIs, processos, etc.). |
| **Pacote raiz `SG.HealthChecks`** | Metapacote na raiz (`SG.HealthCheck.csproj`) agregando dependências comuns para aplicações SG. |
| **`extensions/`** | Materiais para **Azure DevOps** (release gate / tarefas relacionadas a health checks). |

O logo **SG** faz parte da identidade do projeto open source.

---

## Requisitos

- [.NET SDK](https://dotnet.microsoft.com/download) compatível com **.NET 10** (`net10.0` nos projetos).
- **Node.js** (para rebuild dos assets React/Webpack da UI, quando alterar o front-end).

---

## Como compilar

### Bibliotecas (.NET)

```bash
dotnet build src/src.sln -c Release
```

O repositório também contém `SGI.HealthCheck.slnx` / `SG.HealthCheck.csproj` na raiz (id NuGet **`SG.HealthChecks`**) — use o fluxo que preferir para CI.

### Front-end da UI (opcional, após mudanças em `client/` ou assets)

```bash
cd src/HealthChecks.UI
npm ci
npm run build
```

Isso regenera o bundle Webpack usado pelo pacote `HealthChecks.UI` (DLL + bundle de produção).

---

## Integrar na sua API

1. Copie ou adapte **`Program.cs.EXAMPLE`** para o seu `Program.cs` (registo de `AddHealthChecks`, `AddHealthChecksUI`, mapeamento de `/health`, `/healthchecks-ui`, etc.).
2. Use **`appsettings.Example.json`** como base para logging e configuração.
3. Para persistência do histórico do dashboard além da memória, troque `AddInMemoryStorage()` por **`AddSqlServerStorage(connectionString)`** (ver comentários no exemplo).

Detalhes adicionais (polling, `UIResponseWriter`, webhooks, URLs relativas) seguem o mesmo modelo descrito no [README do Xabaril](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks#healthcheckui).

---

## Endpoints típicos

| Caminho | Uso |
|---------|-----|
| `/health` | Relatório de health (JSON, adequado ao UI). |
| `/health/live` | Liveness (ex.: Kubernetes). |
| `/health/ready` | Readiness (ex.: dependências). |
| `/healthchecks-ui` | Dashboard. |
| `/healthchecks-api` | API consumida pelo SPA. |

Ajuste caminhos e títulos conforme o seu `MapHealthChecksUI`.

---

## Segurança e segredos

- **Não commite** connection strings, passwords ou tokens. Use [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets), variáveis de ambiente ou um cofre (ex.: Azure Key Vault) em produção.
- Ficheiros **`.env`** (Docker Compose / dev local) costumam conter credenciais ou placeholders — mantenha-os **fora do Git** (`.gitignore`) e partilhe apenas um **`.env.example`** sem valores sensíveis, se necessário.
- O dashboard e os endpoints de health revelam **estado dos serviços**. Em ambientes expostos à internet, proteja com rede restrita (VPN, ingress privado), autenticação ou políticas equivalentes — alinhado às recomendações do upstream sobre UI sensível e [proteção com OpenID Connect](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks#protected-healthchecksui-with-openid-connect).

---

## Licença e atribuição

O projeto é distribuído sob a licença **Apache 2.0** — ver o ficheiro [`LICENSE`](LICENSE).

Código derivado de [**AspNetCore.Diagnostics.HealthChecks**](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks) deve manter as obrigações e boas práticas de atribuição da licença Apache 2.0 e do projeto original.

**Marca:** o nome e o logo **SG** são identidade deste fork; respeite as diretrizes de uso ao redistribuir.

---

## Autores

**Menphis Sistemas Inteligentes** — pacotes e manutenção orientados a plataformas SG.

**Jefferson Saul Gonçalves Motta** — [jsmotta.com.br](https://jsmotta.com.br)

Contribuições, issues e melhorias são bem-vindas.
