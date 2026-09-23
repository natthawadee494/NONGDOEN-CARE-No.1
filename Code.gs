const SPREADSHEET_ID = '1wbf2S3Dlop3yPOQwuwtknXy_lleuWa7nvIUxS9OD6hs';
const STATE_SHEET = 'AppState';
const ACTIVITY_SHEET = 'ActivityLog';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

const SCHEMAS = {
  Users: [
    'UserId','Role','Login','Email','Prefix','FirstName','LastName',
    'Nickname','Room','Number','Phone','Bio','EXP','AvatarUrl','AvatarSize','ThemeColor'
  ],
  Students: [
    'StudentId','Prefix','FirstName','LastName','Nickname','Room','Number',
    'Phone','Email','Status','EXP','AvatarUrl','Notes'
  ],
  Assignments: [
    'AssignmentId','Room','Title','Subject','Description','DueDate','EvalType',
    'MaxScore','ImageUrl','TeacherId','CreatedAt','Status'
  ],
  Submissions: [
    'SubmissionId','AssignmentId','StudentId','StudentName','Room',
    'SubmittedAt','Status','Score','Note','Feedback','ImageUrl'
  ],
  Attendance: [
    'AttendanceId','Date','StudentId','Room','Status','UpdatedAt','UpdatedBy'
  ],
  Subjects: ['SubjectId','Name','GroupName'],
};

function setupNSWCare() {
  const ss = getSpreadsheet();

  getOrCreateSheet(ss, STATE_SHEET, ['StateId','UpdatedAt','Json']);
  getOrCreateSheet(ss, ACTIVITY_SHEET, ['Timestamp','Action','UserId','Role','Name','Details']);

  Object.keys(SCHEMAS).forEach(function(name) {
    getOrCreateSheet(ss, name, SCHEMAS[name]);
  });

  return {
    success: true,
    message: 'NSW CARE Sheets are ready',
    spreadsheetId: SPREADSHEET_ID,
    sheets: ss.getSheets().map(function(sheet) { return sheet.getName(); })
  };
}

function testNSWCareWrite() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, STATE_SHEET, ['StateId','UpdatedAt','Json']);
  const now = new Date();

  sheet.getRange(2, 1, 1, 3).setValues([[
    'test',
    now,
    JSON.stringify({ test: true, message: 'NSW CARE autosave connection OK' })
  ]]);

  SpreadsheetApp.flush();

  return {
    success: true,
    message: 'Test data written to AppState',
    time: now.toISOString()
  };
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';

  if (action === 'getState') {
    return respond(getSavedState(), e);
  }

  if (action === 'ping') {
    return respond({
      success: true,
      message: 'NSW CARE API is working',
      time: new Date().toISOString(),
    }, e);
  }

  if (action === 'assignments') {
    const state = getSavedState();
    return respond({
      success: true,
      count: state.exists && state.data && state.data.assignments
        ? state.data.assignments.length : 0,
      data: state.exists && state.data ? state.data.assignments || [] : [],
    }, e);
  }

  return respond({
    success: false,
    error: 'Unknown action',
  }, e);
}

function doPost(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';
    const payloadText = e && e.parameter ? e.parameter.payload : '';

    if (action === 'saveState') {
      if (!payloadText) throw new Error('Missing payload');

      const state = JSON.parse(payloadText);
      saveState(state);

      return respond({
        success: true,
        message: 'NSW CARE data saved',
        updatedAt: new Date().toISOString(),
      }, e);
    }

    if (action === 'logEvent') {
      if (!payloadText) throw new Error('Missing payload');

      const event = JSON.parse(payloadText);
      appendActivity(event);

      return respond({
        success: true,
        message: 'Event logged',
      }, e);
    }

    return respond({
      success: false,
      error: 'Unknown POST action',
    }, e);

  } catch (error) {
    return respond({
      success: false,
      error: String(error && error.message ? error.message : error),
    }, e);
  }
}

function getSavedState() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(STATE_SHEET);

  if (!sheet || sheet.getLastRow() < 2) {
    return {
      success: true,
      exists: false,
      data: null,
    };
  }

  const json = sheet.getRange(2, 3).getValue();

  if (!json) {
    return {
      success: true,
      exists: false,
      data: null,
    };
  }

  try {
    return {
      success: true,
      exists: true,
      data: JSON.parse(json),
      updatedAt: sheet.getRange(2, 2).getDisplayValue(),
    };
  } catch (error) {
    return {
      success: false,
      exists: false,
      error: 'AppState JSON is invalid',
    };
  }
}

function saveState(state) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = getSpreadsheet();
    const updatedAt = new Date();

    writeStateSheet(ss, state, updatedAt);

    writeUsers(ss, state.users || []);
    writeStudents(ss, state.students || []);
    writeAssignments(ss, state.assignments || []);
    writeSubmissions(ss, state.submissions || []);
    writeAttendance(ss, state.attendance || []);
    writeSubjects(ss, state.subjects || []);

  } finally {
    lock.releaseLock();
  }
}

function writeStateSheet(ss, state, updatedAt) {
  const sheet = getOrCreateSheet(ss, STATE_SHEET, [
    'StateId','UpdatedAt','Json'
  ]);

  const json = JSON.stringify(state);

  sheet.getRange(2, 1, 1, 3).setValues([[
    'main',
    updatedAt,
    json
  ]]);

  sheet.getRange(2, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

function writeUsers(ss, users) {
  const rows = users.map(function(u) {
    return [
      u.id || '',
      u.role || '',
      u.login || '',
      u.email || '',
      u.prefix || '',
      u.firstName || '',
      u.lastName || '',
      u.nickname || '',
      u.room || '',
      u.number || '',
      u.phone || '',
      u.bio || '',
      u.exp == null ? '' : u.exp,
      u.avatarUrl || '',
      u.avatarSize || '',
      u.themeColor || '',
    ];
  });

  replaceTable(ss, 'Users', SCHEMAS.Users, rows);
}

function writeStudents(ss, students) {
  const rows = students.map(function(s) {
    return [
      s.id || '',
      s.prefix || '',
      s.firstName || '',
      s.lastName || '',
      s.nickname || '',
      s.room || '',
      s.number || '',
      s.phone || '',
      s.email || '',
      s.status || '',
      s.exp == null ? '' : s.exp,
      s.avatarUrl || '',
      s.notes || '',
    ];
  });

  replaceTable(ss, 'Students', SCHEMAS.Students, rows);
}

function writeAssignments(ss, assignments) {
  const rows = assignments.map(function(a) {
    return [
      a.id || '',
      a.room || '',
      a.title || '',
      a.subject || '',
      a.description || '',
      a.dueDate || '',
      a.evalType || '',
      a.maxScore == null ? '' : a.maxScore,
      a.imageUrl || '',
      a.teacherId || '',
      a.createdAt || '',
      a.status || '',
    ];
  });

  replaceTable(ss, 'Assignments', SCHEMAS.Assignments, rows);
}

function writeSubmissions(ss, submissions) {
  const rows = submissions.map(function(s) {
    return [
      s.id || '',
      s.assignmentId || '',
      s.studentId || '',
      s.studentName || '',
      s.room || '',
      s.submittedAt || '',
      s.status || '',
      s.score == null ? '' : s.score,
      s.note || '',
      s.feedback || '',
      s.imageUrl || s.fileUrl || '',
    ];
  });

  replaceTable(ss, 'Submissions', SCHEMAS.Submissions, rows);
}

function writeAttendance(ss, attendance) {
  const rows = attendance.map(function(a) {
    return [
      a.id || '',
      a.date || '',
      a.studentId || '',
      a.room || '',
      a.status || '',
      a.updatedAt || '',
      a.updatedBy || '',
    ];
  });

  replaceTable(ss, 'Attendance', SCHEMAS.Attendance, rows);
}

function writeSubjects(ss, subjects) {
  const rows = subjects.map(function(s) {
    return [
      s.id || '',
      s.name || '',
      s.groupName || '',
    ];
  });

  replaceTable(ss, 'Subjects', SCHEMAS.Subjects, rows);
}

function replaceTable(ss, name, headers, rows) {
  const sheet = getOrCreateSheet(ss, name, headers);

  const totalRows = Math.max(sheet.getLastRow(), 1);
  const totalCols = headers.length;

  if (totalRows > 1) {
    sheet.getRange(2, 1, totalRows - 1, totalCols).clearContent();
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, totalCols).setValues(rows);
  }

  sheet.setFrozenRows(1);
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const same = headers.every(function(h, i) {
    return existing[i] === h;
  });

  if (!same) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function appendActivity(event) {
  const ss = getSpreadsheet();

  const sheet = getOrCreateSheet(ss, ACTIVITY_SHEET, [
    'Timestamp','Action','UserId','Role','Name','Details'
  ]);

  sheet.appendRow([
    event.timestamp || new Date().toISOString(),
    event.action || '',
    event.userId || '',
    event.role || '',
    event.name || '',
    JSON.stringify(event.details || {}),
  ]);
}

function respond(data, e) {
  const json = JSON.stringify(data);
  const callback = e && e.parameter ? e.parameter.callback : '';

  if (callback) {
    const safeCallback = String(callback).replace(/[^\w.$]/g, '');
    return ContentService
      .createTextOutput(safeCallback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
