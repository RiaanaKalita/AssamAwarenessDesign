# Tide Turn — Flood Safety Website

## Files
- `index.html` — page structure and content
- `style.css` — responsive ocean-inspired layout
- `script.js` — navigation, safety tabs, kit checklist, charts, maps and quiz
- `assets/hero-flood.jpg` — cropped hero image from the user's B4 planning design

## Run it
1. Keep the files in this same folder.
2. Open `index.html` in a browser for a basic preview. Some map/data features may be blocked by local-file browser restrictions.
3. For the full experience, publish the folder to GitHub Pages or use a local static server.
4. In GitHub, upload all files and the `assets` folder to the repository root. Enable Pages in repository Settings → Pages.

## Data accuracy and limitations
- The chart shows historical annual population-affected figures for Assam, in lakh, from ASDMA annual activity report and official flood memoranda. The chart is historical, not a live reading.
- Sources are linked within the Information page:
  - ASDMA Annual Activity Report 2020–21 to 2023–24
  - Assam Flood Memorandum 2023
  - Assam Flood Memorandum 2024
- The interactive street maps use OpenStreetMap. The optional NASA GIBS layer is satellite imagery for context; it does **not** detect or forecast floods automatically.
- The clinic locator queries Nominatim and Overpass/OpenStreetMap data. Coverage may be incomplete and these services can throttle requests. It is not an emergency dispatch system.
- Emergency numbers are provided for learning and quick reference. Some state/district contacts and service availability can change; verify locally. In an immediate emergency, use the official number available in your location and follow local authorities.
- The website does not upload or store medical files. It only provides a checklist reminding users to keep copies securely.

## Third-party services
Google Fonts, Leaflet, Chart.js, OpenStreetMap, NASA GIBS, Nominatim and Overpass require an internet connection. If a third-party service is down, other parts of the site should remain usable.
