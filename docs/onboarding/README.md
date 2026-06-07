# Onboarding

> **Pré-requisitos**: [Índice principal](../README.md).
> **Tema**: onboarding

Onboarding é a captação dos dados do cliente antes de o site ser montado. Esta
seção descreve o fluxo de hoje (scaffold) e a evolução planejada (intake/IA).

## Documentos

- [Fluxo de onboarding](./fluxo-de-onboarding.md) — do intake ao site, hoje vs futuro.

## A camada `onboarding/`

Fonte: `sites/onboarding/README.md`

```text
**Responsibility**: Intake form data and onboarding input — the raw client
information captured before a client site is assembled.
**Allowed**: Onboarding form data, intake submissions, and the structures that hold captured client input.
**Prohibited**: Rendering logic and components (→ core), and assembled client config (→ clients).
```

## Próximos passos

- Veja o fluxo: [fluxo de onboarding](./fluxo-de-onboarding.md).
- [Voltar ao índice principal](../README.md)
