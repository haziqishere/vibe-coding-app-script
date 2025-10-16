/**
 * Challenge 3 - Smart Spreadsheet Translator
 * Auto-detects language and translates selected cells or ranges
 */

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌐 Translator')
    .addItem('Open Translator', 'showTranslatorSidebar')
    .addSeparator()
    .addItem('Translate Selection', 'quickTranslate')
    .addToUi();
}

/*
 * Shows the translator sidebar
 */
function showTranslatorSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Smart Translator')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Quick translate function (prompts for language)
 */
function quickTranslate() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.prompt(
    'Quick Translate',
    'Enter target language code (en, ms, zh-CN, ja, etc.):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const targetLang = response.getResponseText().trim();
    
    try {
      const result = performTranslation(targetLang, false);
      ui.alert(
        'Translation Complete!',
        `Translated ${result.translatedCells} out of ${result.totalCells} cells.`,
        ui.ButtonSet.OK
      );
    } catch (error) {
      ui.alert('Error', error.message, ui.ButtonSet.OK);
    }
  }
}

/**
 * Creates the web app UI (for standalone deployment)
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Smart Spreadsheet Translator')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/translate_24dp.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Gets information about the active spreadsheet
 * @returns {Object} Spreadsheet info including name and active sheet
 */
function getSpreadsheetInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      throw new Error('No spreadsheet is active');
    }
    
    const sheet = ss.getActiveSheet();
    const selection = sheet.getActiveRange();
    
    return {
      spreadsheetName: ss.getName(),
      sheetName: sheet.getName(),
      selectionAddress: selection.getA1Notation(),
      cellCount: selection.getNumRows() * selection.getNumColumns(),
      isMultiCell: (selection.getNumRows() * selection.getNumColumns()) > 1
    };
  } catch (error) {
    Logger.log('Error in getSpreadsheetInfo: ' + error.message);
    throw new Error('Unable to access spreadsheet. Please open this tool from within a Google Sheet by going to Extensions > Apps Script, then run onOpen() or use the custom menu.');
  }
}

/**
 * Detects the language of given text
 * @param {string} text - Text to detect language from
 * @returns {string} Detected language code
 */
function detectLanguage(text) {
  try {
    const cleanText = text.trim();
    if (!cleanText) {
      return 'unknown';
    }
    
    // Detect by character patterns (most reliable method)
    if (/[\u4e00-\u9fa5]/.test(cleanText)) return 'zh-CN'; // Chinese
    if (/[\u0600-\u06FF]/.test(cleanText)) return 'ar';    // Arabic
    if (/[\u0400-\u04FF]/.test(cleanText)) return 'ru';    // Russian
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(cleanText)) return 'ja'; // Japanese
    if (/[\uAC00-\uD7AF]/.test(cleanText)) return 'ko';    // Korean
    if (/[\u0E00-\u0E7F]/.test(cleanText)) return 'th';    // Thai
    
    // For Latin-based languages, let Google auto-detect
    return 'auto';
  } catch (error) {
    Logger.log('Error detecting language: ' + error.message);
    return 'auto';
  }
}

/**
 * Translates text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {string} Translated text
 */
function translateText(text, targetLang, sourceLang = '') {
  try {
    if (!text || !text.trim()) {
      return text;
    }
    
    return LanguageApp.translate(text, sourceLang, targetLang);
  } catch (error) {
    Logger.log('Error translating text: ' + error.message);
    throw error;
  }
}

/**
 * Main translation function for the active selection
 * @param {string} targetLang - Target language code
 * @param {boolean} activeCell - If true, only translate active cell, else translate entire range
 * @returns {Object} Translation results and statistics
 */
function performTranslation(targetLang, activeCell) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const range = sheet.getActiveRange();
    
    // Store original values for undo
    const originalValues = range.getValues();
    storeOriginalValues(sheet.getName(), range.getA1Notation(), originalValues);
    
    const stats = {
      totalCells: 0,
      translatedCells: 0,
      emptyCells: 0,
      languagesDetected: {},
      targetLanguage: getLanguageName(targetLang),
      errors: []
    };
    
    if (activeCell) {
      // Translate only active cell
      const cell = sheet.getActiveCell();
      const value = cell.getValue();
      
      if (value && value.toString().trim()) {
        stats.totalCells = 1;
        const detectedLang = detectLanguage(value.toString());
        stats.languagesDetected[getLanguageName(detectedLang)] = 1;
        
        try {
          const translated = translateText(value.toString(), targetLang, detectedLang);
          cell.setValue(translated);
          stats.translatedCells = 1;
        } catch (error) {
          stats.errors.push(`Cell ${cell.getA1Notation()}: ${error.message}`);
        }
      } else {
        stats.emptyCells = 1;
      }
    } else {
      // Translate entire range
      const values = range.getValues();
      const numRows = values.length;
      const numCols = values[0].length;
      
      stats.totalCells = numRows * numCols;
      
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const value = values[i][j];
          
          if (value && value.toString().trim()) {
            const detectedLang = detectLanguage(value.toString());
            const langName = getLanguageName(detectedLang);
            stats.languagesDetected[langName] = (stats.languagesDetected[langName] || 0) + 1;
            
            try {
              values[i][j] = translateText(value.toString(), targetLang, detectedLang);
              stats.translatedCells++;
            } catch (error) {
              const cellAddress = range.getCell(i + 1, j + 1).getA1Notation();
              stats.errors.push(`Cell ${cellAddress}: ${error.message}`);
            }
          } else {
            stats.emptyCells++;
          }
        }
      }
      
      // Write translated values back
      range.setValues(values);
    }
    
    Logger.log('Translation completed: ' + JSON.stringify(stats));
    return stats;
    
  } catch (error) {
    Logger.log('Error in performTranslation: ' + error.message);
    throw new Error('Translation failed: ' + error.message);
  }
}

/**
 * Translates to multiple languages side by side
 * @param {Array<string>} targetLangs - Array of target language codes
 * @returns {Object} Translation results
 */
function performMultiLanguageTranslation(targetLangs) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const range = sheet.getActiveRange();
    const values = range.getValues();
    
    // Store original for undo
    storeOriginalValues(sheet.getName(), range.getA1Notation(), values);
    
    const numRows = values.length;
    const numCols = values[0].length;
    const startCol = range.getColumn();
    
    const stats = {
      totalCells: numRows * numCols,
      translatedCells: 0,
      languagesDetected: {},
      targetLanguages: targetLangs.map(lang => getLanguageName(lang)),
      errors: []
    };
    
    // For each target language, create a new column
    targetLangs.forEach((targetLang, langIndex) => {
      const targetCol = startCol + numCols + langIndex;
      
      // Add header
      sheet.getRange(range.getRow(), targetCol).setValue(getLanguageName(targetLang));
      sheet.getRange(range.getRow(), targetCol).setFontWeight('bold').setBackground('#e8f0fe');
      
      // Translate each cell
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const value = values[i][j];
          
          if (value && value.toString().trim()) {
            const detectedLang = detectLanguage(value.toString());
            if (langIndex === 0) {
              const langName = getLanguageName(detectedLang);
              stats.languagesDetected[langName] = (stats.languagesDetected[langName] || 0) + 1;
            }
            
            try {
              const translated = translateText(value.toString(), targetLang, detectedLang);
              sheet.getRange(range.getRow() + i, targetCol + j).setValue(translated);
              stats.translatedCells++;
            } catch (error) {
              const cellAddress = sheet.getRange(range.getRow() + i, targetCol + j).getA1Notation();
              stats.errors.push(`Cell ${cellAddress}: ${error.message}`);
            }
          }
        }
      }
    });
    
    return stats;
    
  } catch (error) {
    Logger.log('Error in performMultiLanguageTranslation: ' + error.message);
    throw new Error('Multi-language translation failed: ' + error.message);
  }
}

/**
 * Stores original values for undo functionality
 * @param {string} sheetName - Sheet name
 * @param {string} rangeAddress - Range address in A1 notation
 * @param {Array} values - Original values
 */
function storeOriginalValues(sheetName, rangeAddress, values) {
  try {
    const cache = CacheService.getUserCache();
    const key = `undo_${sheetName}_${rangeAddress}`;
    
    const undoData = {
      sheetName: sheetName,
      rangeAddress: rangeAddress,
      values: values,
      timestamp: new Date().toISOString()
    };
    
    // Store for 6 hours
    cache.put(key, JSON.stringify(undoData), 21600);
    
    // Also store the latest undo key
    cache.put('latest_undo_key', key, 21600);
    
    Logger.log('Stored undo data for ' + rangeAddress);
  } catch (error) {
    Logger.log('Error storing undo data: ' + error.message);
  }
}

/**
 * Restores original values (undo function)
 * @returns {Object} Undo operation results
 */
function performUndo() {
  try {
    const cache = CacheService.getUserCache();
    const latestKey = cache.get('latest_undo_key');
    
    if (!latestKey) {
      throw new Error('No recent translation found to undo. Undo data expires after 6 hours.');
    }
    
    const undoDataStr = cache.get(latestKey);
    if (!undoDataStr) {
      throw new Error('Undo data not found or expired.');
    }
    
    const undoData = JSON.parse(undoDataStr);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(undoData.sheetName);
    
    if (!sheet) {
      throw new Error('Sheet "' + undoData.sheetName + '" not found.');
    }
    
    const range = sheet.getRange(undoData.rangeAddress);
    range.setValues(undoData.values);
    
    // Clear the undo data
    cache.remove(latestKey);
    cache.remove('latest_undo_key');
    
    return {
      success: true,
      message: 'Successfully restored original values',
      sheetName: undoData.sheetName,
      rangeAddress: undoData.rangeAddress,
      cellCount: undoData.values.length * undoData.values[0].length
    };
    
  } catch (error) {
    Logger.log('Error in performUndo: ' + error.message);
    throw new Error('Undo failed: ' + error.message);
  }
}

/**
 * Gets human-readable language name from code
 * @param {string} code - Language code
 * @returns {string} Language name
 */
function getLanguageName(code) {
  const languageMap = {
    'en': 'English',
    'ms': 'Malay',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'tl': 'Tagalog',
    'auto': 'Auto-detected',
    'unknown': 'Unknown'
  };
  
  return languageMap[code] || code;
}

/**
 * Gets list of supported languages
 * @returns {Array<Object>} Array of language objects with code and name
 */
function getSupportedLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Malay' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'tl', name: 'Tagalog' }
  ];
}