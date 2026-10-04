# Birthday Card Creator

DOBVERSE — FINAL IMPLEMENTATION + QA TASK
============================================================

You are working on an EXISTING DOBverse project that has already been imported into this workspace.

IMPORTANT:

- DO NOT rebuild the project from scratch.
- DO NOT replace the existing architecture unnecessarily.
- DO NOT remove working functionality.
- First inspect the existing project/codebase and understand the current implementation.
- Continue from the current state.
- The existing DOBverse pages, routing, theme system, local data storage, calculations, and completed functionality must be preserved.
- I will provide the relevant UI mockups as image references. USE THE UPLOADED MOCKUPS AS THE PRIMARY VISUAL SOURCE OF TRUTH.
- Reproduce the mockups as closely as realistically possible: layout, dimensions, spacing, typography, colors, gradients, borders, shadows, icons, imagery, card proportions, sidebar, header, buttons, and overall visual hierarchy.
- Do not create a generic approximation.
- Do not invent a different design.
- Do not simplify the UI just because implementation is complex.

============================================================
CURRENT PROJECT STATUS
============================================================

The following work has already been implemented:

1. Calendar

- Dynamic birthday data
- Today's date highlight
- Selected-date birthday list
- Edit/delete birthday actions
- Add birthday directly for selected date
- Empty-state handling
- Upcoming birthdays fallback
- "Today!" handling
- February 29 birthday handling

2. Compare Birthdays

- Uses real saved people
- User/self can be selected
- Person A and Person B selection
- Add new person
- Editing/deleting people updates comparison
- No fake/demo people
- Empty-state handling

3. Birthday Reminders

- No demo/example data
- Individual reminder switches
- Reminder timing options
- Reminder date calculation
- Set Reminder flow
- Browser notification handling
- Data persisted locally

4. Life Timeline

- Dynamic calculations already exist
- Global Light/Dark theme support has been fixed
- Do NOT change its calculations or functionality unnecessarily

5. Birth Year Snapshot

- Page exists
- Birth year comes from saved DOB dynamically
- World Population / GDP / Life Expectancy data exists
- World leaders / India / timeline / historical data exists
- Best Selling Car and Top TV Show cards exist
- Images have been added for several cards
- Timeline arrows exist
- Light/Dark theme support exists

IMPORTANT:
These existing features must remain intact.

============================================================
MAIN TASK
============================================================

FINISH THE REMAINING DOBverse WORK IN THIS ORDER:

1. FULLY IMPLEMENT BIRTHDAY CARD GENERATOR
2. VISUALLY QA AND POLISH BIRTH YEAR SNAPSHOT
3. VISUALLY QA AND POLISH LIFE TIMELINE
4. REGRESSION TEST CALENDAR
5. REGRESSION TEST COMPARE BIRTHDAYS
6. REGRESSION TEST BIRTHDAY REMINDERS
7. FINAL BUILD / ERROR / RESPONSIVE CHECK

Do not stop after creating the UI.
The Birthday Card Generator must be genuinely functional.

============================================================
PART 1 — BIRTHDAY CARD GENERATOR
============================================================

I am providing a Birthday Card Generator mockup.

USE THAT MOCKUP AS THE PRIMARY VISUAL REFERENCE.

The final page must closely reproduce the uploaded Birthday Card Generator design.

The page must not remain a placeholder.

The complete functional experience should include:

---

A. PAGE STRUCTURE
------------------------------------------------------------

Create the full Birthday Card Generator workspace:

LEFT:

- DOBverse sidebar
- Existing global navigation
- Birthday Card Generator selected/highlighted
- Existing sidebar theme behavior

TOP:

- Existing DOBverse header
- Greeting/header area consistent with the rest of the application
- Date selector
- Notification icon
- Share App
- Theme toggle
- User/profile control

MAIN:

- Page title:
  "Birthday Card Generator 🎉"
- Subtitle:
  "Design beautiful birthday cards with drag & drop. Move, resize and rotate elements freely."

- "How it works?" button

- Step navigation:
  1. Select Person
  2. Design Card
  3. Preview & Download

The active step should visually match the mockup.

---

B. SELECT PERSON
------------------------------------------------------------

Use REAL DOBverse saved people.

Do NOT use hardcoded/demo people.

The user should be able to:

- Select an existing saved person
- Select themselves if self data exists
- Add a new person
- Change the selected person
- See the selected person's:
  - Name
  - Date of birth
  - Photo if available

When a person is selected, their information must automatically populate the card.

If no people exist:

- Show a proper empty state
- Provide an Add Person action
- Do not display fake data

The selected person should remain synchronized with the saved birthday/person data.

---

C. PHOTO UPLOAD
------------------------------------------------------------

Implement real photo upload.

Requirements:

- Upload photo from device
- Support JPG / PNG / WebP
- Validate reasonable file size
- Show preview
- Allow replacing the photo
- Allow removing the photo
- Store/use the image locally where appropriate
- Do not upload user photos to an external server unnecessarily
- Respect DOBverse's privacy-first/local-data design

The uploaded photo should be usable as a card element.

---

D. CARD SETTINGS
------------------------------------------------------------

Implement the settings shown in the mockup.

CARD SIZE:

Support:

- Portrait (1080 × 1350)
- Other sizes if already defined in the existing card-generator setup

Use the existing configuration already added to the project where possible.

THEME:

- Light
- Dark

BACKGROUND:

Allow selecting from the existing 7 prepared template/background styles:

1. Floral
2. Dark & Gold
3. Pink Floral
4. Green Floral
5. Balloons
6. Birthday Cake
7. Cosmic

The selected background must immediately update the card preview.

BACKGROUND COLOR:

Implement the color choices shown in the mockup.

RESET DESIGN:

Reset the current card to a clean/default state.

Do not delete saved designs when resetting the current design.

---

E. EDITABLE CARD CANVAS
------------------------------------------------------------

This is the most important part.

Create a real editable birthday-card canvas.

The canvas must support draggable/editable elements.

Users should be able to:

- Add elements
- Select elements
- Move elements
- Resize elements
- Rotate elements where appropriate
- Delete elements
- Duplicate elements where appropriate
- Change text content where applicable
- Reposition elements freely

Selected elements should show a visual selection boundary similar to the mockup.

The canvas should visually resemble the uploaded mockup.

Do not create a static image pretending to be an editor.

The card must actually be editable.

---

F. ELEMENTS PANEL
------------------------------------------------------------

Implement the right-side Elements panel from the mockup.

Elements:

1. Photo
2. Name
3. DOB
4. Age
5. Zodiac
6. Flower
7. Birthstone
8. Moon
9. Quote
10. Countdown
11. QR Code
12. Divider
13. Balloons
14. Cake
15. Icons
16. Shapes

Each element should be selectable and addable to the card.

When an element is added:

- It should appear on the card
- It should be selectable
- It should be movable
- It should be resizable where applicable
- It should be removable

---

G. DYNAMIC PERSONAL DATA
------------------------------------------------------------

The card must use actual DOBverse data.

For the selected person dynamically calculate/show:

- Name
- Date of Birth
- Age
- Day of birth
- Zodiac sign
- Birth flower
- Birthstone
- Moon phase
- Birthday countdown
- Other supported DOBverse calculations

Do NOT hardcode:

- Amit Kumar
- 15 Aug 2003
- Age 21
- Leo
- Gladiolus
- Peridot
- etc.

Those values in the mockup are examples only.

The actual selected person's data must appear.

---

H. QUOTE ELEMENT
------------------------------------------------------------

Provide editable birthday quote text.

The user should be able to:

- Add a quote
- Edit the quote
- Move it
- Resize it
- Delete it

Use the existing DOBverse visual style.

---

I. COUNTDOWN ELEMENT
------------------------------------------------------------

The countdown must be dynamically calculated from the selected person's next birthday.

Example:
"17 Days Left"

must NOT be hardcoded.

It should update based on the actual current date and selected person's DOB.

Handle February 29 birthdays consistently with the existing DOBverse birthday logic.

---

J. QR CODE
------------------------------------------------------------

Implement a real QR code element.

The QR code should encode useful birthday/card information such as the generated card/share information where appropriate.

Do not use a fake static QR image.

If a shareable URL architecture is not currently available, implement the QR element using a safe local/card-data representation rather than inventing an external backend.

---

K. DECORATIONS
------------------------------------------------------------

Use the prepared:

- Cake
- Balloons
- Other existing decorative assets

Make them actual movable card elements.

Do not flatten everything into one static background.

The user should be able to add/remove/reposition decorations.

---

L. TEMPLATES
------------------------------------------------------------

Implement the Templates panel shown in the mockup.

Use the existing 7 prepared template backgrounds/assets.

Template selection should:

- Update the card background
- Preserve dynamic person information
- Preserve or intelligently reset layout depending on the template
- Show selected template state
- Allow switching templates

"View All" should work if appropriate.

Do not create fake template buttons that do nothing.

---

M. RECENT DESIGNS
------------------------------------------------------------

Implement the Recent Designs section.

Users should be able to save designs.

Saved designs should appear in Recent Designs.

Clicking a saved design should load it back into the editor.

Persist designs using the project's existing local storage/data architecture.

Do not require login or external database unless the existing project already uses one.

---

N. UNDO / REDO
------------------------------------------------------------

Implement functional:

- Undo
- Redo

Use the existing undo/redo setup already added to the project.

They must actually revert/restore editor changes.

At minimum track:

- Add element
- Remove element
- Move element
- Resize element
- Rotate element
- Text edits
- Template/background changes
- Element style changes

---

O. ZOOM / CANVAS CONTROLS
------------------------------------------------------------

Implement:

- Zoom out
- Zoom percentage
- Zoom in
- Fullscreen/fit view if present in mockup

Make the controls functional.

---

P. PREVIEW & DOWNLOAD
------------------------------------------------------------

Implement the Preview & Download step.

The user should be able to preview the final card without editor selection controls.

Provide:

- Download PNG
- Download PDF
- Share Card
- Save Design

These buttons must actually work.

PNG:

- Export the card at appropriate quality
- Preserve layout and visual styling

PDF:

- Generate a real PDF containing the card
- Preserve card dimensions as closely as possible

Do not make buttons that only show a toast saying "coming soon."

---

Q. SHARE CARD
------------------------------------------------------------

Implement a useful share flow.

Use the browser's native share API where supported.

Fallback:

- Copy/share useful card data or generated image where browser support allows.

Handle unsupported browsers gracefully.

Do not require a backend unless already available.

---

R. SAVE DESIGN
------------------------------------------------------------

Save the complete editable design state:

- selected person
- template
- background
- card dimensions
- elements
- element positions
- sizes
- rotations
- text
- styling
- photo reference where locally supported

The design must be reloadable.

---

S. RESPONSIVE BEHAVIOR
------------------------------------------------------------

Desktop is the primary target because the mockup is desktop.

However:

- Do not break tablet layouts
- Do not create horizontal overflow unnecessarily
- Panels should collapse/reflow sensibly
- Editor should remain usable

Do not sacrifice the desktop mockup fidelity.

============================================================
PART 2 — BIRTH YEAR SNAPSHOT VISUAL QA
============================================================

The Birth Year Snapshot page already exists.

I am providing the Birth Year Snapshot mockup in DARK MODE.

Use the uploaded mockup as the PRIMARY visual reference.

The existing implementation already contains dynamic data.

Do NOT replace the data architecture unnecessarily.

Now perform a visual comparison against the mockup.

Fix:

- Overall page composition
- Sidebar width
- Header height
- Hero section dimensions
- Hero image placement
- Typography
- Font sizes
- Font weights
- Card dimensions
- Card spacing
- Grid proportions
- Padding
- Margins
- Border radius
- Borders
- Shadows
- Glow effects
- Purple/pink gradients
- Icon sizing
- Image sizing
- Section spacing
- Timeline appearance
- India section
- Fun Fact section
- Economy section
- Bottom timeline
- Empty/loading/error states

The final Dark Mode should closely resemble the uploaded mockup.

IMPORTANT:
The uploaded Birth Year Snapshot is a DARK MODE reference.

The page MUST also have a properly designed LIGHT MODE.

Do NOT simply invert the dark page.

---

BIRTH YEAR SNAPSHOT LIGHT MODE
------------------------------------------------------------

When global DOBverse theme is Light:

Use the same overall composition and information architecture, but adapt it to the existing DOBverse Light Mode design language.

Use:

- Light/white/lavender page background
- Light sidebar
- Light header
- White/light cards
- Dark navy/purple typography
- Soft lavender borders
- Light shadows
- Purple/pink accents
- Light card surfaces
- Proper contrast
- Light version of the hero
- Cosmic imagery adapted so it integrates naturally with Light Mode

The Light Mode must look intentionally designed.

Do NOT mechanically invert colors.

Global theme switching must work immediately:

Light → Dark
Dark → Light

The Birth Year Snapshot must follow the existing global theme state.

Do not create another theme system.

============================================================
PART 3 — BIRTH YEAR SNAPSHOT DATA QUALITY
============================================================

Preserve the current reliable data architecture.

Rules:

- Never invent historical facts.
- Never display fake historical information as real.
- If reliable data is unavailable, show:
  "Data unavailable for this year"
- Preserve loading states.
- Preserve error states.
- Preserve retry behavior.

Improve coverage where reliable sources/data already available in the existing project.

Pay particular attention to:

- Best Selling Car
- Top TV Show
- Internet Users
- Popular Phone
- Popular Technology
- Movie
- Song
- Sports
- World Leaders
- India in [YEAR]
- Timeline

Do NOT sacrifice reliability merely to fill a card.

If no trustworthy data exists:
show the proper unavailable state.

============================================================
PART 4 — BIRTH YEAR SNAPSHOT IMAGERY
============================================================

Preserve the existing image logic that was already added.

Ensure images correspond to the actual item.

For example:

- Movie image must correspond to the actual movie
- Phone image must correspond to the actual phone
- Technology image must correspond to the actual technology
- India image must correspond to India content
- Sports image must correspond to the sports item

Do not use random decorative images as if they represent the item.

If an appropriate image cannot be verified:
use the existing fallback icon/state.

Do not break the existing historical data functionality.

============================================================
PART 5 — LIFE TIMELINE FINAL VISUAL QA
============================================================

Life Timeline has already been fixed to support Light/Dark mode.

Do NOT rewrite its calculations.

Perform visual QA using the uploaded Life Timeline mockups.

There must be two intentional versions:

DARK MODE:

- Dark cosmic background
- Dark sidebar
- Dark cards
- Purple/pink cosmic accents
- White/light typography
- Purple borders
- Green completed indicators
- Cosmic hero
- Dark timeline panels
- Correct contrast

LIGHT MODE:

- Light/white/lavender background
- Light sidebar
- Light header
- White/light cards
- Navy/purple typography
- Soft lavender borders
- Light shadows
- Purple/pink accents
- Light timeline panels
- Light version of hero
- Cosmic imagery integrated into light theme

The page must respond to the EXISTING global DOBverse theme.

Do NOT create a Life Timeline-specific theme toggle.

Do not alter:

- DOB calculations
- Past milestones
- Upcoming milestones
- Days lived
- Birthday milestones
- Day milestones
- Seconds milestones
- Timeline summary
- Future journey

Only fix/polish the visual implementation if necessary.

============================================================
PART 6 — CALENDAR REGRESSION TEST
============================================================

Do not redesign Calendar unless an actual issue is found.

Test:

- Open Calendar
- Current date
- Date selection
- Birthday display
- Add birthday
- Edit birthday
- Delete birthday
- Empty state
- Upcoming birthdays
- "Today!" behavior
- February 29 behavior
- Theme switching
- Refresh persistence

If an actual bug is found:
fix it.

Do not introduce unrelated changes.

============================================================
PART 7 — COMPARE BIRTHDAYS REGRESSION TEST
============================================================

Test:

- Person A selection
- Person B selection
- Self selection
- Add person
- Edit person
- Delete person
- Comparison recalculation
- Age comparison
- Birthday comparison
- Countdown values
- Dynamic data updates
- Empty states
- Refresh persistence
- Light Mode
- Dark Mode

There must be NO fake/demo people.

If an actual bug is found:
fix it.

============================================================
PART 8 — BIRTHDAY REMINDERS REGRESSION TEST
============================================================

Test:

- Reminder switch
- Per-person reminder settings
- Timing options
- Birthday date calculation
- 1 day before
- 3 days before
- 7 days before
- On birthday
- Set Reminder flow
- Preview
- Browser notification behavior
- Persistence after refresh
- Editing/removing people
- February 29 handling
- Empty state
- Light/Dark theme

Do not reintroduce demo/example data.

If an actual bug is found:
fix it.

============================================================
PART 9 — GLOBAL DATA / PRIVACY RULES
============================================================

DOBverse is privacy-focused.

Prefer the project's existing local/browser storage architecture.

Do not introduce:

- unnecessary authentication
- unnecessary backend
- unnecessary external database
- unnecessary tracking
- analytics
- ads

User birthday/person information should remain local wherever the existing architecture supports it.

Do not send personal DOB information to external services unless technically necessary and already part of the intended architecture.

For historical public information, use external public sources only where needed.

============================================================
PART 10 — THEME CONSISTENCY
============================================================

Use the EXISTING DOBverse global theme/state system.

Do not create page-specific theme toggles.

Check all newly touched pages for hardcoded:

- background colors
- text colors
- borders
- shadows
- gradients
- icon colors

Use the project's existing theme-aware classes/tokens where appropriate.

Changing:

LIGHT → DARK

must immediately update all relevant pages.

Changing:

DARK → LIGHT

must immediately update all relevant pages.

Theme preference must persist according to the existing DOBverse implementation.

============================================================
PART 11 — IMPORTANT VISUAL RULE
============================================================

The uploaded mockups are NOT suggestions.

They are the visual source of truth.

For Birthday Card Generator:
use the uploaded Birthday Card Generator mockup.

For Birth Year Snapshot:
use the uploaded Birth Year Snapshot mockup as the DARK MODE reference.

For Life Timeline:
use the uploaded Life Timeline mockup(s) as the reference for both the dark composition and the intended light-mode adaptation.

Match:

- Layout
- Sidebar
- Header
- Section hierarchy
- Card grid
- Spacing
- Typography
- Icon placement
- Image placement
- Button sizing
- Border radius
- Borders
- Shadows
- Gradients
- Visual density
- Cosmic styling

Do not replace the visual system with generic dashboard components.

============================================================
PART 12 — FINAL QA
============================================================

After implementation:

1. Run the application.
2. Confirm there are no build errors.
3. Confirm there are no console errors caused by your changes.
4. Test Birthday Card Generator.
5. Test Birth Year Snapshot.
6. Test Life Timeline.
7. Test Calendar.
8. Test Compare Birthdays.
9. Test Birthday Reminders.
10. Test Light Mode.
11. Test Dark Mode.
12. Refresh the application and verify local data persists.
13. Verify routing works.
14. Verify sidebar navigation works.
15. Verify there is no accidental static/demo data.
16. Verify there are no broken buttons that claim functionality exists.
17. Verify there is no horizontal overflow on the main desktop layouts.
18. Verify responsive behavior at reasonable smaller widths.

============================================================
IMPORTANT FINAL INSTRUCTION
============================================================

Do NOT stop after creating the UI.

The Birthday Card Generator must be fully functional.

The existing dynamic Calendar, Compare Birthdays, Birthday Reminders, Life Timeline and Birth Year Snapshot functionality must remain intact.

Do not replace working functionality with placeholders.

Do not use fake data just to make the UI look complete.

Do not hardcode the example values from the mockups.

Use the actual DOBverse saved user/person data.

Use the existing architecture wherever possible.

After implementation, perform a final visual and functional pass and fix actual issues you find.

The goal is a polished, production-quality DOBverse implementation that closely matches the uploaded mockups while remaining genuinely dynamic and functional.
============================================================

END OF TASK

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3d7bcc6d-1414-4624-977a-5d97fbb0c6c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
