# SG Health Check

**English** | [Português (Brasil)](README.pt-br.md)

An **ASP.NET Core** stack for **health checks** with a **web dashboard** (Health Checks UI), aimed at monitoring APIs and dependencies on SG / Source Genesys platforms.

This repository is a **brand- and package-oriented fork** using the **SG.** prefix, based on the community project [**AspNetCore.Diagnostics.HealthChecks**](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks).

---

## NuGet packages

### Project references versus published packages

The projects under `src/` use **ProjectReference** links to each other. That is the usual pattern for one solution: `dotnet pack` produces one `.nupkg` per packable project and records dependencies between the published package IDs (`SG.*`). You would switch to **PackageReference** only when consuming these libraries from another repository after they are available on a feed (for example NuGet.org).

### Install from NuGet.org

After packages are published, add them to an ASP.NET Core project (examples):

```bash
dotnet add package SG.HealthChecks
dotnet add package SG.HealthChecks.UI
dotnet add package SG.HealthChecks.UI.Client
```

**`SG.HealthChecks`** is the **meta-package** at the repository root (`SG.HealthCheck.csproj`): it pulls in Microsoft health-check, EF Core SQL Server, HTTP, and related dependencies used across SG stacks. Individual features (dashboard, storage, checks) ship as **`SG.HealthChecks.*`** packages built from `src/src.sln`.

### Controlling package version

| Mechanism | Effect |
|-----------|--------|
| Environment variable **`PACKAGE_VERSION`** | MSBuild reads it as a property; when set, it overrides the default version in `src/Directory.Build.props` and in `SG.HealthCheck.csproj` for packs. |
| **`dotnet pack -p:Version=… -p:PackageVersion=…`** | Same as above for one-off builds (used in CI). |
| **`./pack.ps1`** | Passes `PACKAGE_VERSION` through to `dotnet pack` when the variable is set in the shell. |

Default library version in `src/Directory.Build.props` is **10.0.0** until you override it.

### CI publish and GitHub secret

The workflow [`.github/workflows/publish.yml`](.github/workflows/publish.yml) restores, builds, tests, packs `src/src.sln` and the root meta-project, then pushes `artifacts/nuget/*.nupkg` to **NuGet.org** using the **`NUGET_AUTH_TOKEN`** secret.

**Version resolution in CI (first match wins):**

1. Manual run: input **version** on `workflow_dispatch`.
2. Push of a Git tag **`v*`** (for example `v2.1.0` → version `2.1.0`).
3. Repository **variable** `PACKAGE_VERSION` (Settings → Secrets and variables → Actions → **Variables**) to pin a default version for `main` when you do not use tags or manual input.

Let me read workflow again for variable name - I used `vars.PACKAGE_VERSION` - document as GitHub Actions **repository variable** `PACKAGE_VERSION`

4. Otherwise on **`main`**: `1.0.0-ci.<GitHub run number>` (unique prerelease builds).

**Configure `NUGET_AUTH_TOKEN` in GitHub**

1. On [nuget.org](https://www.nuget.org/) sign in → **Account** → **API keys** → create a key with scope **Push** (at least for the package IDs you own).
2. In the GitHub repository: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Name: **`NUGET_AUTH_TOKEN`**, value: the API key string. Save.

Use a **repository variable** (not a secret) named **`PACKAGE_VERSION`** if you want every `main` build to use a fixed semver until you change the variable; leave it unset to keep the automatic `1.0.0-ci.*` scheme.

---

## Upstream project (official documentation)

Full documentation—including the complete NuGet package list, Kubernetes, Docker, Azure DevOps, and samples—is in the official repository:

**[https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks)**

| Topic upstream | What you will find |
|----------------|-------------------|
| **Health Checks** | Many integrations (SQL, Redis, Azure, AWS, etc.) and the *push* results model. |
| **Health Checks UI** | Storage providers, migrations, history, webhooks, HTTP client customization. |
| **Kubernetes** | Operator and automatic service discovery. |
| **DevOps** | Release Gates for Azure Pipelines. |
| **Docker** | Published images (`xabarilcoding/healthchecksui`, K8s operator). |

For package behavior, APIs, and `appsettings` configuration, use the upstream README and `doc/` folder as the primary reference; this README focuses on what is specific to the SG fork.

---

## What is included (this repo)

| Area | Description |
|------|-------------|
| **HealthChecks.UI** | React SPA + ASP.NET Core middleware serving the dashboard and UI APIs. |
| **HealthChecks.UI.Client** | `UIResponseWriter` to expose JSON compatible with the dashboard. |
| **HealthChecks.UI.Core / Data / Storage** | Models, in-memory or SQL Server storage (EF Core + migrations). |
| **HealthChecks.SqlServer, System, Uris, ApplicationStatus** | Reusable checks (database, disk, URIs, processes, etc.). |
| **Root package `SG.HealthChecks`** | Meta-package aggregating common dependencies for SG applications (`SG.HealthCheck.csproj`). |
| **`extensions/`** | **Azure DevOps** materials (release gate / health-check-related tasks). |

The **SG** logo is part of the open source project identity.

---

## Requirements

- [.NET SDK](https://dotnet.microsoft.com/download) compatible with **.NET 10** (`net10.0` in the projects).
- **Node.js** (to rebuild React/Webpack UI assets when you change the front end).

---

## Build

### Libraries (.NET)

```bash
dotnet build src/src.sln -c Release
```

The repository also contains `SGI.HealthCheck.slnx` / `SG.HealthCheck.csproj` at the root (NuGet id **`SG.HealthChecks`**)—use whichever workflow fits your CI.

### UI front end (optional, after changes under `client/` or assets)

```bash
cd src/HealthChecks.UI
npm ci
npm run build
```

This regenerates the Webpack bundle consumed by the `HealthChecks.UI` package (DLL + production bundle).

---

## Integrate into your API

1. Copy or adapt **`Program.cs.EXAMPLE`** into your `Program.cs` (register `AddHealthChecks`, `AddHealthChecksUI`, map `/health`, `/healthchecks-ui`, etc.).
2. Use **`appsettings.Example.json`** as a starting point for logging and configuration.
3. To persist dashboard history beyond memory, replace `AddInMemoryStorage()` with **`AddSqlServerStorage(connectionString)`** (see comments in the example).

Further details (polling, `UIResponseWriter`, webhooks, relative URLs) follow the same patterns described in the [Xabaril README](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks#healthcheckui).

---

## Typical endpoints

| Path | Purpose |
|------|---------|
| `/health` | Health report (JSON, suitable for the UI). |
| `/health/live` | Liveness (e.g. Kubernetes). |
| `/health/ready` | Readiness (e.g. dependencies). |
| `/healthchecks-ui` | Dashboard. |
| `/healthchecks-api` | API consumed by the SPA. |

Adjust paths and titles to match your `MapHealthChecksUI` setup.

---

## Security and secrets

- **Do not commit** connection strings, passwords, or tokens. Use [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets), environment variables, or a vault (e.g. Azure Key Vault) in production.
- **`.env`** files (Docker Compose / local dev) often hold credentials or placeholders—keep them **out of Git** (`.gitignore`) and share only a **`.env.example`** without sensitive values when needed.
- The dashboard and health endpoints expose **service state**. On internet-facing environments, protect them with restricted networking (VPN, private ingress), authentication, or equivalent policies—consistent with upstream guidance on sensitive UI and [OpenID Connect protection](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks#protected-healthchecksui-with-openid-connect).

---

## License and attribution

This project is distributed under the **Apache 2.0** license—see [`LICENSE`](LICENSE).

Code derived from [**AspNetCore.Diagnostics.HealthChecks**](https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks) must comply with Apache 2.0 attribution practices and the original project.

**Brand:** the **SG** name and logo identify this fork; respect usage guidelines when redistributing.

---

## Authors

**Menphis Sistemas Inteligentes** — packages and maintenance for SG platforms.

**Jefferson Saul Gonçalves Motta** — [jsmotta.com.br](https://jsmotta.com.br)

Contributions, issues, and improvements are welcome.
