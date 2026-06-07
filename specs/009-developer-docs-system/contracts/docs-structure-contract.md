# Contract — Estrutura de `docs/` e arquivos obrigatórios

**Feature**: 009-developer-docs-system

A "interface exposta" desta feature é a árvore de arquivos da documentação. Este
contrato define o que DEVE existir para a entrega ser considerada completa. Cada
item rastreia um requisito funcional (FR) e/ou critério de sucesso (SC).

## C1 — Árvore obrigatória

```text
docs/
├── README.md                              # FR-003 (índice/manual principal + glossário)
├── _templates/
│   └── documento-modelo.md                # FR-020
├── getting-started/
│   ├── README.md                          # índice da seção
│   ├── instalacao.md                      # US1 / SC-001
│   ├── rodar-em-dev.md                    # US1 / SC-001
│   └── primeiro-cliente.md                # US1 / SC-002
├── architecture/
│   ├── README.md
│   ├── arquitetura-em-camadas.md          # FR-005 / FR-006 / SC-004
│   ├── filosofia-operacional.md           # FR-018
│   └── diagramas.md                       # FR-015 (estrutura de pastas, composição)
├── core/
│   ├── README.md
│   ├── motor-de-renderizacao.md           # FR-009 / FR-010 (DynamicSection, ciclo de vida)
│   ├── schemas-e-validacao.md             # FR-013 base (Zod, validateWebsiteConfig)
│   └── registries.md                      # FR-009 (dois registries, D6)
├── templates/
│   ├── README.md
│   └── estrategia-de-nicho.md             # FR-015 (composição de templates)
├── clients/
│   ├── README.md
│   ├── config-json.md                     # FR-013 (estrutura, campos, exemplos reais)
│   └── isolamento-e-dominios.md           # camada clients
├── components/
│   ├── README.md
│   └── padroes-de-componente.md           # FR-011 / FR-012 (componente "válido")
├── onboarding/
│   ├── README.md
│   └── fluxo-de-onboarding.md             # FR-007 (onboarding) / FR-015
├── deployment/
│   ├── README.md
│   └── deploy.md                          # FR-007 (deploy) / FR-015 (hoje vs futuro)
├── guides/
│   ├── README.md                          # índice dos 13 guias
│   ├── criar-novo-cliente.md              # FR-007.1
│   ├── criar-novo-template.md             # FR-007.2
│   ├── adicionar-componente.md            # FR-007.3
│   ├── adicionar-tipo-de-secao.md         # FR-007.4 (VR-4: dois registries)
│   ├── registrar-secao-no-renderer.md     # FR-007.5 (VR-4)
│   ├── criar-novo-schema-json.md          # FR-007.6
│   ├── adicionar-secao-a-site-existente.md# FR-007.7
│   ├── customizar-tema-cores.md           # FR-007.8
│   ├── adicionar-seo.md                   # FR-007.9
│   ├── adicionar-assets-imagens.md        # FR-007.10
│   ├── configurar-dominios.md             # FR-007.11
│   ├── como-funciona-deploy.md            # FR-007.12
│   └── como-funciona-onboarding.md        # FR-007.13
├── standards/
│   ├── README.md
│   ├── padroes-de-desenvolvimento.md      # FR-016
│   ├── padroes-de-configuracao-json.md    # FR-013 (tipagem, evolução de schema)
│   └── escala-futura.md                   # FR-019
└── troubleshooting/
    ├── README.md
    └── problemas-comuns.md                # FR-017 (7+ sintomas)
```

> Os nomes de arquivo são o alvo recomendado; agrupar/dividir é aceitável desde
> que TODO requisito mapeado abaixo permaneça coberto e linkado a partir do
> README correspondente.

## C2 — Regras de conteúdo (todas obrigatórias)

- **CT-1 (FR-001)**: As 11 subpastas DEVEM existir, todas com `README.md` índice.
- **CT-2 (FR-002/D2)**: Todo conteúdo em PT-BR; termos técnicos em inglês
  explicados na 1ª ocorrência; glossário no `docs/README.md`.
- **CT-3 (FR-003)**: `docs/README.md` cobre os 10 tópicos do FR-003 (o que é,
  missão, arquitetura, geração de sites, filosofia JSON-driven, camadas, rodar
  local, criar cliente, dev mode, deploy).
- **CT-4 (FR-004/SC-007)**: Todo documento termina com "Próximos passos" com ≥1
  link interno. Nenhum beco sem saída.
- **CT-5 (FR-006/SC-004)**: A doc de arquitetura lista, por camada, o que
  pertence, o que NUNCA pertence e o anti-padrão (tabela da data-model).
- **CT-6 (FR-008)**: Cada guia em `guides/` contém as 5 seções obrigatórias
  (Explicação, Localização, Exemplo, Convenções, Erros comuns).
- **CT-7 (FR-010/FR-015/D3)**: Os 5 diagramas Mermaid obrigatórios presentes,
  com o fluxo de renderização refletindo a cadeia canônica D5.
- **CT-8 (FR-017/SC-005)**: `troubleshooting/` cobre os 7 sintomas: seção não
  renderiza, config inválido, assets faltando, hidratação, SSR, deployment,
  resolução de template — cada um com sintoma, causa, correção.
- **CT-9 (FR-020)**: `_templates/documento-modelo.md` existe e é referenciado
  pelo guia de contribuição/standards.
- **CT-10 (FR-021/SC-006)**: Todo snippet/estrutura rastreável a um caminho real
  do repo, citado no documento.

## C3 — Critério de aceitação do contrato

A entrega passa quando: todos os caminhos de C1 (ou equivalentes agrupados)
existem; CT-1..CT-10 satisfeitos; e uma passagem de inspeção confirma SC-001..008
da spec. Verificação é manual (Testing, research D7).
