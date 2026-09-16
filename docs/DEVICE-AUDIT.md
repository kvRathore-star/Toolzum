# Device Audit (#10 / #45 lab block)

Owner-executed on real hardware — emulators miss touch, install, and
radio behavior. One pass covers #10 (install + offline), #45 (degraded
networks), and #47 (energy observations); #31 needs the same devices
plus desktop Safari/Firefox.

## Devices (minimum matrix)

- Android mid-range (e.g. Pixel 6a or Samsung A-series) — install,
  offline, degraded.
- iPhone (iOS 17+) — Add-to-Home-Screen, standalone display, safe-area.
- One low-end Android (the energy + degraded-network reference).

## A. Installability (per device)

- [ ] `…` menu / share sheet offers Install (Android) or Add to Home
      Screen (iOS). Splash shows, icon is correct (maskable crop sane).
- [ ] Standalone launch: no browser chrome, theme-color matches,
      navigation stays in-app (external links still open the browser).
- [ ] Shortcuts (long-press icon): PDF / Image / Text open the right tool.

## B. Offline matrix (airplane mode after a fresh install)

- [ ] Visited tool page works fully (WASM executes, download works).
- [ ] Unvisited tool URL shows `/offline.html` (title "You're offline",
      working Back/Browse links) — never the browser error screen.
- [ ] `⌘K` search opens; zero-result state renders.
- [ ] Reconnect: stale pages refresh without a stuck SW (Virtual:
      DevTools → Application → Update on reload once).

## C. Degraded networks (#45 — DevTools throttling + a real slow network)

- [ ] Slow 3G first paint: shell + skeletons, no blank white > 3s.
- [ ] Mid-task disconnect (airplane during AI generate): error toast
      states offline explicitly (not "Request failed"), retry works.
- [ ] Quota-wall modal and limit copy render before JS chunks finish.

## D. Display + touch

- [ ] Notch/cutout: no clipped header or buttons (safe-area insets).
- [ ] 100dvh pages: no jump on scroll (URL bar show/hide).
- [ ] Touch targets ≥ 44px on primary actions; no hover-only controls.

## E. Energy observations (#47)

- [ ] Note device + battery drop for 10 min of video conversion vs 10 min
      of text tools. If video exceeds ~2× text drain, file it here:
      ___________________________________________.

## Sign-off

Date: __________ Devices: __________________________
Result: ship / fix-first (issues → file with device + repro steps)
