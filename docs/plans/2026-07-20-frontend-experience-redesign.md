# Frontend Experience Redesign

## Goal

Turn the current Travel Planner frontend into a production-quality, map-first trip planning workspace. The redesign must fix corrupted Chinese copy, improve information hierarchy and interaction flow, and remain compatible with the existing backend API and map integration.

## Product Direction

The visual direction is a "city itinerary console": a quiet operational workspace inspired by transit maps and street navigation systems. It is intended for domestic independent travelers who repeatedly search, compare, select, and arrange places while keeping geographic context visible.

The page's primary job is to help a traveler turn scattered destination ideas into an ordered route without losing sight of the map.

## Visual System

### Color Tokens

- Road Ink `#17211B`: primary text and high-contrast controls
- Station Green `#167A5A`: selected state and primary actions
- Signal Orange `#E46F2E`: warnings and must-visit emphasis
- Map Mist `#E9EFEC`: map-adjacent surfaces and subdued regions
- Paper White `#F8FAF8`: workspace background
- Rail Gray `#69766F`: secondary copy, metadata, and inactive states

Colors must have semantic roles and must not collapse into a single-hue palette. The interface must avoid purple-blue gradients, decorative blobs, and excessive shadows.

### Typography

Use a characterful condensed display face for trip identity and major headings, a highly legible Chinese sans serif for controls and body copy, and a monospace face for time, distance, and status data. Fonts must retain suitable local fallbacks and must not use viewport-scaled font sizes.

### Signature Element

The memorable element is an editable route spine. The itinerary panel is a vertical transit-like line whose nodes represent ordered places. Each node encodes sequence, expected time, place type, priority, and selection state. It must stay synchronized with map markers and place results.

## Desktop Layout

The desktop workspace retains three functional regions while making the map dominant:

```text
+ Trip context / dates / save status / global commands --------+
| Place library | Search and map canvas          | Daily route  |
| Filters       |                                | Route spine  |
| Results       |                                | Place order  |
+---------------------------------------------------------------+
| Scoped background or error status                             |
+---------------------------------------------------------------+
```

The map should occupy roughly half of the usable width and most of the viewport height. Page sections are unframed layout regions; cards are reserved for repeated search results, route items where framing is necessary, and overlays.

## Mobile Layout

Mobile uses three stable views: Map, Places, and Itinerary. Search results appear in a collapsible surface above the map, while trip settings use a full-screen drawer. The desktop columns must not simply stack into one long page.

Fixed controls, tabs, map regions, and route nodes need stable dimensions so loading, hover, and selection states do not shift the layout.

## Components

- `TripHeader`: current trip identity, destination, date range, traveler count, save state, and global commands
- `PlaceSearchPanel`: city scope, keyword search, tag filter, async result states, and selected-result action area
- `MapWorkspace`: existing map canvas plus map-scoped loading, error, empty, and selection states
- `RoutePanel`: route summary and ordered route-spine nodes
- `RouteNode`: drag handle, sequence, time metadata, priority, category, note affordance, and overflow actions
- `TripSettingsDrawer`: low-frequency trip metadata fields
- `MobileWorkspaceNav`: stable Map, Places, and Itinerary tabs
- Shared status, empty-state, icon-button, and form-control primitives where duplication justifies them

The current page owns too many concerns. State and API behavior can remain at the route level initially, but rendering and local interaction should move into focused components without inventing a new application framework.

## Interaction Flow

Place search follows the user's actual sequence: choose or infer city, enter a keyword, review results, select a result, choose tag and priority, then add it. The add action stays adjacent to the selected result instead of being detached in a distant toolbar.

Map markers, search results, and route nodes share one selection state. Selecting any representation updates the other two. Destructive actions use explicit confirmation containing the affected trip or place name.

Motion is reserved for panel transitions, route reordering, and synchronized selection. All motion must respect `prefers-reduced-motion`.

## Copy And Encoding

All corrupted Chinese strings must be replaced with clear UTF-8 copy. UI wording uses active voice, sentence case, and stable action names. Empty and failure states explain the next useful action rather than adding mood or promotional text.

## Error And Loading States

- Search errors remain inside the search panel.
- Save failures remain visible in the trip header until resolved.
- Map initialization errors preserve the surrounding workspace and identify the configuration or retry action.
- Loading placeholders reserve their final dimensions to avoid layout shifts.
- An empty itinerary directs the user to search for the first place.

## Accessibility

- Every interactive control has a visible keyboard focus state.
- Icon-only buttons use familiar icons and accessible labels or tooltips.
- Status and priority are not communicated by color alone.
- Mobile and desktop layouts prevent text and control overlap.
- Reduced motion is supported.

## Scope

This redesign covers the existing primary workspace and its redirecting entry routes. It does not add authentication, export, route calculation, or other unfinished product capabilities. Existing backend contracts and map-provider behavior remain compatible.

## Verification

Verify these scenarios in a real browser:

- Initial loading and an empty itinerary
- Existing trips and existing places
- Search loading, results, no results, and API failure
- Map configuration failure
- Save failure feedback
- Desktop, tablet, and mobile layouts
- Mobile workspace tabs and drawers
- Keyboard focus visibility
- Reduced-motion behavior

Run the frontend linter and production build. Inspect desktop and mobile screenshots after implementation, then perform a final visual critique against the token system, route-spine signature, anti-pattern list, and responsive requirements.
