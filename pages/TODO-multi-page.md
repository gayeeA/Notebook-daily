# TODO - Multi-page navigation (Calendar/Favorites/Trash/Settings + Journals)

- [ ] Create `/pages` folder (if not existing) and add new HTML pages:
  - [ ] `calendar.html`
  - [ ] `favorites.html`
  - [ ] `trash.html`
  - [ ] `settings.html`
  - [ ] `work.html`
  - [ ] `travel.html`
  - [ ] `study.html`
  - [ ] `dream.html`

- [ ] Update `index.html` sidebar navigation buttons to normal links:
  - Diary -> `../index.html`
  - Calendar -> `pages/calendar.html`
  - Favorites -> `pages/favorites.html`
  - Trash -> `pages/trash.html`
  - Settings -> `pages/settings.html`

- [ ] Update journal pills to navigate to:
  - Personal -> `../index.html` (already exists)
  - Work -> `pages/work.html`
  - Travel -> `pages/travel.html`
  - Study -> `pages/study.html`
  - Dream -> `pages/dream.html`

- [ ] Refactor `script.js` to support page-based init:
  - Ensure `renderFavoritesPage()` is called on `favorites.html`
  - Ensure `renderTrashPage()` is called on `trash.html`
  - Ensure calendar renders (call `MyDiaryCalendar.refreshCalendar()` if needed)

- [ ] Ensure auth + session + theme + modals work on all new pages.

- [ ] Quick manual test matrix:
  - [ ] Login -> open each page from sidebar
  - [ ] Add an entry on Diary -> verify Calendar counts
  - [ ] Favorite entry -> verify Favorites page filter
  - [ ] Trash entry -> verify Trash page filter
  - [ ] Switch journal pills -> verify entries shown for that journal

