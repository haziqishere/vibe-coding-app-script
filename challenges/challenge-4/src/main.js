/**
 * Challenge 4 - Compound Interest Calculator
 * Calculates compound interest with various compounding frequencies
 */

/**
 * Serves the web app HTML
 * @returns {HtmlOutput} The HTML page
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Compound Interest Calculator')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Calculates compound interest based on user inputs
 * @param {Object} params - Calculation parameters
 * @param {number} params.principal - Initial principal amount
 * @param {number} params.monthlyDeposit - Monthly deposit amount
 * @param {number} params.years - Investment duration in years
 * @param {number} params.rate - Annual interest rate (as percentage)
 * @param {string} params.frequency - Compounding frequency ('daily', 'monthly', 'annually')
 * @returns {Object} Calculation results
 */
function calculateCompoundInterest(params) {
  try {
    Logger.log('Calculating compound interest with params: ' + JSON.stringify(params));
    
    // Validate inputs
    if (params.principal < 0 || params.monthlyDeposit < 0 || params.years <= 0 || params.rate < 0) {
      throw new Error('All values must be positive numbers');
    }
    
    const principal = parseFloat(params.principal);
    const monthlyDeposit = parseFloat(params.monthlyDeposit);
    const years = parseFloat(params.years);
    const annualRate = parseFloat(params.rate) / 100; // Convert percentage to decimal
    const frequency = params.frequency;
    
    // Determine compounding periods per year
    let n; // number of times interest is compounded per year
    switch (frequency) {
      case 'daily':
        n = 365;
        break;
      case 'monthly':
        n = 12;
        break;
      case 'annually':
        n = 1;
        break;
      default:
        throw new Error('Invalid compounding frequency');
    }
    
    const totalMonths = years * 12;
    const ratePerPeriod = annualRate / n;
    const totalPeriods = n * years;
    
    // Calculate future value of initial principal
    // FV = P * (1 + r/n)^(nt)
    const principalFV = principal * Math.pow(1 + ratePerPeriod, totalPeriods);
    
    // Calculate future value of monthly deposits
    let depositsFV = 0;
    
    if (monthlyDeposit > 0) {
      // Calculate FV for each monthly deposit
      for (let month = 1; month <= totalMonths; month++) {
        const periodsRemaining = (totalMonths - month) / 12 * n;
        const depositValue = monthlyDeposit * Math.pow(1 + ratePerPeriod, periodsRemaining);
        depositsFV += depositValue;
      }
    }
    
    const maturityValue = principalFV + depositsFV;
    const totalPrincipal = principal + (monthlyDeposit * totalMonths);
    const interestEarned = maturityValue - totalPrincipal;
    
    // Generate year-by-year breakdown for graphing
    const yearlyData = [];
    for (let year = 0; year <= years; year++) {
      const periodsElapsed = n * year;
      const monthsElapsed = year * 12;
      
      // Calculate principal value at this year
      const yearPrincipalValue = principal * Math.pow(1 + ratePerPeriod, periodsElapsed);
      
      // Calculate deposits value at this year
      let yearDepositsValue = 0;
      if (monthlyDeposit > 0 && year > 0) {
        for (let month = 1; month <= monthsElapsed; month++) {
          const periodsRemainingFromYear = (monthsElapsed - month) / 12 * n;
          yearDepositsValue += monthlyDeposit * Math.pow(1 + ratePerPeriod, periodsRemainingFromYear);
        }
      }
      
      const yearTotalValue = yearPrincipalValue + yearDepositsValue;
      const yearTotalInvested = principal + (monthlyDeposit * monthsElapsed);
      
      yearlyData.push({
        year: year,
        totalPrincipal: yearTotalInvested,
        maturityValue: yearTotalValue,
        interestEarned: yearTotalValue - yearTotalInvested
      });
    }
    
    const result = {
      success: true,
      totalPrincipal: totalPrincipal,
      interestEarned: interestEarned,
      maturityValue: maturityValue,
      yearlyData: yearlyData,
      parameters: {
        principal: principal,
        monthlyDeposit: monthlyDeposit,
        years: years,
        rate: params.rate,
        frequency: frequency
      }
    };
    
    Logger.log('Calculation completed: Maturity Value = ' + maturityValue.toFixed(2));
    return result;
    
  } catch (error) {
    Logger.log('Error in calculateCompoundInterest: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  try {
    return 'RM ' + amount.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (error) {
    Logger.log('Error formatting currency: ' + error.message);
    return 'RM ' + amount.toFixed(2);
  }
}