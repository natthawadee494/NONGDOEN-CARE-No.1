/*************************************************
 * NSW CARE — GOOGLE APPS SCRIPT API
 * ใช้เชื่อมเว็บไซต์กับ Google Sheets
 *************************************************/

const SCHEMAS = {
  Assignments: [
    'AssignmentId',
    'Room',
    'Title',
    'Subject',
    'Description',
    'DueDate',
    'EvalType',
    'MaxScore',
    'ImageUrl',
    'TeacherId',
    'CreatedAt'
  ],

  AppState: [
    'Key',
    'UpdatedAt',
    'Data'
  ],

  ActivityLog: [
    'Time',
    'Action',
    'UserId',
    'Role',
    'Data'
  ],

  Users: [
    'UserId',
    'Role',
    'Login',
    'Email',
    'Prefix',
    'FirstName',
    'LastName',
    'Nickname',
    'Room',
    'Number',
    'Phone',
    'Bio',
    'EXP',
    'AvatarUrl',
    'AvatarSize',
    'ThemeColor',
    'PasswordHash'
  ],

  Students: [
    'StudentId',
    'UserId',
    'Prefix',
    'FirstName',
    'LastName',
    'Nickname',
    'Room',
    'Number',
    'AvatarUrl',
    'EXP'
  ],

  Submissions: [
    'SubmissionId',
    'AssignmentId',
    'StudentId',
    'SubmittedAt',
    'FileUrl',
    'Link',
    'Score',
    'Comment',
    'Status'
  ],

  Attendance: [
    'AttendanceId',
    'StudentId',
    'Room',
    'Date',
    'Status',
    'Note'
  ],

  Subjects: [
    'SubjectId',
    'Name',
    'TeacherId',
    'Room'
  ],

  LineChats: [
    'ChatId',
    'Type',
    'Name',
    'LastSeenAt'
  ],

  DeletedRecords: [
    'RecordType',
    'RecordId',
    'DeletedAt'
  ]
};


/*************************************************
 * SPREADSHEET
 *************************************************/

const SPREADSHEET_ID = '1wbf2S3Dlop3yPOQwuwtknXy_lleuWa7nvIUxS9OD6hs';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}


/*************************************************
 * GET /exec
 *************************************************/

function doGet(e) {
  try {
    const action =
      e &&
      e.parameter &&
      e.parameter.action
        ? String(e.parameter.action)
        : 'ping';

    let result;

    switch (action) {

      case 'ping':
        result = {
          success: true,
          message: 'NSW CARE API is working',
          time: new Date().toISOString()
        };
        break;

      case 'getState':
        result = {
          success: true,
          data: getSavedState()
        };
        break;

      case 'getUsers':
        result = {
          success: true,
          data: readUsers()
        };
        break;

      case 'assignments':
        result = {
          success: true,
          data: readAssignments()
        };
        break;

      case 'getLineChats':
        result = {
          success: true,
          data: readLineChats()
        };
        break;

      default:
        result = {
          success: false,
          message: 'Unknown action: ' + action
        };
    }

    return jsonOutput(result);

  } catch (error) {
    return jsonOutput({
      success: false,
      message: error.message
    });
  }
}


/*************************************************
 * POST /exec
 *************************************************/

function doPost(e) {
  try {

    const action =
      e &&
      e.parameter &&
      e.parameter.action
        ? String(e.parameter.action)
        : '';

    const payloadText =
      e &&
      e.parameter &&
      e.parameter.payload
        ? String(e.parameter.payload)
        : '';

    let payload = {};

    if (payloadText) {
      try {
        payload = JSON.parse(payloadText);
      } catch (err) {
        payload = {};
      }
    }

    let result;

    switch (action) {

      case 'saveState':
        saveState(payload);

        result = {
          success: true,
          message: 'State saved'
        };
        break;


      case 'registerUser':
        registerUser(payload);

        result = {
          success: true,
          message: 'User registered',
          userId: payload.id || ''
        };
        break;


      case 'logEvent':
        logEvent(
          payload.action || 'UNKNOWN',
          payload.user || payload.userId || '',
          payload.data || {}
        );

        result = {
          success: true,
          message: 'Event logged'
        };
        break;

      case 'loginUser':
        result = loginUser(payload.email, payload.password);
        break;

      case 'saveLineChat':
        saveLineChat(payload);
        result = { success: true, message: 'LINE chat saved' };
        break;


      default:
        result = {
          success: false,
          message: 'Unknown POST action: ' + action
        };
    }

    return jsonOutput(result);

  } catch (error) {

    return jsonOutput({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
}


/*************************************************
 * JSON RESPONSE
 *************************************************/

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/*************************************************
 * CREATE SHEETS
 *************************************************/

function getOrCreateSheet(ss, name, headers) {

  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);

    sheet.setFrozenRows(1);

  } else {

    const existingHeaders =
      sheet
        .getRange(
          1,
          1,
          1,
          Math.max(sheet.getLastColumn(), headers.length)
        )
        .getValues()[0];

    let changed = false;

    headers.forEach(function(header, index) {

      if (existingHeaders[index] !== header) {
        sheet
          .getRange(1, index + 1)
          .setValue(header);

        changed = true;
      }

    });

    if (changed) {
      SpreadsheetApp.flush();
    }
  }

  return sheet;
}


/*************************************************
 * SAVE APP STATE
 *************************************************/

function saveState(state) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const incoming = state || {};

    // Keep deletions permanent across accounts. A stale browser may still
    // contain an item that another account already deleted; tombstones prevent
    // that stale item from being written back into Sheets.
    rememberMissingRecords_(incoming);
    const cleanState = applyDeletionTombstones_(incoming);

    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, 'AppState', SCHEMAS.AppState);

    writeStateSheet(sheet, cleanState);
    syncStateTables(cleanState);

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}


function writeStateSheet(sheet, state) {

  const json =
    JSON.stringify(state || {});

  /*
   * Google Sheets cell limit is large,
   * but we split the JSON anyway so that
   * large avatar/base64 images don't break
   * the entire save operation.
   */

  const chunkSize = 40000;

  const chunks = [];

  for (
    let i = 0;
    i < json.length;
    i += chunkSize
  ) {
    chunks.push(
      json.substring(i, i + chunkSize)
    );
  }

  if (chunks.length === 0) {
    chunks.push('');
  }

  /*
   * Clear old data
   */

  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        3
      )
      .clearContent();
  }

  const now =
    new Date();

  const rows =
    chunks.map(function(chunk, index) {

      return [
        'state_' + index,
        now,
        chunk
      ];

    });

  sheet
    .getRange(
      2,
      1,
      rows.length,
      3
    )
    .setValues(rows);

  SpreadsheetApp.flush();
}


/*************************************************
 * LOAD APP STATE
 *************************************************/

function getSavedState() {

  const ss =
    getSpreadsheet();

  const sheet =
    ss.getSheetByName('AppState');

  if (
    !sheet ||
    sheet.getLastRow() < 2
  ) {
    return null;
  }

  const rows =
    sheet
      .getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        3
      )
      .getValues();

  const chunks =
    rows
      .filter(function(row) {
        return String(row[2] || '') !== '';
      })
      .sort(function(a, b) {

        const aIndex =
          Number(
            String(a[0]).replace('state_', '')
          );

        const bIndex =
          Number(
            String(b[0]).replace('state_', '')
          );

        return aIndex - bIndex;
      })
      .map(function(row) {
        return String(row[2] || '');
      });

  if (!chunks.length) {
    return null;
  }

  const json =
    chunks.join('');

  try {
    return JSON.parse(json);

  } catch (error) {

    console.error(
      'Cannot parse AppState:',
      error
    );

    return null;
  }
}


/*************************************************
 * USERS
 *************************************************/

function registerUser(user) {
  if (!user) throw new Error('User data is missing');
  const lock=LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss=getSpreadsheet();
    const sheet=getOrCreateSheet(ss,'Users',SCHEMAS.Users);
    const email=String(user.email || '').trim().toLowerCase();
    if(!email) throw new Error('Email is required');
    const lastRow=sheet.getLastRow();
    const values=lastRow>=2 ? sheet.getRange(2,1,lastRow-1,SCHEMAS.Users.length).getValues() : [];
    let existingIndex=-1, existingPasswordHash='';
    for(let i=0;i<values.length;i++){
      const rowEmail=String(values[i][3] || '').trim().toLowerCase();
      const rowId=String(values[i][0] || '');
      if((user.id && rowId===String(user.id)) || rowEmail===email){
        existingIndex=i; existingPasswordHash=String(values[i][16] || ''); break;
      }
    }
    if(existingIndex>=0 && String(values[existingIndex][3] || '').trim().toLowerCase()===email && user.id && String(values[existingIndex][0] || '')!==String(user.id) && user.password) {
      throw new Error('อีเมลนี้มีบัญชีอยู่แล้ว');
    }
    const passwordHash=user.passwordHash || (user.password ? hashPassword_(user.password) : '') || existingPasswordHash;
    const row=[
      user.id || (existingIndex>=0 ? values[existingIndex][0] : 'usr-'+Date.now()),
      user.role || 'student', user.login || email, email,
      user.prefix || '', user.firstName || '', user.lastName || '', user.nickname || '',
      user.room || '', user.number==null ? '' : user.number, user.phone || '', user.bio || '',
      user.exp==null ? '' : user.exp, user.avatarUrl || '', user.avatarSize==null ? '' : user.avatarSize,
      user.themeColor || '', passwordHash
    ];
    if(existingIndex>=0) sheet.getRange(existingIndex+2,1,1,row.length).setValues([row]);
    else sheet.getRange(sheet.getLastRow()+1,1,1,row.length).setValues([row]);
    SpreadsheetApp.flush();
    return {success:true,message:'User registered',userId:row[0]};
  } finally { lock.releaseLock(); }
}

/*************************************************
 * READ USERS
 *************************************************/

function readUsers() {

  const ss =
    getSpreadsheet();

  const sheet =
    ss.getSheetByName('Users');

  if (
    !sheet ||
    sheet.getLastRow() < 2
  ) {
    return [];
  }

  const width =
    SCHEMAS.Users.length;

  const values =
    sheet
      .getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        width
      )
      .getValues();

  return values

    .filter(function(row) {

      return row.some(function(value) {

        return String(
          value || ''
        ).trim() !== '';

      });

    })

    .map(function(row) {

      return {

        id:
          String(row[0] || ''),

        role:
          row[1] || 'student',

        login:
          row[2] || undefined,

        email:
          row[3] || undefined,

        prefix:
          row[4] || '',

        firstName:
          row[5] || '',

        lastName:
          row[6] || '',

        nickname:
          row[7] || undefined,

        room:
          row[8] || undefined,

        number:
          row[9] === ''
            ? undefined
            : Number(row[9]),

        phone:
          row[10] || undefined,

        bio:
          row[11] || undefined,

        exp:
          row[12] === ''
            ? undefined
            : Number(row[12]),

        avatarUrl:
          row[13] || undefined,

        avatarSize:
          row[14] === ''
            ? undefined
            : Number(row[14]),

        themeColor:
          row[15] || undefined,

        // PasswordHash is intentionally not returned to the public website.
        passwordHash: undefined

      };

    });
}


/*************************************************
 * ASSIGNMENTS
 *************************************************/

function readAssignments() {

  const ss =
    getSpreadsheet();

  const sheet =
    ss.getSheetByName(
      'Assignments'
    );

  if (
    !sheet ||
    sheet.getLastRow() < 2
  ) {
    return [];
  }

  const width =
    SCHEMAS.Assignments.length;

  const values =
    sheet
      .getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        width
      )
      .getValues();

  return values

    .filter(function(row) {

      return row.some(function(value) {

        return String(
          value || ''
        ).trim() !== '';

      });

    })

    .map(function(row) {

      return {

        AssignmentId: row[0],

        Room: row[1],

        Title: row[2],

        Subject: row[3],

        Description: row[4],

        DueDate: row[5],

        EvalType: row[6],

        MaxScore: row[7],

        ImageUrl: row[8],

        TeacherId: row[9],

        CreatedAt: row[10]

      };

    });
}


/*************************************************
 * ACTIVITY LOG
 *************************************************/

function logEvent(
  action,
  user,
  data
) {

  const ss =
    getSpreadsheet();

  const sheet =
    getOrCreateSheet(
      ss,
      'ActivityLog',
      SCHEMAS.ActivityLog
    );


  let userId = '';
  let role = '';

  if (
    user &&
    typeof user === 'object'
  ) {

    userId =
      user.id ||
      user.userId ||
      '';

    role =
      user.role ||
      '';

  } else {

    userId =
      String(user || '');

  }


  sheet
    .getRange(
      sheet.getLastRow() + 1,
      1,
      1,
      5
    )
    .setValues([

      [
        new Date(),
        action || '',
        userId,
        role,
        JSON.stringify(
          data || {}
        )
      ]

    ]);

  SpreadsheetApp.flush();
}


/*************************************************
 * TEST WRITE
 *************************************************/

function testWrite() {

  const ss =
    getSpreadsheet();

  const sheet =
    getOrCreateSheet(
      ss,
      'AppState',
      SCHEMAS.AppState
    );

  sheet
    .getRange(
      sheet.getLastRow() + 1,
      1,
      1,
      3
    )
    .setValues([

      [
        'test',
        new Date(),
        JSON.stringify({
          test: true,
          message:
            'NSW CARE autosave connection OK'
        })
      ]

    ]);

  SpreadsheetApp.flush();

  Logger.log(
    'NSW CARE testWrite completed'
  );
}


/*************************************************
 * SETUP SHEETS
 *************************************************/

function setupSheets() {

  const ss =
    getSpreadsheet();

  Object.keys(SCHEMAS)
    .forEach(function(name) {

      getOrCreateSheet(
        ss,
        name,
        SCHEMAS[name]
      );

    });

  SpreadsheetApp.flush();

  Logger.log(
    'NSW CARE sheets setup completed'
  );
}

/*************************************************
 * STATE -> NORMALIZED SHEETS
 *************************************************/

function replaceDataSheet(name, headers, rows) {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, name, headers);

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
  }

  if (!rows.length) return;

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

/*************************************************
 * PERMANENT DELETION TOMBSTONES
 *
 * A full-state sync can otherwise resurrect deleted records when
 * another account still has an older browser snapshot. This sheet
 * remembers deleted IDs and filters them from every later save.
 *************************************************/

const TOMBSTONE_TYPES = [
  'Students',
  'Assignments',
  'Submissions',
  'Attendance',
  'Subjects'
];

function getRecordId_(type, item) {
  if (!item) return '';
  if (type === 'Students') return String(item.id || '');
  if (type === 'Assignments') return String(item.id || '');
  if (type === 'Submissions') return String(item.id || '');
  if (type === 'Attendance') return String(item.id || '');
  if (type === 'Subjects') return String(item.id || '');
  return '';
}

function getDeletedRecordKey_(type, id) {
  return String(type) + '::' + String(id);
}

function getDeletedRecordMap_() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'DeletedRecords', SCHEMAS.DeletedRecords);
  const map = {};
  if (sheet.getLastRow() < 2) return map;

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  rows.forEach(function(row) {
    const type = String(row[0] || '');
    const id = String(row[1] || '');
    if (type && id) {
      map[getDeletedRecordKey_(type, id)] = true;
    }
  });
  return map;
}

function getExistingRecordIds_(type) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(type);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return rows
    .map(function(row) { return String(row[0] || '').trim(); })
    .filter(Boolean);
}

function rememberMissingRecords_(state) {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'DeletedRecords', SCHEMAS.DeletedRecords);
  const existingTombstones = getDeletedRecordMap_();
  const additions = [];

  const collections = {
    Students: Array.isArray(state.students) ? state.students : [],
    Assignments: Array.isArray(state.assignments) ? state.assignments : [],
    Submissions: Array.isArray(state.submissions) ? state.submissions : [],
    Attendance: Array.isArray(state.attendance) ? state.attendance : [],
    Subjects: Array.isArray(state.subjects) ? state.subjects : []
  };

  Object.keys(collections).forEach(function(type) {
    const incomingIds = {};
    collections[type].forEach(function(item) {
      const id = getRecordId_(type, item);
      if (id) incomingIds[id] = true;
    });

    getExistingRecordIds_(type).forEach(function(existingId) {
      const key = getDeletedRecordKey_(type, existingId);
      if (!incomingIds[existingId] && !existingTombstones[key]) {
        additions.push([type, existingId, new Date()]);
        existingTombstones[key] = true;
      }
    });
  });

  if (additions.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, 3).setValues(additions);
  }
}

function applyDeletionTombstones_(state) {
  const deleted = getDeletedRecordMap_();
  const result = Object.assign({}, state);

  result.students = (state.students || []).filter(function(item) {
    return !deleted[getDeletedRecordKey_('Students', getRecordId_('Students', item))];
  });

  result.assignments = (state.assignments || []).filter(function(item) {
    return !deleted[getDeletedRecordKey_('Assignments', getRecordId_('Assignments', item))];
  });

  const studentIds = {};
  result.students.forEach(function(item) { studentIds[String(item.id || '')] = true; });

  const assignmentIds = {};
  result.assignments.forEach(function(item) { assignmentIds[String(item.id || '')] = true; });

  result.submissions = (state.submissions || []).filter(function(item) {
    const id = getRecordId_('Submissions', item);
    const key = getDeletedRecordKey_('Submissions', id);
    return !deleted[key]
      && studentIds[String(item.studentId || '')]
      && assignmentIds[String(item.assignmentId || '')];
  });

  result.attendance = (state.attendance || []).filter(function(item) {
    const id = getRecordId_('Attendance', item);
    return !deleted[getDeletedRecordKey_('Attendance', id)]
      && studentIds[String(item.studentId || '')];
  });

  result.subjects = (state.subjects || []).filter(function(item) {
    return !deleted[getDeletedRecordKey_('Subjects', getRecordId_('Subjects', item))];
  });

  return result;
}

function syncStateTables(state) {
  const users = Array.isArray(state.users) ? state.users : [];
  const students = Array.isArray(state.students) ? state.students : [];
  const assignments = Array.isArray(state.assignments) ? state.assignments : [];
  const submissions = Array.isArray(state.submissions) ? state.submissions : [];
  const attendance = Array.isArray(state.attendance) ? state.attendance : [];
  const subjects = Array.isArray(state.subjects) ? state.subjects : [];

  replaceDataSheet('Assignments', SCHEMAS.Assignments, assignments.map(a => [
    a.id || '', a.room || '', a.title || '', a.subject || '', a.description || '',
    a.dueDate || '', a.evalType || '', a.maxScore == null ? '' : a.maxScore,
    a.imageUrl || '', a.teacherId || '', a.createdAt || ''
  ]));

  replaceDataSheet('Students', SCHEMAS.Students, students.map(s => [
    s.id || '', s.userId || s.id || '', s.prefix || '', s.firstName || '', s.lastName || '',
    s.nickname || '', s.room || '', s.number == null ? '' : s.number,
    s.avatarUrl || '', s.exp == null ? '' : s.exp
  ]));

  replaceDataSheet('Submissions', SCHEMAS.Submissions, submissions.map(s => [
    s.id || '', s.assignmentId || '', s.studentId || '', s.submittedAt || '',
    s.fileUrl || '', s.link || '', s.score == null ? '' : s.score,
    s.feedback || s.note || '', s.status || ''
  ]));

  replaceDataSheet('Attendance', SCHEMAS.Attendance, attendance.map(a => [
    a.id || '', a.studentId || '', a.room || '', a.date || '', a.status || '', a.note || ''
  ]));

  replaceDataSheet('Subjects', SCHEMAS.Subjects, subjects.map(s => [
    s.id || '', s.name || '', s.teacherId || '', s.room || ''
  ]));

  users.forEach(registerUser);
}

/*************************************************
 * LOGIN
 *************************************************/

function hashPassword_(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function loginUser(email, password) {
  const normalizedEmail=String(email || '').trim().toLowerCase();
  if(!normalizedEmail || !password) return {success:false,message:'กรุณากรอกอีเมลและรหัสผ่าน'};
  const hash=hashPassword_(password);
  const users=readUsersInternal_(true);
  const user=users.find(function(u){return String(u.email || '').trim().toLowerCase()===normalizedEmail;});
  if(!user) return {success:false,message:'ไม่พบอีเมลนี้ในระบบ'};
  if(!user._passwordHash) return {success:false,message:'บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน'};
  if(user._passwordHash!==hash) return {success:false,message:'อีเมลหรือรหัสผ่านไม่ถูกต้อง'};
  delete user._passwordHash;
  return {success:true,user:user};
}

function readUsersInternal_(includePassword) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  if (!sheet || sheet.getLastRow() < 2) return [];

  const width = SCHEMAS.Users.length;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();

  return values.filter(function(row) {
    return row.some(function(value) { return String(value || '').trim() !== ''; });
  }).map(function(row) {
    const user = {
      id: String(row[0] || ''),
      role: row[1] || 'student',
      login: row[2] || undefined,
      email: row[3] || undefined,
      prefix: row[4] || '',
      firstName: row[5] || '',
      lastName: row[6] || '',
      nickname: row[7] || undefined,
      room: row[8] || undefined,
      number: row[9] === '' ? undefined : Number(row[9]),
      phone: row[10] || undefined,
      bio: row[11] || undefined,
      exp: row[12] === '' ? undefined : Number(row[12]),
      avatarUrl: row[13] || undefined,
      avatarSize: row[14] === '' ? undefined : Number(row[14]),
      themeColor: row[15] || undefined
    };
    if (includePassword) user._passwordHash = row[16] || '';
    return user;
  });
}

/*************************************************
 * LINE CHAT DIRECTORY
 *************************************************/

function saveLineChat(chat) {
  if (!chat || !chat.id) throw new Error('LINE chat id is missing');

  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'LineChats', SCHEMAS.LineChats);
  const rows = sheet.getLastRow() >= 2
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, SCHEMAS.LineChats.length).getValues()
    : [];

  const newRow = [
    String(chat.id),
    String(chat.type || 'group'),
    String(chat.name || 'LINE Chat'),
    chat.lastSeenAt || new Date()
  ];

  const index = rows.findIndex(r => String(r[0] || '') === String(chat.id));
  if (index >= 0) {
    sheet.getRange(index + 2, 1, 1, newRow.length).setValues([newRow]);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, newRow.length).setValues([newRow]);
  }
  SpreadsheetApp.flush();
}

function readLineChats() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('LineChats');
  if (!sheet || sheet.getLastRow() < 2) return [];

  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues()
    .filter(r => String(r[0] || '').trim() !== '')
    .map(r => ({
      id: String(r[0]),
      type: String(r[1] || 'group'),
      name: String(r[2] || 'LINE Chat'),
      lastSeenAt: r[3] ? new Date(r[3]).toISOString() : undefined
    }))
    .sort((a,b) => String(b.lastSeenAt || '').localeCompare(String(a.lastSeenAt || '')));
}


/*************************************************
 * ADMIN: SET PASSWORD FOR AN EXISTING ACCOUNT
 * Run manually once from Apps Script editor.
 *************************************************/
function setPasswordForEmail(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) throw new Error('email and password are required');

  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss, 'Users', SCHEMAS.Users);
  if (sheet.getLastRow() < 2) throw new Error('Users sheet is empty');

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, SCHEMAS.Users.length).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][3] || '').trim().toLowerCase() === normalizedEmail) {
      sheet.getRange(i + 2, 17).setValue(hashPassword_(password));
      SpreadsheetApp.flush();
      return 'Password updated for ' + normalizedEmail;
    }
  }
  throw new Error('User email not found: ' + normalizedEmail);
}
