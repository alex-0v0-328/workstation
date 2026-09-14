# Workstation 0.1

Local-first Windows 11 x64 desktop application. SQLite owns semesters, courses, assessments, manual tasks, timetable events, settings, and digest progress. One Gmail account; no application account or cloud synchronization.

## Accepted behavior

- TODO aggregates assessment records and manual tasks without duplication. Completion is independent of grades and hurdle status.
- Semesters and courses are user-defined. Dates may be unknown or date-only. Assessment types are extensible. Weights and scores are optional; no implicit rescaling or pass prediction.
- Hurdles retain original requirements with manual confirmation and optional assessment links.
- Timetables accept ICS files, subscription URLs, and manual events. Imports preview before applying. External HTML pages are links, not scraped sources.
- Windows Fluent is the first theme, with system/light/dark modes. Developer-shipped themes may replace layouts through a common view model and actions.
- Gmail is read-only. Mail content is untrusted. DeepSeek translates individual messages and summarizes new inbox mail at 20:00 by default, including read messages. Attachments are excluded.
- Close-to-tray, opt-in login launch, persistent reminder/digest state, backup and restore are part of the first delivery. Missed work is coalesced after resume.

## Delivery sequence

1. Desktop/data/theme foundation and typed IPC.
2. Study wizard, reusable template, TODO, grades, timetable, backup.
3. Gmail OAuth, safe reading, translation, daily digest, scheduling.
4. Automated tests, UI inspection, installer, setup and acceptance documentation.

## Defaults and boundaries

One local profile, one Gmail account, Chinese UI, system time zone, no repeating manual tasks. Semester/course archive retains history. User-created theme packages and layout editors are outside 0.1. Credentials are encrypted using Windows-backed Electron safeStorage, never exported. Backup restores local study/task/settings data and re-creates caches from providers.

Live provider tests require user-owned OAuth configuration and a DeepSeek key. A packaged build is not proof of notification delivery, OAuth success, or real timetable compatibility.
