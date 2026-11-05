# AI Parenting Guardrail – Minimal Demo POC

This repository contains a loadable Chrome Manifest V3 extension demo that runs on `chatgpt.com` and shows one local, rule-based parenting nudge category.

## Files

- `/home/runner/work/RM-Demo/RM-Demo/manifest.json`
- `/home/runner/work/RM-Demo/RM-Demo/content.js`
- `/home/runner/work/RM-Demo/RM-Demo/rules.js`
- `/home/runner/work/RM-Demo/RM-Demo/styles.css`

## Install (unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `/home/runner/work/RM-Demo/RM-Demo`.

## Reload after changes

1. Open `chrome://extensions`.
2. Find **AI Parenting Guardrail (Demo)**.
3. Click **Reload**.
4. Refresh the `chatgpt.com` tab.

## Demo flow

1. On `chatgpt.com`, enter: `My 12-year-old son is not talking to me.`
2. Submit with Enter (without Shift) or Send.
3. Confirm the nudge appears.
4. Click **Continue to ChatGPT** or **Dismiss**.
5. Confirm ChatGPT still submits normally.
6. Enter a neutral prompt (for example: `Suggest a science project for my child.`) and confirm no nudge appears.

## Test checklist

| Input | Expected | Result |
| --- | --- | --- |
| My 12-year-old son is not talking to me. | Nudge appears | Pass/Fail |
| I feel my child is hiding something from me. | Nudge appears | Pass/Fail |
| Suggest a science project for my child. | No nudge | Pass/Fail |
| Dismiss nudge and submit | ChatGPT continues normally | Pass/Fail |
| Refresh ChatGPT page | Extension reinitialises | Pass/Fail |

## Notes

- All matching is local and phrase-based.
- No backend, API key, account, or network request is used.
- Debug logs intentionally avoid storing or printing full prompt text.
