# CC-02I-01 — Production Contract and Locale API

## Revision note (R1)

Revision 1 of this ticket per ChatGPT's REVISE AND RESUBMIT finding on the
CC-02I-PREP Stage Gate bundle. Changes from the original: the Hero locale
schema is now a fixed, final, named-object contract (R1-02) instead of a
"decide at implementation time" array-based shape — this ticket now starts
with a schema that is already implementable, with no open question left for
the ticket owner to resolve mid-flight.

## 1. Ticket ID

CC-02I-01

## 2. Title

Production data contract and Locale API for Hero/Header — no visual change

## 3. Purpose

Establish the production-side data contract this whole stage depends on
before any visual component work starts: the Hero/Header copy moves out of
the prototype-only `src/data/cc02-final-hero.ts` shape and into the real
`Dictionary` (`src/data/locales/{zh-tw,en}.ts`) that `getDictionary()`
already serves, using the fixed named-object schema below. This ticket
produces no visible change to the live site — it only adds new,
unused-until-CC-02I-05/CC-02I-04 dictionary keys and confirms the typing
compiles.

## 4. Dependencies

None — this is the first ticket in the stage.

## 5. Allowed paths

- `src/data/locales/zh-tw.ts`
- `src/data/locales/en.ts`

Not allowed unless a concrete implementation blocker is found and recorded
as a spec deviation (see §17): `src/utils/i18n.ts`. The fixed schema below
is designed to fit `DeepString<typeof zhTW>` without touching that file —
if it turns out not to fit, that is itself a stop-and-record condition, not
a silent workaround.

## 6. Forbidden paths

- `src/pages/**`
- `src/components/**`
- `src/config/**` (site.ts / nav.ts are read-only inputs, not edited here)
- `public/**`

## 7. Expected files

- Modified: `src/data/locales/zh-tw.ts`, `src/data/locales/en.ts`

## 8. Implementation requirements

Add a `hero` key to both locale dictionaries using this **final, fixed**
schema — not an array, not a placeholder shape to be revised later:

```ts
hero: {
  eyebrow: string;
  headline: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  visualAlt: string;
  secondaryVisualAlt: string;

  ledger: {
    input: { heading: string; detail: string };
    evaluation: { heading: string; detail: string };
    output: { heading: string; detail: string };
  };

  processRail: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    railLabel: string;
    stateLabels: {
      unconnected: string;
      aligned: string;
      connected: string;
    };
  };
}
```

zh-TW values (verbatim from the CC-02F spec, §4/§9/§11/§12):

```ts
hero: {
  eyebrow: '精密自動化整合',
  headline: '把定位、檢測與組裝，\n校準成可導入的生產流程。',
  body: '從工件、節拍到現場限制，鋒岳整合精密運動、視覺定位與模組化工作站，\n建立可評估、可配置、可驗證的自動化方案。',
  ctaPrimary: '開始專案評估',
  ctaSecondary: '查看導入條件',
  visualAlt: '精密運動模組、視覺定位頭與組裝工作站沿模組組裝軸連接的系統示意圖',
  secondaryVisualAlt: '視覺定位頭近拍與對齊節點細節',
  ledger: {
    input: { heading: '需求輸入', detail: '工件圖、目標節拍、現場限制' },
    evaluation: { heading: '評估範圍', detail: '定位、檢測、組裝與站點整合' },
    output: { heading: '交付輸出', detail: '系統架構、模組配置、驗收條件' },
  },
  processRail: {
    step1: '需求輸入',
    step2: '方案評估',
    step3: '模組配置',
    step4: '驗證條件',
    railLabel: '流程階段導覽',
    stateLabels: { unconnected: '待處理', aligned: '準備中', connected: '進行中' },
  },
},
```

en values (verbatim):

```ts
hero: {
  eyebrow: 'Precision Automation Integration',
  headline: 'Align positioning, inspection and assembly\ninto a production-ready system.',
  body: 'From parts and cycle time to site constraints, FORGEON combines precision motion,\nvision positioning and modular workstations into an automation solution that can be\nevaluated, configured and verified.',
  ctaPrimary: 'Start a Project Assessment',
  ctaSecondary: 'Review Integration Requirements',
  visualAlt: 'System diagram of a precision motion module, vision positioning head and assembly workstation connected along one assembly axis',
  secondaryVisualAlt: 'Close-up of the vision positioning head and its alignment node',
  ledger: {
    input: { heading: 'Project Inputs', detail: 'Part drawings, target cycle time, site constraints' },
    evaluation: { heading: 'Evaluation Scope', detail: 'Positioning, inspection, assembly and station integration' },
    output: { heading: 'Project Outputs', detail: 'System architecture, module configuration, acceptance criteria' },
  },
  processRail: {
    step1: 'INPUT',
    step2: 'EVALUATE',
    step3: 'CONFIGURE',
    step4: 'VERIFY',
    railLabel: 'Process stages',
    stateLabels: { unconnected: 'Pending', aligned: 'Preparing', connected: 'In progress' },
  },
},
```

**Rendering contract**: `processRail.step1`–`step4` are individually named
keys (not an array) so the dictionary stays a plain `DeepString`-compatible
object. `ProcessRail.astro`/`Hero.astro` assembles them into an array in a
fixed order (`[step1, step2, step3, step4]`) at render time — the ordering
logic lives in the component, not the data. Do not change this back to an
array in the dictionary itself.

Confirm `Dictionary` (the `DeepString<typeof zhTW>` type) resolves
correctly against `en.ts`'s shape — `pnpm check` and `pnpm typecheck` must
pass with zero new errors, using the schema exactly as specified above.

Do not import or reference `src/data/cc02-final-hero.ts` from production
code — it stays untouched, still used only by CC-02F's own prototype route
and tests.

## 9. Design requirements

None — this ticket is data-only, no CSS/visual work.

## 10. Accessibility requirements

- `visualAlt`/`secondaryVisualAlt`/`processRail.railLabel` strings must be
  real, descriptive text (not empty strings, not placeholder text) since
  CC-02I-05/CC-02I-03 will wire them directly into `aria-label`s.

## 11. Performance requirements

None (static data, zero runtime cost either way).

## 12. Locale requirements

This ticket *is* the locale requirement — see §8. Both `zh-tw` and `en`
must be added in the same commit; do not ship one locale without the
other.

## 13. Tests

- `pnpm check` — 0 errors, 0 warnings.
- `pnpm typecheck` — 0 errors.
- `pnpm build` — succeeds, same page count as before this ticket (data
  addition alone must not break the build — nothing consumes the new keys
  yet).

## 14. Acceptance criteria

- [ ] `hero` key present in both `zh-tw.ts` and `en.ts`, matching the fixed
      schema in §8 exactly — no array-based `ledger` or `processRail`.
- [ ] All string values match the CC-02F spec's verbatim copy exactly
      (character-for-character diff against `docs/engineering/specs/
      CC-02F-final-editorial-hero.md` §4 and `src/data/cc02-final-hero.ts`).
- [ ] `pnpm check` passes with 0 errors, 0 warnings.
- [ ] `pnpm typecheck` passes with 0 errors.
- [ ] `pnpm build` still succeeds.
- [ ] No file outside §5's allowed paths is modified.
- [ ] No open schema question is left for a later ticket — the shape in §8
      is final.

## 15. Completion evidence

- `pnpm check` output (0/0).
- `pnpm typecheck` output.
- `pnpm build` output (unchanged page count).
- Diff of both locale files for reviewer verbatim-copy verification.

## 16. Handoff requirements

Standard `agent:checkpoint` / `agent:handoff` per
`docs/agents/DUAL_AGENT_PROTOCOL.md`. Handoff narrative must state which
dictionary keys were added, in Traditional Chinese, per
`docs/agents/COMMUNICATION_POLICY.md`.

## 17. Rollback/failure conditions

The schema in §8 is final and pre-verified to fit `DeepString`'s recursive
string-leaf typing. If implementation nonetheless finds a genuine
TypeScript incompatibility, stop and record it as a spec deviation for the
next Stage Gate review rather than silently changing the shape — this
differs from the original (pre-R1) version of this ticket, which left the
schema as an open question; R1 closes that question, so a deviation here
is a real, reportable surprise, not an expected branch.

## 18. Agent eligibility

Either Claude or Codex may claim and complete this ticket — it is pure
data/typing work with no UI judgment calls.

## 19. Suggested primary agent

Either (no strong preference — recommend whichever agent is idle first).

## 20. Estimated risk

Low. Additive-only data change, fully reversible, no visual surface, no
production route touched. Schema is now fixed (R1), which further reduces
risk versus the original version of this ticket.
