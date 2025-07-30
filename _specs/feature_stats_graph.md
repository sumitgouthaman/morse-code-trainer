# Statistics Graph Feature Implementation Plan

## Overview
Implement Phase 1 MVP of the statistics dashboard with visual accuracy graphs, building on the existing statistics foundation to provide users with trend visualization of their learning progress.

## Implementation Status
- [x] Planning and specification (COMPLETED)
- [x] Chart.js integration via CDN (COMPLETED)
- [x] Stats dashboard HTML structure (COMPLETED)
- [x] JavaScript module implementation (COMPLETED)
- [x] UI styling and responsiveness (COMPLETED)
- [ ] Testing and refinement (PENDING)

## Technical Approach

### 1. Library Integration
**Decision: Chart.js via CDN (Option 1)**
- Add Chart.js 4.4.0 via CDN link in `index.html`
- Ensures offline functionality for PWA users
- 43KB gzipped overhead acceptable for core feature
- Simpler implementation than dynamic loading

### 2. Architecture Design
**Follow existing patterns:**
- New HTML file: `html/stats.html` 
- New JS module: `js/stats.js`
- Navigation via main menu button
- Load on-demand like other practice modes
- Integrate with existing `StatisticsManager`

### 3. User Interface Design
**Stats Dashboard Components:**
- Mode selector tabs (char-to-morse, morse-to-char, sound-to-char)
- Accuracy trend line chart (last 20-50 sessions)
- Summary cards with key metrics
- Back to menu navigation

**Visual Design:**
- Match existing UI patterns and CSS variables
- Mobile-first responsive design
- Use established button and modal styling
- Color scheme consistent with app theme

## Data Integration

### Existing Infrastructure
**Leverage current StatisticsManager:**
- `getRecentSessions(limit)` - for chart data
- `getOverallAccuracy()` - for summary display
- Session data structure: `{mode, timestamp, accuracy, totalQuestions, correctAnswers}`

### Chart Data Processing
```javascript
// Transform session data for Chart.js
function prepareChartData(sessions) {
    return {
        labels: sessions.map(s => formatDate(s.timestamp)),
        datasets: [{
            label: 'Accuracy %',
            data: sessions.map(s => s.accuracy),
            borderColor: 'var(--primary)',
            backgroundColor: 'var(--primary-light)'
        }]
    };
}
```

## Implementation Steps

### Phase 1: Core Setup
1. **Add Chart.js CDN** to `index.html`
2. **Create `html/stats.html`** with basic structure
3. **Create `js/stats.js`** module skeleton
4. **Add Stats navigation** to main menu

### Phase 2: Chart Implementation
1. **Mode selector tabs** functionality
2. **Basic line chart** with dummy data
3. **Real data integration** with StatisticsManager
4. **Chart configuration** (colors, responsive, etc.)

### Phase 3: Polish & Testing
1. **Responsive design** across viewports
2. **Error handling** (no data states)
3. **Performance optimization**
4. **Cross-browser testing**

## File Structure

### New Files
```
html/stats.html           - Stats dashboard HTML
js/stats.js              - Chart logic and UI management
```

### Modified Files
```
index.html               - Add Chart.js CDN, Stats button
js/main.js              - Add stats route handling
styles/main.css         - Import stats-specific styles (if needed)
```

## Chart Configuration

### Chart.js Setup
```javascript
const chartConfig = {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    }
};
```

### Data Handling
- **Default view**: Last 20 sessions
- **Empty state**: "Complete practice sessions to see your progress"
- **Single session**: Show message encouraging more practice
- **Mode filtering**: Separate charts for each practice mode

## User Experience Flow

### Navigation
1. User clicks "Stats" button from main menu
2. Stats page loads with default mode selected
3. Chart displays recent session data
4. User can switch between modes via tabs
5. Back button returns to main menu

### Error States
- **No data**: Encouraging message with call-to-action
- **Chart load failure**: Graceful fallback message
- **Single session**: "Complete more sessions to see trends"

## Testing Plan

### Functional Testing
- [ ] Chart displays correctly with real data
- [ ] Mode switching works properly
- [ ] Responsive design on mobile/desktop
- [ ] Navigation to/from stats works
- [ ] Error states display appropriately

### Data Testing
- [ ] Chart updates when new sessions recorded
- [ ] Accuracy calculations match expectations
- [ ] Mode filtering works correctly
- [ ] Date formatting displays properly

### Performance Testing
- [ ] Chart renders smoothly on mobile
- [ ] Page loads quickly with Chart.js CDN
- [ ] Memory usage reasonable with large datasets

## Future Enhancements (Not in Scope)
- Character-specific performance tracking
- Export functionality
- Goal setting and progress indicators
- Advanced analytics and insights

## Notes & Decisions

### Why Chart.js?
- Lightweight (43KB gzipped)
- Excellent mobile support
- Clean API matching vanilla JS approach
- Good accessibility features
- No additional build requirements

### Why CDN over Dynamic Loading?
- PWA users expect core features to work offline
- Statistics likely to be frequently accessed
- Simpler implementation and debugging
- Avoids loading complexity and error handling

---

## Implementation Results

### Phase 1: Core Setup ✅
- **Chart.js CDN**: Added to `index.html` for offline PWA compatibility
- **Stats HTML**: Created `html/stats.html` with dashboard structure
- **Stats Module**: Implemented `js/stats.js` with chart functionality
- **Navigation**: Added Statistics button to main menu

### Phase 2: Chart Implementation ✅
- **Mode Selector**: Working tabs for char-to-morse, morse-to-char, sound-to-char
- **Line Chart**: Displays accuracy trends over sessions with Chart.js
- **Data Integration**: Transforms existing StatisticsManager data for visualization
- **Real-time Updates**: Chart updates when switching between modes

### Phase 3: Polish & Styling ✅
- **Responsive Design**: Mobile-first approach with CSS Grid layout
- **UI Consistency**: Matches existing app theme with CSS variables
- **Error Handling**: Shows "no data" message for insufficient sessions
- **Visual Polish**: Hover effects, smooth transitions, proper spacing

### Key Features Implemented
1. **Session-based Charts**: Groups attempts into 20-question sessions
2. **Mode Filtering**: Separate charts for each practice mode
3. **Summary Cards**: Overall accuracy, total sessions, best session
4. **Empty States**: Encouraging messages for new users
5. **Navigation**: Browser back button support with history API

### Technical Decisions Made
- Used existing `statistics.data.recentAttempts` for chart data source
- Sessions defined as 20 attempts (configurable in code)
- Minimum 5 attempts required to count as valid session
- Shows last 20 sessions maximum for performance
- Chart.js loaded via CDN for offline PWA functionality

---

**Last Updated**: Implementation complete - Phase 1 MVP delivered
**Status**: Ready for testing and user feedback