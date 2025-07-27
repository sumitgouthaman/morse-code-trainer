# Statistics Feature Specification

## Overview
Add comprehensive statistics tracking to the Morse Code Trainer to help users monitor their learning progress and identify areas for improvement.

## v0 Implementation
A foundational statistics system has been implemented. It tracks session-level accuracy for each practice mode and stores the data in `localStorage`. 

**Completed Features:**
- **Session Tracking**: A `SessionTracker` class monitors correct/incorrect answers for a configurable number of questions.
- **Data Storage**: A `StatisticsManager` saves session data (mode, timestamp, accuracy, counts) to a single `localStorage` key (`morse_trainer_stats`).
- **Basic UI**:
    - The main menu displays the user's overall accuracy.
    - A "Clear All Statistics" button in the settings modal allows data reset.
    - A toast notification appears after each session showing the accuracy for that session.
- **Settings**: The session length is configurable in the settings modal.

**Deviations from Spec:**
- The data structure is simpler than specified, lacking per-character stats, session duration, and aggregate data stores.
- No dedicated statistics dashboard or graphing has been implemented.
- The proposed file structure (`js/statistics/`, `js/storage/`) was not used; new files were added directly to `js/`.

---

## Core Requirements

### 1. Accuracy Tracking Over Time
- Track accuracy percentage for each practice session
- Store timestamps for temporal analysis
- Separate tracking for each practice mode:
  - Character to Morse
  - Morse to Character
  - Sound to Character
- Display accuracy trends in a visual graph `(not yet implemented)`

### 2. Per-Character Performance Analysis `(not yet implemented)`
- Track individual character accuracy
- Identify problematic characters
- Visual representation of character-specific performance
- Optional display (not shown by default)

### 3. Data Management
- Local storage persistence
- One-click stats clearing functionality
- Export/import capabilities `(not yet implemented)`

## Data Structure

### Session Statistics `(partially implemented)`
The current implementation uses a simplified version of this structure. It does not include `sessionId`, `duration`, or `characterStats`.

```javascript
{
  sessionId: "uuid-v4", // (not yet implemented)
  mode: "char-to-morse" | "morse-to-char" | "sound-to-char",
  timestamp: 1642694400000, // Unix timestamp
  totalQuestions: 25,
  correctAnswers: 22,
  accuracy: 88.0, // percentage
  duration: 120000, // milliseconds (not yet implemented)
  characterStats: { // (not yet implemented)
    'A': { correct: 3, total: 4, accuracy: 75.0 },
    'B': { correct: 2, total: 2, accuracy: 100.0 },
    // ... more characters
  }
}
```

### Aggregate Statistics `(not yet implemented)`
Aggregate stats are currently calculated on the fly, not stored.

```javascript
{
  lastUpdated: 1642694400000,
  modes: {
    "char-to-morse": {
      totalSessions: 15,
      totalQuestions: 375,
      totalCorrect: 320,
      overallAccuracy: 85.3,
      bestAccuracy: 96.0,
      recentSessions: [...], // Last 10 sessions for trending
      characterAggregate: {
        'A': { correct: 45, total: 52, accuracy: 86.5 },
        // ... all characters
      }
    },
    // ... other modes
  }
}
```

## User Interface Design

### 1. Statistics Dashboard `(not yet implemented)`
**Location**: New "Stats" button in main menu, or dedicated stats page

**Components**:
- **Mode Selector**: Tabs or dropdown to switch between practice modes
- **Accuracy Graph**: Line chart showing accuracy over last 20-50 sessions
- **Summary Cards**: 
  - Overall accuracy
  - Total sessions
  - Best session
  - Recent trend (improving/declining)
- **Clear Stats Button**: Prominent but protected (confirmation dialog) `(This is implemented in the settings modal)`

### 2. Character Performance View `(not yet implemented)`
**Location**: Expandable section or separate tab within stats

**Components**:
- **Character Grid**: Visual grid showing all Morse characters
- **Color Coding**: 
  - Green: >90% accuracy
  - Yellow: 70-90% accuracy  
  - Red: <70% accuracy
  - Gray: Not practiced yet
- **Detailed View**: Click character for specific stats
- **Sorting Options**: By accuracy (worst first), by frequency practiced

### 3. In-Game Statistics Integration `(partially implemented)`
A toast notification shows session accuracy. It does not yet show characters practiced, improvement, or encouraging messages.

**Session Summary**: After each practice session
- Session accuracy
- Characters practiced `(not yet implemented)`
- Improvement from last session `(not yet implemented)`
- Encouraging messages based on performance `(not yet implemented)`

## Technical Implementation

### 1. Data Storage `(partially implemented)`
A single `localStorage` key is used instead of the structured keys below. The `StatisticsManager` class exists but with a simpler set of methods.

```javascript
// LocalStorage keys (not yet implemented)
const STORAGE_KEYS = {
  SESSIONS: 'morse_trainer_sessions',
  AGGREGATES: 'morse_trainer_aggregates',
  SETTINGS: 'morse_trainer_settings'
};

// Storage manager
class StatisticsManager {
  saveSession(sessionData) { /* Implemented as recordSession */ }
  getSessionHistory(mode, limit = 50) { /* Implemented as getRecentSessions with different signature */ }
  getCharacterStats(mode) { /* (not yet implemented) */ }
  clearAllStats() { /* Implemented */ }
  exportStats() { /* (not yet implemented) */ }
}
```

### 2. Chart Library Integration `(not yet implemented)`
**Recommendation**: Chart.js (lightweight, good mobile support)
```javascript
// Example accuracy trend chart
const chartConfig = {
  type: 'line',
  data: { /* ... */ }
};
```

### 3. Character Performance Visualization `(not yet implemented)`
```javascript
// Character grid component
class CharacterGrid {
  // ...
}
```

## User Experience Flow

### 1. First-Time User
1. No stats available message
2. Encouragement to complete practice sessions
3. "Your first stats will appear after completing a practice session"

### 2. Regular User
1. Quick stats summary on main menu
2. "View detailed stats" link `(not yet implemented)`
3. Stats dashboard with trends and insights `(not yet implemented)`

### 3. Advanced User `(not yet implemented)`
1. Detailed character analysis
2. Performance trends over time
3. Goal setting and progress tracking

## Privacy & Data Considerations

### 1. Local Storage Only
- All data stored locally in browser
- No server transmission
- User maintains full control

### 2. Data Size Management `(not yet implemented)`
- Limit session history (e.g., last 100 sessions)
- Aggregate older data to save space
- Provide storage usage indicator

### 3. Data Export/Import `(not yet implemented)`
- JSON export for backup
- Import functionality for device migration
- Clear data format documentation

## Future Enhancements `(not yet implemented)`
- Advanced Analytics
- Goal Setting
- Comparative Analysis

## Implementation Priority

### Phase 1 (MVP)
1. Basic session tracking
2. Simple accuracy graph `(not yet implemented)`
3. Clear stats functionality

### Phase 2 (Enhanced) `(not yet implemented)`
1. Character-specific tracking
2. Visual character grid
3. Session summaries

### Phase 3 (Advanced) `(not yet implemented)`
1. Advanced analytics
2. Export/import
3. Goal setting features

## Technical Dependencies

### New Dependencies `(not yet implemented)`
- Chart.js: `~4.4.0` (for graphs)
- UUID library: `~9.0.0` (for session IDs)

### File Structure `(partially implemented)`
The specified file structure was not used. `session-tracker.js` and `statistics.js` were created in the root `js/` directory.
```
js/
├── statistics/
│   ├── StatisticsManager.js
│   ├── CharacterGrid.js
│   ├── AccuracyChart.js
│   └── StatsUI.js
├── storage/
│   └── LocalStorageManager.js
└── utils/
    └── dateUtils.js
```

## Testing Considerations `(not yet implemented)`
- Data Integrity
- Performance
- User Experience
- Accessibility