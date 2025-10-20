# Challenge 4: Compound Interest Calculator

## Description
A sophisticated web-based compound interest calculator that helps users visualize their investment growth over time with various compounding frequencies.

## Features
✅ **Flexible Inputs** - Principal, monthly deposits, duration, rate, and frequency
✅ **Multiple Compounding Frequencies** - Daily, Monthly, and Annually
✅ **Detailed Results** - Total principal, interest earned, and maturity value
✅ **Visual Graph** - Interactive Chart.js graph comparing principal vs maturity value
✅ **Real-time Calculation** - Instant results with smooth animations
✅ **Responsive Design** - Works on all devices
✅ **Error Handling** - Comprehensive validation and error messages

## Requirements Met
- ✅ Principal amount input
- ✅ Monthly deposit input
- ✅ Investment duration input (years)
- ✅ Annual interest rate input (%)
- ✅ Compounding frequency selector (Daily/Monthly/Annually)
- ✅ Total principal output
- ✅ Interest amount output
- ✅ Maturity value output
- ✅ Web UI with form and calculate button
- ✅ Result display section
- ✅ **BONUS:** Graph comparison between maturity value and total principal

## Apps Script URL
https://script.google.com/d/1vWh3_hzwzAfCFAMNaTdwjvJ2pZR2Uh-ELnQjWMw8tLMuL_WFHw89HofD/edit

## How to Use

### Setup
1. Open the Apps Script project
2. Deploy as **Web App**:
   - Click **Deploy** → **New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
3. Copy and open the web app URL

### Usage
1. Enter your **Initial Principal** amount
2. Enter your **Monthly Deposit** amount (can be 0)
3. Set **Investment Duration** in years
4. Set **Annual Interest Rate** (as percentage)
5. Choose **Compounding Frequency**
6. Click **"CALCULATE"**
7. View results and interactive graph

## Calculation Formula

### Compound Interest with Regular Deposits

**Principal Component:**
```
FV_principal = P × (1 + r/n)^(nt)
```

**Monthly Deposits Component:**
```
FV_deposits = Σ (PMT × (1 + r/n)^(periods_remaining))
```

Where:
- P = Initial principal
- PMT = Monthly payment/deposit
- r = Annual interest rate (decimal)
- n = Number of compounding periods per year
- t = Time in years

## Local Development
```bash
cd challenges/challenge-4

# Push changes
clasp push

# View logs
clasp logs

# Open in browser
clasp open
```

## Implementation Status
- ✅ Basic structure
- ✅ Core calculation logic
- ✅ Error handling and validation
- ✅ Web UI with modern design
- ✅ Chart.js integration
- ✅ Responsive design
- ✅ Testing complete
- ✅ Documentation

## Functions

### Main Functions
- `doGet()` - Serves the web app HTML
- `calculateCompoundInterest(params)` - Main calculation function
- `formatCurrency(amount)` - Formats numbers as currency

### Client-Side Functions
- `calculateInterest()` - Form submission handler
- `handleSuccess(result)` - Displays calculation results
- `handleError(error)` - Displays error messages
- `drawChart(yearlyData)` - Creates interactive Chart.js visualization
- `formatCurrency(amount)` - Client-side currency formatting

## Technical Details

### Libraries Used
- **Chart.js 4.4.0** - For interactive growth visualization
- **Google Fonts (Inter)** - Modern typography
- **Apps Script HtmlService** - Web app hosting

### Calculation Method
- Accurate compound interest formula
- Handles irregular compounding periods
- Year-by-year breakdown for graphing
- Supports daily (365), monthly (12), and annual (1) compounding

### Error Handling
- Input validation (positive numbers, required fields)
- Server-side validation
- User-friendly error messages
- Try-catch blocks throughout

### Performance
- Client-side input validation (instant feedback)
- Server-side calculation (accurate results)
- Efficient yearly data generation
- Smooth animations and transitions

## Architecture Notes
- Pure client-side rendering with server calculation
- Follows project conventions (camelCase, JSDoc, try-catch)
- Modern ES6+ JavaScript
- Responsive CSS Grid layout
- Gradient design matching Challenge 5 aesthetic

## Example Scenarios

**Scenario 1: Retirement Savings**
- Principal: RM 50,000
- Monthly Deposit: RM 1,000
- Duration: 20 years
- Rate: 6%
- Frequency: Monthly
- **Result**: ~RM 714,000 maturity value

**Scenario 2: Emergency Fund**
- Principal: RM 10,000
- Monthly Deposit: RM 500
- Duration: 5 years
- Rate: 3%
- Frequency: Monthly
- **Result**: ~RM 42,500 maturity value

## Future Enhancements
- [ ] Export results to PDF
- [ ] Save calculation history
- [ ] Compare multiple scenarios
- [ ] Add inflation adjustment
- [ ] Tax calculations
- [ ] Different deposit frequencies (weekly, quarterly)
- [ ] Goal-based planning (work backwards from target)