# Wiring the Lemma grading agent — what's left, honestly

Everything else in this handoff (voice commands, teacher approval, manual
grading, grading-mode selector, per-question results detail) is done and
tested — the app builds and runs against Supabase alone, no Lemma required.

**AI grading is the one piece that could not be finished sight-unseen.**
Here's exactly why, and exactly what's needed to close it.

## What exists

`swarlekh-pod/agents/grading_agent/` and `swarlekh-pod/functions/` define a
grading agent and a `record_grade` Python function that runs *inside* a
Lemma pod, imported via `lemma pod import`. The Python code is solid — it
reads a `questions` + `student_answers` record, respects the exam's grading
mode, and never overwrites a teacher's manual score.

## What's missing

There is no documented way, anywhere in the handoff files, for the **React
web app** (running in a browser, deployed to Netlify) to actually call that
pod. Specifically I don't have:

- The HTTP/REST endpoint (if any) that a Lemma pod exposes for external callers
- Or a `lemma-sdk` JS/TS client package and its auth model
- Whether the pod needs to run on the same machine as the browser (Lemma
  Desktop), or is reachable over the network from Netlify

Guessing at this and writing code against an invented API would look done
but silently fail the first time you tried it — worse than leaving it
explicit. I'd rather hand you a clean seam than a fake integration.

## The seam that's ready for it

`exams.grading_mode` and `exam_sessions.grading` (added by `ADD_FEATURES.sql`)
are the exact shape `record_grade` already writes to conceptually — a
per-question `{ai_score, ai_feedback, manual_score, teacher_remarks,
final_score}` record. Submissions.tsx and Results.tsx already read and
display `ai_score` / `ai_feedback` if present; they just show "not graded
yet" while those fields are empty.

## To finish this, in your next Claude session

1. Confirm with Lemma Desktop's own docs/CLI (`lemma --help`, or whatever
   Lemma's dashboard shows after `lemma pod import`) how a pod is called
   from outside — REST URL, webhook, or client SDK.
2. Once you paste that in, wiring is small: on exam submit, POST the
   session/question ids to the grading agent; on response, write into
   `exam_sessions.grading` using the same shape already in `lib/supabase.ts`.
3. `extract_pdf_questions` (PDF → auto-detected questions) has the identical
   gap — same fix once you have the calling convention.

I know this isn't the "fully done" answer you wanted — but a working 70%
plus an honest map of the last 30% will get you there faster than a fake
100%.
