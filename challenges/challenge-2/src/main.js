/**
 * Challenge 2 - Room Management System
 * A web-based room booking system with admin controls
 * @OnlyCurrentDoc
 */

// --- CONFIGURATION ---
// IMPORTANT: Add all administrator email addresses here, separated by commas.
const ADMIN_EMAILS = ["idrishjauhari6@gmail.com", "213025@student.upm.edu.my"];

// --- GLOBAL VARIABLES ---
let ss;

/**
 * Initializes the spreadsheet for the application.
 * Creates a new spreadsheet on the first run.
 */
function setup() {
  const anId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

  if (anId) {
    try {
      ss = SpreadsheetApp.openById(anId);
    } catch (e) {
      Logger.log('Could not open spreadsheet with ID: ' + anId + '. Error: ' + e);
      createNewSpreadsheet();
    }
  } else {
    createNewSpreadsheet();
  }
}

/**
 * Creates and initializes a new spreadsheet with the required sheets and headers.
 */
function createNewSpreadsheet() {
  ss = SpreadsheetApp.create('Room Management System Data');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  // Clean up default sheet
  if (ss.getSheetByName('Sheet1')) {
    ss.deleteSheet(ss.getSheetByName('Sheet1'));
  }

  // Create and setup Rooms Sheet
  const roomsSheet = ss.insertSheet('Rooms');
  roomsSheet.getRange('A1:B1').setValues([['RoomName', 'Description']]).setFontWeight('bold');
  roomsSheet.appendRow(['Conference Room A', 'Seats 10, has a projector']);
  roomsSheet.appendRow(['Focus Room B', 'Seats 2, has a whiteboard']);

  // Create and setup Bookings Sheet
  const bookingsSheet = ss.insertSheet('Bookings');
  bookingsSheet.getRange('A1:H1').setValues([['BookingID', 'RoomName', 'UserName', 'UserEmail', 'Date', 'StartTime', 'EndTime', 'Status']]).setFontWeight('bold');

  Logger.log('New spreadsheet created with ID: ' + ss.getId());
}

/**
 * Main function to serve the HTML file of the web app.
 * @param {Object} e - The event parameter for a web app GET request.
 * @returns {HtmlOutput} The HTML service output.
 */
function doGet(e) {
  try {
    setup();
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Room Management System')
      .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    throw error;
  }
}

/**
 * Gets initial data for the app: user info, rooms, and today's bookings.
 * @returns {Object} An object containing user data, room list, and bookings.
 */
function getInitialData() {
  try {
    setup();
    const userEmail = Session.getActiveUser().getEmail();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

    Logger.log('User ' + userEmail + ' loaded initial data. Admin: ' + isAdmin);

    return {
      user: { email: userEmail, isAdmin: isAdmin },
      rooms: getRooms(),
      bookings: getBookingsForDate(today)
    };
  } catch (error) {
    Logger.log('Error in getInitialData: ' + error.message);
    throw new Error('Failed to load initial data: ' + error.message);
  }
}

/**
 * Checks if the current user is an admin.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
function isAdminUser() {
  const userEmail = Session.getActiveUser().getEmail();
  return ADMIN_EMAILS.includes(userEmail);
}

/**
 * Retrieves all rooms from the 'Rooms' sheet.
 * @returns {Array<Object>} An array of room objects.
 */
function getRooms() {
  try {
    setup();
    const sheet = ss.getSheetByName('Rooms');
    if (!sheet || sheet.getLastRow() < 2) return [];

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    const rooms = data.map(row => ({ name: row[0], description: row[1] })).filter(room => room.name);
    return rooms;
  } catch (error) {
    Logger.log('Error in getRooms: ' + error.message);
    throw new Error('Failed to retrieve rooms: ' + error.message);
  }
}

/**
 * Adds a new room to the 'Rooms' sheet. Only accessible by admins.
 * @param {string} roomName - The name of the new room.
 * @param {string} description - The description of the new room.
 * @returns {Object} An object indicating success or failure.
 */
function addRoom(roomName, description) {
  try {
    if (!isAdminUser()) {
      return { success: false, message: 'Permission denied.' };
    }

    setup();
    const sheet = ss.getSheetByName('Rooms');
    sheet.appendRow([roomName, description]);

    Logger.log('Admin added room: ' + roomName);
    return { success: true, message: 'Room added successfully.' };
  } catch (error) {
    Logger.log('Error in addRoom: ' + error.message);
    return { success: false, message: 'Failed to add room: ' + error.message };
  }
}

/**
 * Removes a room and all its associated bookings. Admin only.
 * @param {string} roomName - The name of the room to remove.
 * @returns {Object} An object indicating success or failure.
 */
function removeRoom(roomName) {
  try {
    if (!isAdminUser()) {
      return { success: false, message: 'Permission denied.' };
    }

    setup();
    const roomsSheet = ss.getSheetByName('Rooms');
    const bookingsSheet = ss.getSheetByName('Bookings');

    // Remove room from 'Rooms' sheet
    const roomData = roomsSheet.getDataRange().getValues();
    let roomFound = false;
    for (let i = roomData.length - 1; i >= 1; i--) {
      if (roomData[i][0] === roomName) {
        roomsSheet.deleteRow(i + 1);
        roomFound = true;
        break;
      }
    }

    if (!roomFound) {
      return { success: false, message: 'Room not found.' };
    }

    // Remove associated bookings from 'Bookings' sheet
    const bookingData = bookingsSheet.getDataRange().getValues();
    let bookingsDeleted = 0;
    for (let i = bookingData.length - 1; i >= 1; i--) {
      if (bookingData[i][1] === roomName) {
        bookingsSheet.deleteRow(i + 1);
        bookingsDeleted++;
      }
    }

    Logger.log('Admin removed room: ' + roomName + ' and ' + bookingsDeleted + ' associated bookings.');
    return { success: true, message: 'Room "' + roomName + '" and its bookings were removed.' };
  } catch (error) {
    Logger.log('Error in removeRoom: ' + error.message);
    return { success: false, message: 'Failed to remove room: ' + error.message };
  }
}

/**
 * Retrieves all bookings for a specific date from the 'Bookings' sheet.
 * @param {string} dateString - The date in YYYY-MM-DD format.
 * @returns {Array<Object>} An array of booking objects for the given date.
 */
function getBookingsForDate(dateString) {
  try {
    setup();
    const sheet = ss.getSheetByName('Bookings');
    if (!sheet || sheet.getLastRow() < 2) return [];

    const data = sheet.getDataRange().getDisplayValues();
    const bookings = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][4] === dateString) {
        bookings.push({
          bookingId: data[i][0],
          roomName: data[i][1],
          userName: data[i][2],
          userEmail: data[i][3],
          date: data[i][4],
          startTime: data[i][5],
          endTime: data[i][6],
          status: data[i][7]
        });
      }
    }

    Logger.log('Found ' + bookings.length + ' bookings for date ' + dateString);
    return bookings;
  } catch (error) {
    Logger.log('Error in getBookingsForDate: ' + error.message);
    throw new Error('Failed to retrieve bookings: ' + error.message);
  }
}

/**
 * Creates a new booking.
 * @param {Object} bookingDetails - An object with roomName, date, startTime, endTime.
 * @returns {Object} An object indicating success or failure.
 */
function bookRoom(bookingDetails) {
  try {
    setup();
    const bookingsSheet = ss.getSheetByName('Bookings');
    const user = Session.getActiveUser();

    // Conflict Check
    const existingBookings = getBookingsForDate(bookingDetails.date);
    const newStart = new Date(bookingDetails.date + 'T' + bookingDetails.startTime);
    const newEnd = new Date(bookingDetails.date + 'T' + bookingDetails.endTime);

    for (const booking of existingBookings) {
      if (booking.roomName === bookingDetails.roomName && booking.status === 'Confirmed') {
        const existingStart = new Date(booking.date + 'T' + booking.startTime);
        const existingEnd = new Date(booking.date + 'T' + booking.endTime);
        if (newStart < existingEnd && newEnd > existingStart) {
          return { success: false, message: 'Time slot is already booked.' };
        }
      }
    }

    const newBookingId = 'B' + new Date().getTime();
    bookingsSheet.appendRow([
      newBookingId,
      bookingDetails.roomName,
      user.getUsername(),
      user.getEmail(),
      bookingDetails.date,
      bookingDetails.startTime,
      bookingDetails.endTime,
      'Confirmed'
    ]);

    Logger.log('User ' + user.getEmail() + ' booked room ' + bookingDetails.roomName + ' for ' + bookingDetails.date);
    return { success: true, message: 'Room booked successfully!' };
  } catch (error) {
    Logger.log('Error in bookRoom: ' + error.message);
    return { success: false, message: 'Failed to book room: ' + error.message };
  }
}

/**
 * Cancels a booking by changing its status.
 * @param {string} bookingId - The ID of the booking to cancel.
 * @returns {Object} An object indicating success or failure.
 */
function cancelBooking(bookingId) {
  try {
    setup();
    const sheet = ss.getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();
    const userEmail = Session.getActiveUser().getEmail();
    const isAdmin = isAdminUser();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        const bookingEmail = data[i][3];
        if (isAdmin || userEmail === bookingEmail) {
          sheet.getRange(i + 1, 8).setValue('Cancelled');
          return { success: true, message: 'Booking cancelled.' };
        } else {
          return { success: false, message: "You don't have permission to cancel this booking." };
        }
      }
    }
    return { success: false, message: 'Booking not found.' };
  } catch (error) {
    Logger.log('Error in cancelBooking: ' + error.message);
    return { success: false, message: 'Failed to cancel booking: ' + error.message };
  }
}

/**
 * Permanently deletes a booking record. Admin only.
 * @param {string} bookingId - The ID of the booking to delete.
 * @returns {Object} An object indicating success or failure.
 */
function deleteBooking(bookingId) {
  try {
    if (!isAdminUser()) {
      return { success: false, message: 'Permission denied. Only admins can delete bookings.' };
    }

    setup();
    const sheet = ss.getSheetByName('Bookings');
    const data = sheet.getDataRange().getValues();

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === bookingId) {
        sheet.deleteRow(i + 1);
        Logger.log('Admin deleted booking ID: ' + bookingId);
        return { success: true, message: 'Booking permanently deleted.' };
      }
    }

    return { success: false, message: 'Booking not found.' };
  } catch (error) {
    Logger.log('Error in deleteBooking: ' + error.message);
    return { success: false, message: 'Failed to delete booking: ' + error.message };
  }
}