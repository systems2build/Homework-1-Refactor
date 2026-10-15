# Accessible Marketing Site

An accessibility-focused, responsive refactor of a sample marketing landing page. This is an educational project, not a production marketing service.

## What Changed

- Replaced malformed and duplicated markup with semantic header, nav, main, section, aside, and footer landmarks.
- Added one descriptive H1, ordered headings, a keyboard-accessible skip link, visible focus styles, meaningful illustration descriptions, and decorative icon alt text.
- Kept the original three in-page service navigation destinations and the key marketing content.
- Replaced four oversized JPEGs (about 47.7 MB combined) with small, locally hosted vector illustrations. The old images remain in Git history but no longer appear in this branch.
- Added a responsive layout and a reduced-motion preference.
- Added dependency-free Node checks and a pull-request validation workflow.

## Run And Verify

Serve this folder using a static HTTP server, such as Python's built-in http.server, then open http://localhost:8000/ in your browser.

Run: npm test

Also perform a manual keyboard pass, inspect the page at phone/tablet/desktop widths, and run an accessibility checker. The Node checks are structural safeguards, not a WCAG certification or a substitute for assistive-technology testing.

## Source And Attribution

Refactored from the Horiseon marketing page provided for the University of Texas coding bootcamp assignment. Source: https://github.com/coding-boot-camp/urban-octo-telegram

## Repository Naming

Human-facing project name: Accessible Marketing Site.
Suggested GitHub repository slug: accessible-marketing-site.
Renaming the GitHub repository itself is an administrative change; this branch does not rename the remote.
