/**
 * Challenge 6 - Student Project Management System
 * A Jira-like ticketing system optimized for university group projects
 */

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
 * Gets or creates the spreadsheet database
 * @returns {Spreadsheet} The project spreadsheet
 */
function getSpreadsheet() {
  try {
    const props = PropertiesService.getScriptProperties();
    let ssId = props.getProperty('SPREADSHEET_ID');
    
    if (!ssId) {
      // Create new spreadsheet
      Logger.log('Creating new spreadsheet...');
      const ss = SpreadsheetApp.create('Student Project Hub - Database');
      ssId = ss.getId();
      props.setProperty('SPREADSHEET_ID', ssId);
      
      // Initialize sheets
      initializeSheets(ss);
      Logger.log('Spreadsheet created with ID: ' + ssId);
      return ss;
    }
    
    // Try to open existing spreadsheet
    try {
      const ss = SpreadsheetApp.openById(ssId);
      
      // Verify sheets exist
      if (!ss.getSheetByName('Projects') || !ss.getSheetByName('Tasks') || !ss.getSheetByName('Team')) {
        Logger.log('Sheets missing, reinitializing...');
        initializeSheets(ss);
      }
      
      return ss;
    } catch (e) {
      // If can't open, clear the property and create new one
      Logger.log('Could not open spreadsheet, creating new one...');
      props.deleteProperty('SPREADSHEET_ID');
      return getSpreadsheet(); // Recursive call to create new one
    }
    
  } catch (error) {
    Logger.log('Error in getSpreadsheet: ' + error.message);
    Logger.log(error.stack);
    throw new Error('Failed to access database: ' + error.message);
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
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet) {
      ss.deleteSheet(defaultSheet);
    }
    
    // Create or get Projects sheet
    let projectsSheet = ss.getSheetByName('Projects');
    if (!projectsSheet) {
      projectsSheet = ss.insertSheet('Projects');
    }
    
    // Clear and set headers
    projectsSheet.clear();
    projectsSheet.getRange('A1:H1').setValues([[
      'ProjectID', 'ProjectName', 'Description', 'CreatedDate', 
      'FolderURL', 'DocURL', 'SlidesURL', 'CalendarID'
    ]]).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    projectsSheet.setFrozenRows(1);
    
    // Create or get Tasks sheet
    let tasksSheet = ss.getSheetByName('Tasks');
    if (!tasksSheet) {
      tasksSheet = ss.insertSheet('Tasks');
    }
    
    // Clear and set headers
    tasksSheet.clear();
    tasksSheet.getRange('A1:J1').setValues([[
      'TaskID', 'ProjectID', 'Title', 'Description', 'AssignedTo', 
      'Priority', 'Status', 'DueDate', 'CreatedDate', 'EventID'
    ]]).setFontWeight('bold').setBackground('#34a853').setFontColor('#ffffff');
    tasksSheet.setFrozenRows(1);
    
    // Create or get Team sheet
    let teamSheet = ss.getSheetByName('Team');
    if (!teamSheet) {
      teamSheet = ss.insertSheet('Team');
    }
    
    // Clear and set headers
    teamSheet.clear();
    teamSheet.getRange('A1:D1').setValues([[
      'MemberID', 'ProjectID', 'Name', 'Email'
    ]]).setFontWeight('bold').setBackground('#fbbc04').setFontColor('#ffffff');
    teamSheet.setFrozenRows(1);
    
    Logger.log('Sheets initialized successfully');
  } catch (error) {
    Logger.log('Error in initializeSheets: ' + error.message);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * Manual function to reset the database (for testing)
 * Run this from the script editor if you need to start fresh
 */
function resetDatabase() {
  try {
    const props = PropertiesService.getScriptProperties();
    const ssId = props.getProperty('SPREADSHEET_ID');
    
    if (ssId) {
      const ss = SpreadsheetApp.openById(ssId);
      initializeSheets(ss);
      Logger.log('Database reset successfully');
      return { success: true, message: 'Database reset successfully' };
    } else {
      Logger.log('No database found, creating new one');
      getSpreadsheet();
      return { success: true, message: 'New database created' };
    }
  } catch (error) {
    Logger.log('Error in resetDatabase: ' + error.message);
    return { success: false, message: error.message };
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
    
    if (!projectsSheet || !teamSheet) {
      throw new Error('Database sheets not found. Please try again.');
    }
    
    // Generate unique project ID
    const projectId = 'PROJ-' + new Date().getTime();
    const createdDate = new Date();
    
    // Create Google Drive folder
    const folderName = '[Project] ' + projectData.projectName;
    const folder = DriveApp.createFolder(folderName);
    const folderUrl = folder.getUrl();
    
    // Create Google Doc
    const doc = DocumentApp.create(projectData.projectName + ' - Report');
    const docFile = DriveApp.getFileById(doc.getId());
    folder.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
    const docUrl = doc.getUrl();
    
    // Create Google Slides
    const slides = SlidesApp.create(projectData.projectName + ' - Presentation');
    const slidesFile = DriveApp.getFileById(slides.getId());
    folder.addFile(slidesFile);
    DriveApp.getRootFolder().removeFile(slidesFile);
    const slidesUrl = slides.getUrl();
    
    // Create Google Calendar
    const calendar = CalendarApp.createCalendar(folderName);
    const calendarId = calendar.getId();
    
    // Share with team members
    projectData.teamMembers.forEach(function(member) {
      try {
        // Share folder
        folder.addEditor(member.email);
        
        // Share calendar
        calendar.addGuest(member.email);
      } catch (e) {
        Logger.log('Could not share with: ' + member.email + ' - ' + e.message);
      }
      
      // Add to team sheet
      const memberId = 'MEM-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
      teamSheet.appendRow([memberId, projectId, member.name, member.email]);
    });
    
    // Add project to sheet
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
    
    Logger.log('Project created successfully: ' + projectId);
    
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
    Logger.log(error.stack);
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
    
    if (!projectsSheet || !teamSheet) {
      throw new Error('Database sheets not found');
    }
    
    // Check if there are any projects
    if (projectsSheet.getLastRow() < 2) {
      return {
        success: true,
        projects: []
      };
    }
    
    const userEmail = Session.getActiveUser().getEmail();
    Logger.log('Getting projects for user: ' + userEmail);
    
    // Get all projects where user is a team member
    const teamData = teamSheet.getDataRange().getValues();
    const userProjectIds = [];
    
    for (let i = 1; i < teamData.length; i++) {
      if (teamData[i][3] === userEmail) {
        userProjectIds.push(teamData[i][1]);
      }
    }
    
    Logger.log('User is in ' + userProjectIds.length + ' projects');
    
    // Get project details
    const projectData = projectsSheet.getDataRange().getValues();
    const projects = [];
    
    for (let i = 1; i < projectData.length; i++) {
      const projectId = projectData[i][0];
      if (userProjectIds.indexOf(projectId) > -1) {
        projects.push({
          projectId: projectId,
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
    
    Logger.log('Returning ' + projects.length + ' projects');
    
    return {
      success: true,
      projects: projects
    };
    
  } catch (error) {
    Logger.log('Error in getProjects: ' + error.message);
    Logger.log(error.stack);
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
    
    // Get project info
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
    
    // Get tasks
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
    
    // Get team members
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
    Logger.log(error.stack);
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
    Logger.log('Creating task: ' + JSON.stringify(taskData));
    
    const ss = getSpreadsheet();
    const tasksSheet = ss.getSheetByName('Tasks');
    const projectsSheet = ss.getSheetByName('Projects');
    
    // Generate task ID
    const taskId = 'TASK-' + new Date().getTime();
    const createdDate = new Date();
    
    // Get project calendar ID
    const projectData = projectsSheet.getDataRange().getValues();
    let calendarId = null;
    
    for (let i = 1; i < projectData.length; i++) {
      if (projectData[i][0] === taskData.projectId) {
        calendarId = projectData[i][7];
        break;
      }
    }
    
    // Create calendar event if due date is set
    let eventId = null;
    if (calendarId && taskData.dueDate) {
      try {
        const calendar = CalendarApp.getCalendarById(calendarId);
        const dueDate = new Date(taskData.dueDate);
        
        const event = calendar.createEvent(
          '[' + taskData.priority + '] ' + taskData.title,
          dueDate,
          new Date(dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
          {
            description: taskData.description + '\n\nAssigned to: ' + taskData.assignedTo
          }
        );
        
        eventId = event.getId();
      } catch (e) {
        Logger.log('Could not create calendar event: ' + e.message);
      }
    }
    
    // Add task to sheet
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
    Logger.log(error.stack);
    return {
      success: false,
      message: 'Failed to create task: ' + error.message
    };
  }
}

/**
 * Updates task status
 * @param {string} taskId - Task ID
 * @param {string} newStatus - New status ('To Do', 'In Progress', 'Done')
 * @returns {Object} Result with status
 */
function updateTaskStatus(taskId, newStatus) {
  try {
    const ss = getSpreadsheet();
    const tasksSheet = ss.getSheetByName('Tasks');
    const data = tasksSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === taskId) {
        // Update status
        tasksSheet.getRange(i + 1, 7).setValue(newStatus);
        
        // Update calendar event
        const projectsSheet = ss.getSheetByName('Projects');
        const projectData = projectsSheet.getDataRange().getValues();
        
        for (let j = 1; j < projectData.length; j++) {
          if (projectData[j][0] === data[i][1]) { // Match project ID
            const calendarId = projectData[j][7];
            const eventId = data[i][9];
            
            if (calendarId && eventId) {
              try {
                const calendar = CalendarApp.getCalendarById(calendarId);
                const event = calendar.getEventById(eventId);
                
                if (event) {
                  let title = event.getTitle();
                  
                  // Remove existing status prefixes
                  title = title.replace(/^✅ /, '').replace(/^🔄 /, '');
                  
                  // Add new status prefix
                  if (newStatus === 'Done') {
                    title = '✅ ' + title;
                  } else if (newStatus === 'In Progress') {
                    title = '🔄 ' + title;
                  }
                  
                  event.setTitle(title);
                }
              } catch (e) {
                Logger.log('Could not update calendar event: ' + e.message);
              }
            }
            break;
          }
        }
        
        return {
          success: true,
          message: 'Task status updated!'
        };
      }
    }
    
    throw new Error('Task not found');
    
  } catch (error) {
    Logger.log('Error in updateTaskStatus: ' + error.message);
    Logger.log(error.stack);
    return {
      success: false,
      message: 'Failed to update task: ' + error.message
    };
  }
}

/**
 * Sends deadline reminders for tasks due soon
 * This should be run on a daily trigger
 */
function sendDeadlineReminders() {
  try {
    const ss = getSpreadsheet();
    const tasksSheet = ss.getSheetByName('Tasks');
    const teamSheet = ss.getSheetByName('Team');
    const projectsSheet = ss.getSheetByName('Projects');
    
    if (tasksSheet.getLastRow() < 2) {
      Logger.log('No tasks to check');
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskData = tasksSheet.getDataRange().getValues();
    
    for (let i = 1; i < taskData.length; i++) {
      const status = taskData[i][6];
      const dueDate = taskData[i][7];
      
      if (status !== 'Done' && dueDate) {
        const taskDue = new Date(dueDate);
        taskDue.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.ceil((taskDue - today) / (1000 * 60 * 60 * 24));
        
        // Send reminder if due in 2 days or less
        if (daysDiff >= 0 && daysDiff <= 2) {
          const assignedTo = taskData[i][4];
          const taskTitle = taskData[i][2];
          const projectId = taskData[i][1];
          
          // Find assignee email
          const teamData = teamSheet.getDataRange().getValues();
          let assigneeEmail = null;
          
          for (let j = 1; j < teamData.length; j++) {
            if (teamData[j][1] === projectId && teamData[j][2] === assignedTo) {
              assigneeEmail = teamData[j][3];
              break;
            }
          }
          
          if (assigneeEmail) {
            // Get project name
            const projectData = projectsSheet.getDataRange().getValues();
            let projectName = 'Your Project';
            
            for (let k = 1; k < projectData.length; k++) {
              if (projectData[k][0] === projectId) {
                projectName = projectData[k][1];
                break;
              }
            }
            
            const subject = '⏰ Task Due Soon: ' + taskTitle;
            const body = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4285f4;">Task Reminder</h2>
                <p>Hi ${assignedTo},</p>
                <p>This is a reminder that your task is due soon:</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">${taskTitle}</h3>
                  <p><strong>Project:</strong> ${projectName}</p>
                  <p><strong>Due Date:</strong> ${taskDue.toLocaleDateString()}</p>
                  <p><strong>Days Remaining:</strong> ${daysDiff} day${daysDiff !== 1 ? 's' : ''}</p>
                </div>
                <p>Please make sure to complete it on time!</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  Sent by Student Project Hub
                </p>
              </div>
            `;
            
            try {
              GmailApp.sendEmail(assigneeEmail, subject, '', { htmlBody: body });
              Logger.log('Reminder sent to ' + assigneeEmail + ' for task: ' + taskTitle);
            } catch (e) {
              Logger.log('Failed to send reminder to ' + assigneeEmail + ': ' + e.message);
            }
          }
        }
      }
    }
    
    Logger.log('Deadline reminders sent successfully');
    
  } catch (error) {
    Logger.log('Error in sendDeadlineReminders: ' + error.message);
    Logger.log(error.stack);
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
 * Run this from the script editor to test
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