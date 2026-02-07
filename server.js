const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = new sqlite3.Database('pregnancy.db');

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS pregnancy_info (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        due_date DATE NOT NULL,
        conception_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS daily_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        record_date DATE NOT NULL,
        symptoms TEXT,
        mood TEXT,
        weight REAL,
        diet TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS health_monitoring (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        record_date DATE NOT NULL,
        fetal_movement INTEGER,
        blood_pressure TEXT,
        blood_sugar TEXT,
        medication TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        photo_date DATE NOT NULL,
        photo_type TEXT NOT NULL,
        photo_path TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS medical_checkups (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        checkup_date DATE NOT NULL,
        hospital TEXT,
        doctor TEXT,
        checkup_type TEXT,
        results TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        reminder_type TEXT NOT NULL,
        reminder_date DATETIME NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        is_completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS user_relationships (
        id TEXT PRIMARY KEY,
        primary_user_id TEXT NOT NULL,
        related_user_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        can_view INTEGER DEFAULT 1,
        can_edit INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (primary_user_id) REFERENCES users(id),
        FOREIGN KEY (related_user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS ai_suggestions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        suggestion_type TEXT NOT NULL,
        suggestion_content TEXT NOT NULL,
        context_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, () => {
      db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (!row) {
          const adminId = uuidv4();
          db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [adminId, 'admin', 'admin123']);
          console.log('默认管理员账号已创建: admin / admin123');
        }
      });
    });
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const userId = uuidv4();
  db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [userId, username, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(400).json({ error: '用户名已存在' });
      } else {
        res.status(500).json({ error: '注册失败' });
      }
    } else {
      res.json({ userId, username });
    }
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT id, username, password FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      if (row.username === 'admin') {
        res.json({ userId: row.id, username: row.username, isAdmin: true });
      } else {
        res.json({ userId: row.id, username: row.username, isAdmin: false });
      }
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT id, username FROM users WHERE username != ?', ['admin'], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/pregnancy-info', (req, res) => {
  const { userId, dueDate, conceptionDate } = req.body;
  
  if (!userId || !dueDate) {
    return res.status(400).json({ error: '用户ID和预产期不能为空' });
  }

  db.get('SELECT id FROM pregnancy_info WHERE user_id = ?', [userId], (err, existing) => {
    if (existing) {
      db.run('UPDATE pregnancy_info SET due_date = ?, conception_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [dueDate, conceptionDate, userId], (err) => {
        if (err) {
          res.status(500).json({ error: '保存失败' });
        } else {
          res.json({ success: true });
        }
      });
    } else {
      const infoId = uuidv4();
      db.run('INSERT INTO pregnancy_info (id, user_id, due_date, conception_date) VALUES (?, ?, ?, ?)', [infoId, userId, dueDate, conceptionDate], (err) => {
        if (err) {
          res.status(500).json({ error: '保存失败' });
        } else {
          res.json({ success: true });
        }
      });
    }
  });
});

app.get('/api/pregnancy-info/:userId', (req, res) => {
  const { userId } = req.params;
  db.get('SELECT * FROM pregnancy_info WHERE user_id = ?', [userId], (err, row) => {
    if (row) {
      res.json(row);
    } else {
      res.json(null);
    }
  });
});

app.get('/api/pregnancy-weeks/:userId', (req, res) => {
  const { userId } = req.params;
  db.get('SELECT * FROM pregnancy_info WHERE user_id = ?', [userId], (err, info) => {
    if (!info || !info.due_date) {
      return res.json({ error: '请先设置预产期' });
    }

    const dueDate = new Date(info.due_date);
    const today = new Date();
    const conceptionDate = info.conception_date ? new Date(info.conception_date) : new Date(dueDate.getTime() - 280 * 24 * 60 * 60 * 1000);
    
    const totalDays = 280;
    const daysPassed = Math.floor((today - conceptionDate) / (24 * 60 * 60 * 1000));
    const weeks = Math.floor(daysPassed / 7);
    const days = daysPassed % 7;
    const daysRemaining = totalDays - daysPassed;
    const progress = (daysPassed / totalDays) * 100;

    res.json({
      weeks,
      days,
      totalWeeks: 40,
      daysRemaining,
      progress,
      conceptionDate: conceptionDate.toISOString().split('T')[0],
      dueDate: info.due_date,
      today: today.toISOString().split('T')[0]
    });
  });
});

app.post('/api/daily-record', (req, res) => {
  const { userId, recordDate, symptoms, mood, weight, diet, notes } = req.body;
  
  if (!userId || !recordDate) {
    return res.status(400).json({ error: '用户ID和记录日期不能为空' });
  }

  db.get('SELECT id FROM daily_records WHERE user_id = ? AND record_date = ?', [userId, recordDate], (err, existing) => {
    if (existing) {
      db.run(`UPDATE daily_records SET symptoms = ?, mood = ?, weight = ?, diet = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND record_date = ?`,
        [symptoms, mood, weight, diet, notes, userId, recordDate], (err) => {
          if (err) {
            res.status(500).json({ error: '保存失败' });
          } else {
            res.json({ success: true });
          }
        });
    } else {
      const recordId = uuidv4();
      db.run('INSERT INTO daily_records (id, user_id, record_date, symptoms, mood, weight, diet, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [recordId, userId, recordDate, symptoms, mood, weight, diet, notes], (err) => {
          if (err) {
            res.status(500).json({ error: '保存失败' });
          } else {
            res.json({ success: true });
          }
        });
    }
  });
});

app.get('/api/daily-records/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM daily_records WHERE user_id = ? ORDER BY record_date DESC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/daily-record/:userId/:date', (req, res) => {
  const { userId, date } = req.params;
  db.get('SELECT * FROM daily_records WHERE user_id = ? AND record_date = ?', [userId, date], (err, row) => {
    if (row) {
      res.json(row);
    } else {
      res.json(null);
    }
  });
});

app.post('/api/health-monitoring', (req, res) => {
  const { userId, recordDate, fetalMovement, bloodPressure, bloodSugar, medication } = req.body;
  
  if (!userId || !recordDate) {
    return res.status(400).json({ error: '用户ID和记录日期不能为空' });
  }

  db.get('SELECT id FROM health_monitoring WHERE user_id = ? AND record_date = ?', [userId, recordDate], (err, existing) => {
    if (existing) {
      db.run(`UPDATE health_monitoring SET fetal_movement = ?, blood_pressure = ?, blood_sugar = ?, medication = ? WHERE user_id = ? AND record_date = ?`,
        [fetalMovement, bloodPressure, bloodSugar, medication, userId, recordDate], (err) => {
          if (err) {
            res.status(500).json({ error: '保存失败' });
          } else {
            res.json({ success: true });
          }
        });
    } else {
      const recordId = uuidv4();
      db.run('INSERT INTO health_monitoring (id, user_id, record_date, fetal_movement, blood_pressure, blood_sugar, medication) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [recordId, userId, recordDate, fetalMovement, bloodPressure, bloodSugar, medication], (err) => {
          if (err) {
            res.status(500).json({ error: '保存失败' });
          } else {
            res.json({ success: true });
          }
        });
    }
  });
});

app.get('/api/health-monitoring/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM health_monitoring WHERE user_id = ? ORDER BY record_date DESC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
  const { userId, photoDate, photoType, description } = req.body;
  
  if (!userId || !photoDate || !req.file) {
    return res.status(400).json({ error: '用户ID、日期和照片不能为空' });
  }

  const photoId = uuidv4();
  const photoPath = `/uploads/${req.file.filename}`;
  
  db.run('INSERT INTO photos (id, user_id, photo_date, photo_type, photo_path, description) VALUES (?, ?, ?, ?, ?, ?)',
    [photoId, userId, photoDate, photoType, photoPath, description], (err) => {
      if (err) {
        res.status(500).json({ error: '保存失败' });
      } else {
        res.json({ success: true, photoPath });
      }
    });
});

app.get('/api/photos/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM photos WHERE user_id = ? ORDER BY photo_date DESC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.delete('/api/photos/:photoId', (req, res) => {
  const { photoId } = req.params;
  
  db.get('SELECT photo_path FROM photos WHERE id = ?', [photoId], (err, photo) => {
    if (photo) {
      const filePath = path.join(__dirname, photo.photo_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      db.run('DELETE FROM photos WHERE id = ?', [photoId], (err) => {
        if (err) {
          res.status(500).json({ error: '删除失败' });
        } else {
          res.json({ success: true });
        }
      });
    } else {
      res.status(404).json({ error: '照片不存在' });
    }
  });
});

app.post('/api/medical-checkups', (req, res) => {
  const { userId, checkupDate, hospital, doctor, checkupType, results, notes } = req.body;
  
  if (!userId || !checkupDate) {
    return res.status(400).json({ error: '用户ID和检查日期不能为空' });
  }

  const checkupId = uuidv4();
  db.run('INSERT INTO medical_checkups (id, user_id, checkup_date, hospital, doctor, checkup_type, results, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [checkupId, userId, checkupDate, hospital, doctor, checkupType, results, notes], (err) => {
      if (err) {
        res.status(500).json({ error: '保存失败' });
      } else {
        res.json({ success: true });
      }
    });
});

app.get('/api/medical-checkups/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM medical_checkups WHERE user_id = ? ORDER BY checkup_date DESC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/reminders', (req, res) => {
  const { userId, reminderType, reminderDate, title, description } = req.body;
  
  if (!userId || !reminderType || !reminderDate || !title) {
    return res.status(400).json({ error: '必填字段不能为空' });
  }

  const reminderId = uuidv4();
  db.run('INSERT INTO reminders (id, user_id, reminder_type, reminder_date, title, description) VALUES (?, ?, ?, ?, ?, ?)',
    [reminderId, userId, reminderType, reminderDate, title, description], (err) => {
      if (err) {
        res.status(500).json({ error: '保存失败' });
      } else {
        res.json({ success: true });
      }
    });
});

app.get('/api/reminders/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM reminders WHERE user_id = ? AND is_completed = 0 ORDER BY reminder_date ASC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.put('/api/reminders/:reminderId/complete', (req, res) => {
  const { reminderId } = req.params;
  
  db.run('UPDATE reminders SET is_completed = 1 WHERE id = ?', [reminderId], (err) => {
    if (err) {
      res.status(500).json({ error: '操作失败' });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/api/weight-history/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT record_date, weight FROM daily_records WHERE user_id = ? AND weight IS NOT NULL ORDER BY record_date ASC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/fetal-movement/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT record_date, fetal_movement FROM health_monitoring WHERE user_id = ? AND fetal_movement IS NOT NULL ORDER BY record_date ASC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/ai-suggestions/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM ai_suggestions WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/ai-suggestions/generate', async (req, res) => {
  const { userId, suggestionType, contextData } = req.body;
  
  if (!userId || !suggestionType) {
    return res.status(400).json({ error: '参数不完整' });
  }

  try {
    let suggestionContent = '';
    
    switch(suggestionType) {
      case 'daily':
        suggestionContent = generateDailyAdvice(contextData);
        break;
      case 'health':
        suggestionContent = generateHealthAdvice(contextData);
        break;
      case 'nutrition':
        suggestionContent = generateNutritionAdvice(contextData);
        break;
      case 'exercise':
        suggestionContent = generateExerciseAdvice(contextData);
        break;
      case 'mental':
        suggestionContent = generateMentalAdvice(contextData);
        break;
      default:
        suggestionContent = '根据您的孕期情况，建议保持良好的作息习惯，定期进行产检，如有不适请及时就医。';
    }

    const suggestionId = uuidv4();
    db.run('INSERT INTO ai_suggestions (id, user_id, suggestion_type, suggestion_content, context_data) VALUES (?, ?, ?, ?, ?)',
      [suggestionId, userId, suggestionType, suggestionContent, JSON.stringify(contextData)], (err) => {
        if (err) {
          res.status(500).json({ error: '生成建议失败' });
        } else {
          res.json({ success: true, suggestion: { id: suggestionId, suggestion_type: suggestionType, suggestion_content: suggestionContent } });
        }
      });
  } catch (error) {
    res.status(500).json({ error: '生成建议失败' });
  }
});

app.put('/api/ai-suggestions/:suggestionId/read', (req, res) => {
  const { suggestionId } = req.params;
  
  db.run('UPDATE ai_suggestions SET is_read = 1 WHERE id = ?', [suggestionId], (err) => {
    if (err) {
      res.status(500).json({ error: '操作失败' });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/api/family-members/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`SELECT ur.*, u.username 
          FROM user_relationships ur 
          JOIN users u ON ur.related_user_id = u.id 
          WHERE ur.primary_user_id = ?`, [userId], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/family-members', (req, res) => {
  const { primaryUserId, relatedUserId, relationshipType, canView, canEdit } = req.body;
  
  if (!primaryUserId || !relatedUserId || !relationshipType) {
    return res.status(400).json({ error: '参数不完整' });
  }

  const relationshipId = uuidv4();
  db.run('INSERT INTO user_relationships (id, primary_user_id, related_user_id, relationship_type, can_view, can_edit) VALUES (?, ?, ?, ?, ?, ?)',
    [relationshipId, primaryUserId, relatedUserId, relationshipType, canView ? 1 : 0, canEdit ? 1 : 0], (err) => {
      if (err) {
        res.status(500).json({ error: '添加家庭成员失败' });
      } else {
        res.json({ success: true, relationshipId });
      }
    });
});

app.delete('/api/family-members/:relationshipId', (req, res) => {
  const { relationshipId } = req.params;
  
  db.run('DELETE FROM user_relationships WHERE id = ?', [relationshipId], (err) => {
    if (err) {
      res.status(500).json({ error: '删除失败' });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/api/shared-data/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`SELECT dr.*, u.username as shared_by
          FROM daily_records dr
          JOIN user_relationships ur ON dr.user_id = ur.related_user_id
          JOIN users u ON dr.user_id = u.id
          WHERE ur.primary_user_id = ? AND ur.can_view = 1
          ORDER BY dr.record_date DESC`, [userId], (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/shared-health/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`SELECT hm.*, u.username as shared_by
          FROM health_monitoring hm
          JOIN user_relationships ur ON hm.user_id = ur.related_user_id
          JOIN users u ON hm.user_id = u.id
          WHERE ur.primary_user_id = ? AND ur.can_view = 1
          ORDER BY hm.record_date DESC`, [userId], (err, rows) => {
    res.json(rows);
  });
});

function generateDailyAdvice(context) {
  const advice = [
    '建议每天保持8-10小时的充足睡眠，午间可以适当休息30分钟。',
    '每天进行30分钟的温和运动，如散步、孕妇瑜伽等。',
    '保持均衡饮食，多吃新鲜蔬菜水果，补充叶酸和铁质。',
    '多喝水，每天至少8杯水，保持身体水分平衡。',
    '避免长时间站立或坐着，每小时起来活动一下。'
  ];
  return advice[Math.floor(Math.random() * advice.length)];
}

function generateHealthAdvice(context) {
  const advice = [
    '定期监测血压，保持血压在正常范围内。',
    '注意胎动情况，每天固定时间数胎动，如有异常及时就医。',
    '按时进行产检，不要错过任何一次检查。',
    '注意个人卫生，预防感染。',
    '避免接触有害物质，如烟草、酒精、化学药品等。'
  ];
  return advice[Math.floor(Math.random() * advice.length)];
}

function generateNutritionAdvice(context) {
  const advice = [
    '每天摄入足够的蛋白质，如鸡蛋、牛奶、瘦肉、豆类等。',
    '补充叶酸，预防胎儿神经管畸形。',
    '多吃富含铁的食物，预防贫血。',
    '适量摄入钙质，促进胎儿骨骼发育。',
    '控制糖分摄入，预防妊娠糖尿病。'
  ];
  return advice[Math.floor(Math.random() * advice.length)];
}

function generateExerciseAdvice(context) {
  const advice = [
    '适合孕妇的运动包括散步、孕妇瑜伽、游泳等。',
    '避免剧烈运动和跳跃性运动。',
    '运动时注意心率，不要超过140次/分钟。',
    '运动前要热身，运动后要拉伸。',
    '如有不适，立即停止运动并咨询医生。'
  ];
  return advice[Math.floor(Math.random() * advice.length)];
}

function generateMentalAdvice(context) {
  const advice = [
    '保持积极乐观的心态，对胎儿发育有益。',
    '可以听舒缓的音乐，放松心情。',
    '与家人朋友多交流，分享孕期感受。',
    '学习育儿知识，为宝宝的到来做好准备。',
    '如有焦虑情绪，及时寻求专业帮助。'
  ];
  return advice[Math.floor(Math.random() * advice.length)];
}

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  initDatabase();
});