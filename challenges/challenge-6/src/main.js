/**
 * Challenge 6 - Student Project Management System
 * A Jira-like ticketing system optimized for university group projects
 */

// ===== CONFIGURATION =====
// IMPORTANT: Set your spreadsheet ID here
// Get the ID from: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
const SPREADSHEET_ID = '1oaxZAVnZH5rGVJ10o1dlObmC0RCLiYtmoLe0uV6UhoA';

/**
 * Serves the web app HTML
 * @returns {HtmlOutput} The HTML page
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Student Project Hub')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/tasks_48dp.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Gets the spreadsheet database
 * @returns {Spreadsheet} The project spreadsheet
 */
function getSpreadsheet() {
  try {
    if (!SPREADSHEET_ID || SPREADSHEET_ID === '') {
      throw new Error('SPREADSHEET_ID not configured. Please run setupSharedSpreadsheet() first.');
    }
    
    Logger.log('Opening spreadsheet: ' + SPREADSHEET_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Verify sheets exist
    const hasProjects = ss.getSheetByName('Projects') !== null;
    const hasTasks = ss.getSheetByName('Tasks') !== null;
    const hasTeam = ss.getSheetByName('Team') !== null;
    
    if (!hasProjects || !hasTasks || !hasTeam) {
      Logger.log('Missing sheets, initializing...');
      initializeSheets(ss);
    }
    
    return ss;
    
  } catch (error) {
    Logger.log('Error in getSpreadsheet: ' + error.message);
    throw new Error('Cannot access database. Make sure SPREADSHEET_ID is correct and the spreadsheet is shared with you.');
  }
}

/**
 * Initializes the spreadsheet with required sheets and headers
 * @param {Spreadsheet} ss - The spreadsheet to initialize
 */
function initializeSheets(ss) {
  try {
    Logger.log('Initializing sheets...');
    
    // Remove default sheet if it exists
    try {
      const defaultSheet = ss.getSheetByName('Sheet1');
      if (defaultSheet && ss.getSheets().length > 1) {
        ss.deleteSheet(defaultSheet);
      }
    } catch (e) {
      // Ignore if can't delete
    }
    
    // Projects sheet
    let projectsSheet = ss.getSheetByName('Projects');
    if (!projectsSheet) {
      projectsSheet = ss.insertSheet('Projects');
    }
    if (projectsSheet.getLastRow() === 0) {
      projectsSheet.getRange('A1:H1').setValues([[
        'ProjectID', 'ProjectName', 'Description', 'CreatedDate', 
        'FolderURL', 'DocURL', 'SlidesURL', 'CalendarID'
      ]]).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      projectsSheet.setFrozenRows(1);
    }
    
    // Tasks sheet
    let tasksSheet = ss.getSheetByName('Tasks');
    if (!tasksSheet) {
      tasksSheet = ss.insertSheet('Tasks');
    }
    if (tasksSheet.getLastRow() === 0) {
      tasksSheet.getRange('A1:J1').setValues([[
        'TaskID', 'ProjectID', 'Title', 'Description', 'AssignedTo', 
        'Priority', 'Status', 'DueDate', 'CreatedDate', 'EventID'
      ]]).setFontWeight('bold').setBackground('#34a853').setFontColor('#ffffff');
      tasksSheet.setFrozenRows(1);
    }
    
    // Team sheet
    let teamSheet = ss.getSheetByName('Team');
    if (!teamSheet) {
      teamSheet = ss.insertSheet('Team');
    }
    if (teamSheet.getLastRow() === 0) {
      teamSheet.getRange('A1:D1').setValues([[
        'MemberID', 'ProjectID', 'Name', 'Email'
      ]]).setFontWeight('bold').setBackground('#fbbc04').setFontColor('#ffffff');
      teamSheet.setFrozenRows(1);
    }
    
    Logger.log('Sheets initialized successfully');
  } catch (error) {
    Logger.log('Error in initializeSheets: ' + error.message);
    throw error;
  }
}

/**
 * Setup function - creates a new shared spreadsheet
 * Run this ONCE, then copy the ID to SPREADSHEET_ID constant
 */
function setupSharedSpreadsheet() {
  try {
    const ss = SpreadsheetApp.create('Student Project Hub - Database (Shared)');
    const ssId = ss.getId();
    
    initializeSheets(ss);
    
    Logger.log('='.repeat(60));
    Logger.log('✅ Shared database created successfully!');
    Logger.log('='.repeat(60));
    Logger.log('');
    Logger.log('📝 Spreadsheet ID: ' + ssId);
    Logger.log('🔗 Spreadsheet URL: ' + ss.getUrl());
    Logger.log('');
    Logger.log('👉 NEXT STEPS:');
    Logger.log('1. Copy this ID: ' + ssId);
    Logger.log('2. Paste it into SPREADSHEET_ID at top of main.js');
    Logger.log('3. Open: ' + ss.getUrl());
    Logger.log('4. Click Share → Anyone with link → Editor');
    Logger.log('5. Save and push: clasp push');
    Logger.log('');
    Logger.log('='.repeat(60));
    
    return {
      success: true,
      spreadsheetId: ssId,
      spreadsheetUrl: ss.getUrl()
    };
    
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check if spreadsheet is accessible
 */
function checkAccess() {
  try {
    Logger.log('Checking access to: ' + SPREADSHEET_ID);
    const ss = getSpreadsheet();
    Logger.log('✅ SUCCESS! Can access: ' + ss.getName());
    Logger.log('URL: ' + ss.getUrl());
    Logger.log('Current user: ' + Session.getActiveUser().getEmail());
    return { success: true, name: ss.getName(), url: ss.getUrl() };
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a new project with Google Drive integration
 * @param {Object} projectData - Project details
 * @returns {Object} Result with status and data
 */
function createProject(projectData) {
  try {
    Logger.log('Creating project: ' + JSON.stringify(projectData));
    
    if (!projectData || !projectData.projectName || !projectData.teamMembers) {
      throw new Error('Invalid project data provided');
    }
    
    const ss = getSpreadsheet();
    const projectsSheet = ss.getSheetByName('Projects');
    const teamSheet = ss.getSheetByName('Team');
    
    const projectId = 'PROJ-' + new Date().getTime();
    const createdDate = new Date();
    
    const folderName = '[Project] ' + projectData.projectName;
    const folder = DriveApp.createFolder(folderName);
    const folderUrl = folder.getUrl();
    
    const doc = DocumentApp.create(projectData.projectName + ' - Report');
    const docFile = DriveApp.getFileById(doc.getId());
    folder.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
    const docUrl = doc.getUrl();
    
    const slides = SlidesApp.create(projectData.projectName + ' - Presentation');
    const slidesFile = DriveApp.getFileById(slides.getId());
    folder.addFile(slidesFile);
    DriveApp.getRootFolder().removeFile(slidesFile);
    const slidesUrl = slides.getUrl();
    
    const calendar = CalendarApp.createCalendar(folderName);
    const calendarId = calendar.getId();
    
    projectData.teamMembers.forEach(function(member) {
      try {
        folder.addEditor(member.email);
        calendar.addGuest(member.email);
      } catch (e) {
        Logger.log('Could not share with: ' + member.email);
      }
      
      const memberId = 'MEM-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
      teamSheet.appendRow([memberId, projectId, member.name, member.email]);
    });
    
    projectsSheet.appendRow([
      projectId,
      projectData.projectName,
      projectData.description || '',
      createdDate,
      folderUrl,
      docUrl,
      slidesUrl,
      calendarId
    ]);
    
    Logger.log('Project created: ' + projectId);
    
    return {
      success: true,
      message: 'Project created successfully!',
      data: {
        projectId: projectId,
        folderUrl: folderUrl,
        docUrl: docUrl,
        slidesUrl: slidesUrl,
        calendarId: calendarId
      }
    };
    
  } catch (error) {
    Logger.log('Error in createProject: ' + error.message);
    return {
      success: false,
      message: 'Failed to create project: ' + error.message
    };
  }
}

/**
 * Gets all projects for the current user
 * @returns {Object} Projects data
 */
function getProjects() {
  try {
    const ss = getSpreadsheet();
    const projectsSheet = ss.getSheetByName('Projects');
    const teamSheet = ss.getSheetByName('Team');
    
    if (projectsSheet.getLastRow() < 2) {
      return { success: true, projects: [] };
    }
    
    const userEmail = Session.getActiveUser().getEmail();
    const teamData = teamSheet.getDataRange().getValues();
    const userProjectIds = [];
    
    for (let i = 1; i < teamData.length; i++) {
      if (teamData[i][3] === userEmail) {
        userProjectIds.push(teamData[i][1]);
      }
    }
    
    const projectData = projectsSheet.getDataRange().getValues();
    const projects = [];
    
    for (let i = 1; i < projectData.length; i++) {
      if (userProjectIds.indexOf(projectData[i][0]) > -1) {
        projects.push({
          projectId: projectData[i][0],
          projectName: projectData[i][1],
          description: projectData[i][2],
          createdDate: new Date(projectData[i][3]).toLocaleDateString(),
          folderUrl: projectData[i][4],
          docUrl: projectData[i][5],
          slidesUrl: projectData[i][6],
          calendarId: projectData[i][7]
        });
      }
    }
    
    return { success: true, projects: projects };
    
  } catch (error) {
    Logger.log('Error in getProjects: ' + error.message);
    return {
      success: false,
      message: 'Failed to load projects: ' + error.message
    };
  }
}

/**
 * Gets project details including tasks and team members
 * @param {string} projectId - The project ID
 * @returns {Object} Project data with tasks and team
 */
function getProjectDetails(projectId) {
  try {
    const ss = getSpreadsheet();
    const projectsSheet = ss.getSheetByName('Projects');
    const tasksSheet = ss.getSheetByName('Tasks');
    const teamSheet = ss.getSheetByName('Team');
    
    const projectData = projectsSheet.getDataRange().getValues();
    let project = null;
    
    for (let i = 1; i < projectData.length; i++) {
      if (projectData[i][0] === projectId) {
        project = {
          projectId: projectData[i][0],
          projectName: projectData[i][1],
          description: projectData[i][2],
          createdDate: new Date(projectData[i][3]).toLocaleDateString(),
          folderUrl: projectData[i][4],
          docUrl: projectData[i][5],
          slidesUrl: projectData[i][6],
          calendarId: projectData[i][7]
        };
        break;
      }
    }
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const tasks = [];
    if (tasksSheet.getLastRow() > 1) {
      const taskData = tasksSheet.getDataRange().getValues();
      for (let i = 1; i < taskData.length; i++) {
        if (taskData[i][1] === projectId) {
          tasks.push({
            taskId: taskData[i][0],
            title: taskData[i][2],
            description: taskData[i][3],
            assignedTo: taskData[i][4],
            priority: taskData[i][5],
            status: taskData[i][6],
            dueDate: taskData[i][7] ? new Date(taskData[i][7]).toLocaleDateString() : '',
            createdDate: new Date(taskData[i][8]).toLocaleDateString()
          });
        }
      }
    }
    
    const teamData = teamSheet.getDataRange().getValues();
    const team = [];
    for (let i = 1; i < teamData.length; i++) {
      if (teamData[i][1] === projectId) {
        team.push({
          memberId: teamData[i][0],
          name: teamData[i][2],
          email: teamData[i][3]
        });
      }
    }
    
    return {
      success: true,
      project: project,
      tasks: tasks,
      team: team
    };
    
  } catch (error) {
    Logger.log('Error in getProjectDetails: ' + error.message);
    return {
      success: false,
      message: 'Failed to load project details: ' + error.message
    };
  }
}

/**
 * Creates a new task
 * @param {Object} taskData - Task details
 * @returns {Object} Result with status
 */
function createTask(taskData) {
  try {
    const ss = getSpreadsheet();
    const tasksSheet = ss.getSheetByName('Tasks');
    const projectsSheet = ss.getSheetByName('Projects');
    
    const taskId = 'TASK-' + new Date().getTime();
    const createdDate = new Date();
    
    const projectData = projectsSheet.getDataRange().getValues();
    let calendarId = null;
    for (let i = 1; i < projectData.length; i++) {
      if (projectData[i][0] === taskData.projectId) {
        calendarId = projectData[i][7];
        break;
      }
    }
    
    let eventId = null;
    if (calendarId && taskData.dueDate) {
      try {
        const calendar = CalendarApp.getCalendarById(calendarId);
        const dueDate = new Date(taskData.dueDate);
        const event = calendar.createEvent(
          '[' + taskData.priority + '] ' + taskData.title,
          dueDate,
          new Date(dueDate.getTime() + 3600000),
          { description: taskData.description + '\n\nAssigned to: ' + taskData.assignedTo }
        );
        eventId = event.getId();
      } catch (e) {
        Logger.log('Could not create calendar event: ' + e.message);
      }
    }
    
    tasksSheet.appendRow([
      taskId,
      taskData.projectId,
      taskData.title,
      taskData.description || '',
      taskData.assignedTo,
      taskData.priority,
      'To Do',
      taskData.dueDate || '',
      createdDate,
      eventId || ''
    ]);
    
    return {
      success: true,
      message: 'Task created successfully!',
      taskId: taskId
    };
    
  } catch (error) {
    Logger.log('Error in createTask: ' + error.message);
    return {
      success: false,
      message: 'Failed to create task: ' + error.message
    };
  }
}

/**
 * Updates task status
 * @param {string} taskId - Task ID
 * @param {string} newStatus - New status
 * @returns {Object} Result with status
 */
function updateTaskStatus(taskId, newStatus) {
  try {
    const ss = getSpreadsheet();
    const tasksSheet = ss.getSheetByName('Tasks');
    const data = tasksSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === taskId) {
        tasksSheet.getRange(i + 1, 7).setValue(newStatus);
        
        const projectsSheet = ss.getSheetByName('Projects');
        const projectData = projectsSheet.getDataRange().getValues();
        
        for (let j = 1; j < projectData.length; j++) {
          if (projectData[j][0] === data[i][1]) {
            const calendarId = projectData[j][7];
            const eventId = data[i][9];
            
            if (calendarId && eventId) {
              try {
                const calendar = CalendarApp.getCalendarById(calendarId);
                const event = calendar.getEventById(eventId);
                if (event) {
                  let title = event.getTitle().replace(/^✅ /, '').replace(/^🔄 /, '');
                  if (newStatus === 'Done') title = '✅ ' + title;
                  else if (newStatus === 'In Progress') title = '🔄 ' + title;
                  event.setTitle(title);
                }
              } catch (e) {
                Logger.log('Could not update calendar: ' + e.message);
              }
            }
            break;
          }
        }
        
        return { success: true, message: 'Task status updated!' };
      }
    }
    
    throw new Error('Task not found');
    
  } catch (error) {
    Logger.log('Error in updateTaskStatus: ' + error.message);
    return {
      success: false,
      message: 'Failed to update task: ' + error.message
    };
  }
}

/**
 * Sends deadline reminders for tasks due soon
 */
function sendDeadlineReminders() {
  try {
    const ss = getSpreadsheet();
    const tasksSheet = ss.getSheetByName('Tasks');
    const teamSheet = ss.getSheetByName('Team');
    const projectsSheet = ss.getSheetByName('Projects');
    
    if (tasksSheet.getLastRow() < 2) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskData = tasksSheet.getDataRange().getValues();
    
    for (let i = 1; i < taskData.length; i++) {
      if (taskData[i][6] !== 'Done' && taskData[i][7]) {
        const taskDue = new Date(taskData[i][7]);
        taskDue.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.ceil((taskDue - today) / 86400000);
        
        if (daysDiff >= 0 && daysDiff <= 2) {
          const teamData = teamSheet.getDataRange().getValues();
          let assigneeEmail = null;
          
          for (let j = 1; j < teamData.length; j++) {
            if (teamData[j][1] === taskData[i][1] && teamData[j][2] === taskData[i][4]) {
              assigneeEmail = teamData[j][3];
              break;
            }
          }
          
          if (assigneeEmail) {
            const projectData = projectsSheet.getDataRange().getValues();
            let projectName = 'Your Project';
            
            for (let k = 1; k < projectData.length; k++) {
              if (projectData[k][0] === taskData[i][1]) {
                projectName = projectData[k][1];
                break;
              }
            }
            
            const subject = '⏰ Task Due Soon: ' + taskData[i][2];
            const body = '<div style="font-family: Arial, sans-serif;"><h2 style="color: #4285f4;">Task Reminder</h2><p>Hi ' + taskData[i][4] + ',</p><p>Your task is due soon:</p><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>' + taskData[i][2] + '</h3><p><strong>Project:</strong> ' + projectName + '</p><p><strong>Due Date:</strong> ' + taskDue.toLocaleDateString() + '</p><p><strong>Days Remaining:</strong> ' + daysDiff + ' day' + (daysDiff !== 1 ? 's' : '') + '</p></div></div>';
            
            try {
              GmailApp.sendEmail(assigneeEmail, subject, '', { htmlBody: body });
              Logger.log('Reminder sent to ' + assigneeEmail);
            } catch (e) {
              Logger.log('Failed to send reminder: ' + e.message);
            }
          }
        }
      }
    }
    
    Logger.log('Reminders sent successfully');
    
  } catch (error) {
    Logger.log('Error in sendDeadlineReminders: ' + error.message);
  }
}

/**
 * Gets current user's email
 * @returns {string} User email
 */
function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Test function - creates a demo project
 */
function testCreateProject() {
  const result = createProject({
    projectName: "Test Project - AI Ethics",
    description: "Research paper on AI ethics for CS401",
    teamMembers: [
      { name: "Test User", email: Session.getActiveUser().getEmail() }
    ]
  });
  
  Logger.log(result);
  return result;
}