# Challenge Index

## Quick Links
| # | Title | Status | Apps Script | Last Deploy |
|---|-------|--------|-------------|-------------|
| 1 | [Title] | ⏳ Not Started | [Edit](link) | - |
| 2 | [Title] | ⏳ Not Started | [Edit](link) | - |
| 3 | [Title] | ⏳ Not Started | [Edit](link) | - |
| 4 | [Title] | ⏳ Not Started | [Edit](link) | - |
| 5 | [Title] | ⏳ Not Started | [Edit](link) | - |

## Status Legend
- ⏳ Not Started
- 🚧 In Progress
- ✅ Complete
- 🐛 Has Issues

## Challenge 1: [Title]
**Description**: Brief description of what this challenge does

**Key Requirements**:
- Requirement 1
- Requirement 2

**Implementation Notes**:
- Note 1
- Note 2

**Shared Code Used**:
- `shared/utils/common.js`

---

## Challenge 2: [Title]
[Repeat structure]

---

[Continue for all 5 challenges]

## Shared Components

### `shared/utils/common.js`
Common utilities used across multiple challenges:
- `formatDate()` - Date formatting
- `validateEmail()` - Email validation
- Used by: C1, C3, C5

### `shared/utils/logger.js`
Centralized logging:
- `logInfo()`, `logError()`, `logWarning()`
- Used by: All challenges

### Challenge 4: Compound Interest Calculator
**Description**: Web-based calculator for compound interest with visual growth graphs

**Key Features**:
- Flexible input parameters (principal, deposits, duration, rate, frequency)
- Three compounding frequencies (daily, monthly, annually)
- Real-time calculations with detailed breakdown
- Interactive Chart.js graph showing growth over time
- Modern, responsive UI with smooth animations

**Requirements Met**:
- ✅ Principal amount input
- ✅ Monthly deposit input
- ✅ Investment duration input (years)
- ✅ Annual interest rate input (%)
- ✅ Compounding frequency selector (Daily/Monthly/Annually)
- ✅ Total principal output
- ✅ Interest amount output
- ✅ Maturity value output
- ✅ Simple web form with all inputs
- ✅ "Calculate" button
- ✅ Result display section
- ✅ **BONUS:** Interactive graph comparing maturity value vs total principal

**Implementation Notes**:
- Uses accurate compound interest formula with regular deposits
- Year-by-year breakdown calculation for smooth graph visualization
- Chart.js for interactive data visualization
- Gradient design matching overall project aesthetic
- Client-side validation with server-side calculation

**Shared Code Used**:
- None (standalone implementation)

**Technical Stack**:
- Google Apps Script (server-side calculations)
- HTML5/CSS3/JavaScript (client-side UI)
- Chart.js 4.4.0 (data visualization)
- Google Fonts (Inter)

**Calculation Formulas**:
- Principal FV: `P × (1 + r/n)^(nt)`
- Deposits FV: Sum of each deposit's future value
- Total compounding periods vary by frequency (365, 12, or 1)

**Status**: ✅ Complete

**Last Updated**: 2025-01-XX