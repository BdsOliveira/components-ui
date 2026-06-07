# Guias How-To

> **Pré-requisitos**: [Índice principal](../README.md). Para os guias de extensão,
> ajuda ter lido [arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
> **Tema**: guides

Guias passo a passo (FR-007). Cada guia segue as 5 seções obrigatórias do FR-008,
nesta ordem: **Explicação → Localização dos arquivos → Exemplo prático →
Convenções esperadas → Erros comuns** (+ Próximos passos). Todos os exemplos citam
caminhos reais do repositório.

## Os 13 guias

### Criar e estender

1. [Criar um novo cliente](./criar-novo-cliente.md)
2. [Criar um novo template](./criar-novo-template.md)
3. [Adicionar um componente reutilizável](./adicionar-componente.md)
4. [Adicionar um novo tipo de seção](./adicionar-tipo-de-secao.md) — **dois registries**
5. [Registrar uma seção no renderizador](./registrar-secao-no-renderer.md) — **dois registries**
6. [Criar um novo schema JSON](./criar-novo-schema-json.md)

### Configurar e manter sites existentes

7. [Adicionar uma seção a um site existente](./adicionar-secao-a-site-existente.md)
8. [Customizar temas/cores](./customizar-tema-cores.md)
9. [Adicionar metadados de SEO](./adicionar-seo.md)
10. [Adicionar assets/imagens](./adicionar-assets-imagens.md)
11. [Configurar domínios](./configurar-dominios.md)

### Entender o pipeline

12. [Como o deployment funciona](./como-funciona-deploy.md)
13. [Como o fluxo de onboarding funciona](./como-funciona-onboarding.md)

## Regra de ouro: "dois registries"

Um `type` de seção só funciona quando registrado nos DOIS lugares, em `register.ts`:

Fonte: `sites/core/components/sections/register.ts`

```ts
registerSection(defineSection('hero', heroSchema))   // validável (schema)
registerSectionComponent('hero', HeroSection)        // renderável (componente)
```

Esquecer um lado é a causa nº 1 de "config inválido" (faltou schema) ou "seção
não renderiza" (faltou componente). Os guias 4 e 5 martelam isso.

## Próximos passos

- Vá ao guia que precisa na lista acima.
- Consulte os [padrões de configuração JSON](../standards/padroes-de-configuracao-json.md).
- Se algo quebrar: [troubleshooting](../troubleshooting/problemas-comuns.md).
- [Voltar ao índice principal](../README.md)
