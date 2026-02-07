import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [user, setUser] = useState(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState(null);
  const [pregnancyInfo, setPregnancyInfo] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pregnancyUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setActiveTab('timeline');
      fetchPregnancyInfo(JSON.parse(savedUser).userId);
    }
  }, []);

  const fetchPregnancyInfo = async (userId) => {
    try {
      const response = await fetch(`/api/pregnancy-info/${userId}`);
      const data = await response.json();
      if (data) {
        setPregnancyInfo(data);
        fetchPregnancyWeeks(userId);
      }
    } catch (error) {
      console.error('获取孕期信息失败:', error);
    }
  };

  const fetchPregnancyWeeks = async (userId) => {
    try {
      const response = await fetch(`/api/pregnancy-weeks/${userId}`);
      const data = await response.json();
      if (!data.error) {
        setPregnancyWeeks(data);
      }
    } catch (error) {
      console.error('获取孕周信息失败:', error);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        localStorage.setItem('pregnancyUser', JSON.stringify(data));
        setActiveTab('timeline');
        fetchPregnancyInfo(data.userId);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('登录失败');
    }
  };

  const handleRegister = async (username, password) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('注册成功！请登录');
        setActiveTab('login');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('注册失败');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pregnancyUser');
    setPregnancyWeeks(null);
    setPregnancyInfo(null);
    setActiveTab('login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🤰</span>
          <span className="logo-text">孕期记录</span>
        </div>
        {user && (
          <div className="user-info">
            <span className="welcome-text">欢迎, {user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>退出</button>
          </div>
        )}
      </header>

      <main className="main-content">
        {!user ? (
          <div className="auth-container">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                登录
              </button>
              <button
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                注册
              </button>
            </div>

            {activeTab === 'login' && (
              <LoginForm onLogin={handleLogin} />
            )}

            {activeTab === 'register' && (
              <RegisterForm onRegister={handleRegister} />
            )}
          </div>
        ) : (
          <>
            {!pregnancyInfo ? (
              <PregnancyInfoSetup
                userId={user.userId}
                onSave={(info) => {
                  setPregnancyInfo(info);
                  fetchPregnancyWeeks(user.userId);
                }}
              />
            ) : (
              <>
                <nav className="tabs">
                  <button
                    className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                  >
                    📅 孕期时间线
                  </button>
                  <button
                    className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
                    onClick={() => setActiveTab('daily')}
                  >
                    📝 每日记录
                  </button>
                  <button
                    className={`tab ${activeTab === 'health' ? 'active' : ''}`}
                    onClick={() => setActiveTab('health')}
                  >
                    💓 健康监测
                  </button>
                  <button
                    className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('photos')}
                  >
                    📸 照片相册
                  </button>
                  <button
                    className={`tab ${activeTab === 'checkups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('checkups')}
                  >
                    🏥 产检记录
                  </button>
                  <button
                    className={`tab ${activeTab === 'reminders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reminders')}
                  >
                    🔔 提醒事项
                  </button>
                  <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                  >
                    📊 数据统计
                  </button>
                </nav>

                <div className="tab-content">
                  {activeTab === 'timeline' && (
                    <Timeline
                      pregnancyWeeks={pregnancyWeeks}
                      pregnancyInfo={pregnancyInfo}
                      userId={user.userId}
                      onUpdate={fetchPregnancyWeeks}
                    />
                  )}

                  {activeTab === 'daily' && (
                    <DailyRecord userId={user.userId} />
                  )}

                  {activeTab === 'health' && (
                    <HealthMonitoring userId={user.userId} />
                  )}

                  {activeTab === 'photos' && (
                    <PhotoGallery userId={user.userId} />
                  )}

                  {activeTab === 'checkups' && (
                    <MedicalCheckups userId={user.userId} />
                  )}

                  {activeTab === 'reminders' && (
                    <Reminders userId={user.userId} />
                  )}

                  {activeTab === 'stats' && (
                    <Statistics userId={user.userId} />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>登录</h2>
      <div className="form-group">
        <label>用户名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
        />
      </div>
      <div className="form-group">
        <label>密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
        />
      </div>
      <button type="submit" className="submit-btn">登录</button>
    </form>
  );
}

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(username, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>注册</h2>
      <div className="form-group">
        <label>用户名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
        />
      </div>
      <div className="form-group">
        <label>密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
        />
      </div>
      <button type="submit" className="submit-btn">注册</button>
    </form>
  );
}

function PregnancyInfoSetup({ userId, onSave }) {
  const [dueDate, setDueDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/pregnancy-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dueDate,
          conceptionDate: conceptionDate || null
        })
      });

      if (response.ok) {
        onSave({ dueDate, conceptionDate });
      } else {
        alert('保存失败');
      }
    } catch (error) {
      alert('保存失败');
    }
  };

  return (
    <div className="setup-container">
      <h2>🤰 设置孕期信息</h2>
      <p>请填写您的孕期信息，开始记录美好的孕期时光</p>
      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>预产期 *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>受孕日期（可选）</label>
          <input
            type="date"
            value={conceptionDate}
            onChange={(e) => setConceptionDate(e.target.value)}
          />
          <small>如果不填写，系统将根据预产期自动计算</small>
        </div>
        <button type="submit" className="submit-btn">开始记录</button>
      </form>
    </div>
  );
}

function Timeline({ pregnancyWeeks, pregnancyInfo, userId, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [dueDate, setDueDate] = useState(pregnancyInfo?.dueDate || '');
  const [conceptionDate, setConceptionDate] = useState(pregnancyInfo?.conceptionDate || '');

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/pregnancy-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dueDate,
          conceptionDate: conceptionDate || null
        })
      });

      if (response.ok) {
        setEditing(false);
        onUpdate();
      } else {
        alert('更新失败');
      }
    } catch (error) {
      alert('更新失败');
    }
  };

  if (!pregnancyWeeks) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>🤰 孕期时间线</h2>
        <button className="edit-btn" onClick={() => setEditing(!editing)}>
          {editing ? '取消' : '编辑'}
        </button>
      </div>

      {editing && (
        <div className="edit-form">
          <div className="form-group">
            <label>预产期</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>受孕日期</label>
            <input
              type="date"
              value={conceptionDate}
              onChange={(e) => setConceptionDate(e.target.value)}
            />
          </div>
          <button className="submit-btn" onClick={handleUpdate}>保存</button>
        </div>
      )}

      <div className="progress-card">
        <div className="progress-header">
          <h3>当前进度</h3>
          <div className="progress-percentage">{pregnancyWeeks.progress.toFixed(1)}%</div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${pregnancyWeeks.progress}%` }}
          ></div>
        </div>
        <div className="progress-info">
          <div className="progress-item">
            <span className="label">当前孕周</span>
            <span className="value">{pregnancyWeeks.weeks}周{pregnancyWeeks.days}天</span>
          </div>
          <div className="progress-item">
            <span className="label">剩余天数</span>
            <span className="value">{pregnancyWeeks.daysRemaining}天</span>
          </div>
          <div className="progress-item">
            <span className="label">预产期</span>
            <span className="value">{pregnancyWeeks.dueDate}</span>
          </div>
        </div>
      </div>

      <div className="milestones">
        <h3>📋 孕期里程碑</h3>
        <div className="milestone-list">
          <div className={`milestone-item ${pregnancyWeeks.weeks >= 12 ? 'completed' : ''}`}>
            <div className="milestone-icon">🌟</div>
            <div className="milestone-content">
              <h4>12周 - 孕早期结束</h4>
              <p>胎儿基本成型，进入孕中期</p>
            </div>
          </div>
          <div className={`milestone-item ${pregnancyWeeks.weeks >= 20 ? 'completed' : ''}`}>
            <div className="milestone-icon">👶</div>
            <div className="milestone-content">
              <h4>20周 - 感觉到胎动</h4>
              <p>可以感受到宝宝的活动</p>
            </div>
          </div>
          <div className={`milestone-item ${pregnancyWeeks.weeks >= 28 ? 'completed' : ''}`}>
            <div className="milestone-icon">💪</div>
            <div className="milestone-content">
              <h4>28周 - 孕晚期开始</h4>
              <p>进入孕晚期，准备迎接宝宝</p>
            </div>
          </div>
          <div className={`milestone-item ${pregnancyWeeks.weeks >= 37 ? 'completed' : ''}`}>
            <div className="milestone-icon">🎉</div>
            <div className="milestone-content">
              <h4>37周 - 足月</h4>
              <p>宝宝随时可能出生</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyRecord({ userId }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [record, setRecord] = useState({
    symptoms: '',
    mood: '',
    weight: '',
    diet: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecord(selectedDate);
  }, [selectedDate]);

  const fetchRecord = async (date) => {
    try {
      const response = await fetch(`/api/daily-record/${userId}/${date}`);
      const data = await response.json();
      if (data) {
        setRecord(data);
      } else {
        setRecord({
          symptoms: '',
          mood: '',
          weight: '',
          diet: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/daily-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recordDate: selectedDate,
          ...record
        })
      });

      if (response.ok) {
        alert('保存成功！');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      alert('保存失败');
    }
  };

  return (
    <div className="daily-record-container">
      <div className="daily-header">
        <h2>📝 每日记录</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="record-form">
        <div className="form-group">
          <label>身体症状</label>
          <textarea
            value={record.symptoms}
            onChange={(e) => setRecord({ ...record, symptoms: e.target.value })}
            placeholder="记录今天的身体症状，如孕吐、水肿等..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>心情</label>
          <select
            value={record.mood}
            onChange={(e) => setRecord({ ...record, mood: e.target.value })}
          >
            <option value="">选择心情</option>
            <option value="happy">😊 开心</option>
            <option value="calm">😌 平静</option>
            <option value="anxious">😰 焦虑</option>
            <option value="tired">😴 疲惫</option>
            <option value="excited">🥳 兴奋</option>
          </select>
        </div>

        <div className="form-group">
          <label>体重 (kg)</label>
          <input
            type="number"
            step="0.1"
            value={record.weight}
            onChange={(e) => setRecord({ ...record, weight: e.target.value })}
            placeholder="输入体重"
          />
        </div>

        <div className="form-group">
          <label>饮食记录</label>
          <textarea
            value={record.diet}
            onChange={(e) => setRecord({ ...record, diet: e.target.value })}
            placeholder="记录今天的饮食..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>备注</label>
          <textarea
            value={record.notes}
            onChange={(e) => setRecord({ ...record, notes: e.target.value })}
            placeholder="其他想记录的内容..."
            rows="3"
          />
        </div>

        <button className="submit-btn" onClick={handleSave}>保存记录</button>
      </div>
    </div>
  );
}

function HealthMonitoring({ userId }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [record, setRecord] = useState({
    fetalMovement: '',
    bloodPressure: '',
    bloodSugar: '',
    medication: ''
  });

  useEffect(() => {
    fetchRecord(selectedDate);
  }, [selectedDate]);

  const fetchRecord = async (date) => {
    try {
      const response = await fetch(`/api/health-monitoring/${userId}`);
      const data = await response.json();
      const dayRecord = data.find(r => r.record_date === date);
      if (dayRecord) {
        setRecord(dayRecord);
      } else {
        setRecord({
          fetalMovement: '',
          bloodPressure: '',
          bloodSugar: '',
          medication: ''
        });
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/health-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recordDate: selectedDate,
          ...record
        })
      });

      if (response.ok) {
        alert('保存成功！');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      alert('保存失败');
    }
  };

  return (
    <div className="health-monitoring-container">
      <div className="health-header">
        <h2>💓 健康监测</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="record-form">
        <div className="form-group">
          <label>胎动次数</label>
          <input
            type="number"
            value={record.fetalMovement}
            onChange={(e) => setRecord({ ...record, fetalMovement: e.target.value })}
            placeholder="输入今天的胎动次数"
          />
        </div>

        <div className="form-group">
          <label>血压</label>
          <input
            type="text"
            value={record.bloodPressure}
            onChange={(e) => setRecord({ ...record, bloodPressure: e.target.value })}
            placeholder="例如：120/80"
          />
        </div>

        <div className="form-group">
          <label>血糖</label>
          <input
            type="text"
            value={record.bloodSugar}
            onChange={(e) => setRecord({ ...record, bloodSugar: e.target.value })}
            placeholder="例如：5.5"
          />
        </div>

        <div className="form-group">
          <label>用药记录</label>
          <textarea
            value={record.medication}
            onChange={(e) => setRecord({ ...record, medication: e.target.value })}
            placeholder="记录今天的用药情况..."
            rows="3"
          />
        </div>

        <button className="submit-btn" onClick={handleSave}>保存记录</button>
      </div>
    </div>
  );
}

function PhotoGallery({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoType, setPhotoType] = useState('belly');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/photos/${userId}`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('获取照片失败:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('请选择照片');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('userId', userId);
    formData.append('photoDate', photoDate);
    formData.append('photoType', photoType);
    formData.append('description', description);

    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('上传成功！');
        setSelectedFile(null);
        setDescription('');
        fetchPhotos();
      } else {
        alert('上传失败');
      }
    } catch (error) {
      alert('上传失败');
    }
  };

  const handleDelete = async (photoId) => {
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPhotos();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  return (
    <div className="photo-gallery-container">
      <h2>📸 照片相册</h2>

      <div className="upload-section">
        <h3>上传照片</h3>
        <div className="upload-form">
          <div className="form-group">
            <label>照片类型</label>
            <select
              value={photoType}
              onChange={(e) => setPhotoType(e.target.value)}
            >
              <option value="belly">肚子照片</option>
              <option value="ultrasound">超声波照片</option>
              <option value="other">其他照片</option>
            </select>
          </div>
          <div className="form-group">
            <label>日期</label>
            <input
              type="date"
              value={photoDate}
              onChange={(e) => setPhotoDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>选择照片</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加描述..."
              rows="2"
            />
          </div>
          <button className="submit-btn" onClick={handleUpload}>上传</button>
        </div>
      </div>

      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card">
            <img src={photo.photo_path} alt={photo.description} />
            <div className="photo-info">
              <div className="photo-date">{photo.photo_date}</div>
              <div className="photo-type">
                {photo.photo_type === 'belly' && '肚子'}
                {photo.photo_type === 'ultrasound' && '超声波'}
                {photo.photo_type === 'other' && '其他'}
              </div>
              {photo.description && (
                <div className="photo-description">{photo.description}</div>
              )}
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(photo.id)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="empty-state">
          <p>还没有上传照片，快来记录美好的孕期时光吧！</p>
        </div>
      )}
    </div>
  );
}

function MedicalCheckups({ userId }) {
  const [checkups, setCheckups] = useState([]);
  const [formData, setFormData] = useState({
    checkupDate: '',
    hospital: '',
    doctor: '',
    checkupType: '',
    results: '',
    notes: ''
  });

  useEffect(() => {
    fetchCheckups();
  }, []);

  const fetchCheckups = async () => {
    try {
      const response = await fetch(`/api/medical-checkups/${userId}`);
      const data = await response.json();
      setCheckups(data);
    } catch (error) {
      console.error('获取产检记录失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/medical-checkups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      if (response.ok) {
        alert('保存成功！');
        setFormData({
          checkupDate: '',
          hospital: '',
          doctor: '',
          checkupType: '',
          results: '',
          notes: ''
        });
        fetchCheckups();
      } else {
        alert('保存失败');
      }
    } catch (error) {
      alert('保存失败');
    }
  };

  return (
    <div className="medical-checkups-container">
      <h2>🏥 产检记录</h2>

      <div className="checkup-form">
        <h3>添加产检记录</h3>
        <div className="form-group">
          <label>检查日期 *</label>
          <input
            type="date"
            value={formData.checkupDate}
            onChange={(e) => setFormData({ ...formData, checkupDate: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>医院</label>
          <input
            type="text"
            value={formData.hospital}
            onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
            placeholder="医院名称"
          />
        </div>
        <div className="form-group">
          <label>医生</label>
          <input
            type="text"
            value={formData.doctor}
            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
            placeholder="医生姓名"
          />
        </div>
        <div className="form-group">
          <label>检查类型</label>
          <input
            type="text"
            value={formData.checkupType}
            onChange={(e) => setFormData({ ...formData, checkupType: e.target.value })}
            placeholder="例如：常规检查、B超等"
          />
        </div>
        <div className="form-group">
          <label>检查结果</label>
          <textarea
            value={formData.results}
            onChange={(e) => setFormData({ ...formData, results: e.target.value })}
            placeholder="检查结果..."
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>备注</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="其他备注..."
            rows="2"
          />
        </div>
        <button className="submit-btn" onClick={handleSave}>保存</button>
      </div>

      <div className="checkups-list">
        <h3>产检记录列表</h3>
        {checkups.map((checkup) => (
          <div key={checkup.id} className="checkup-card">
            <div className="checkup-header">
              <span className="checkup-date">{checkup.checkup_date}</span>
              <span className="checkup-type">{checkup.checkup_type}</span>
            </div>
            {checkup.hospital && (
              <div className="checkup-info">
                <span className="label">医院：</span>
                <span className="value">{checkup.hospital}</span>
              </div>
            )}
            {checkup.doctor && (
              <div className="checkup-info">
                <span className="label">医生：</span>
                <span className="value">{checkup.doctor}</span>
              </div>
            )}
            {checkup.results && (
              <div className="checkup-results">
                <span className="label">结果：</span>
                <span className="value">{checkup.results}</span>
              </div>
            )}
            {checkup.notes && (
              <div className="checkup-notes">
                <span className="label">备注：</span>
                <span className="value">{checkup.notes}</span>
              </div>
            )}
          </div>
        ))}

        {checkups.length === 0 && (
          <div className="empty-state">
            <p>还没有产检记录，快来记录每次产检的情况吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Reminders({ userId }) {
  const [reminders, setReminders] = useState([]);
  const [formData, setFormData] = useState({
    reminderType: 'checkup',
    reminderDate: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`/api/reminders/${userId}`);
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('获取提醒失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      if (response.ok) {
        alert('添加成功！');
        setFormData({
          reminderType: 'checkup',
          reminderDate: '',
          title: '',
          description: ''
        });
        fetchReminders();
      } else {
        alert('添加失败');
      }
    } catch (error) {
      alert('添加失败');
    }
  };

  const handleComplete = async (reminderId) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: 'PUT'
      });

      if (response.ok) {
        fetchReminders();
      } else {
        alert('操作失败');
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  return (
    <div className="reminders-container">
      <h2>🔔 提醒事项</h2>

      <div className="reminder-form">
        <h3>添加提醒</h3>
        <div className="form-group">
          <label>提醒类型</label>
          <select
            value={formData.reminderType}
            onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
          >
            <option value="checkup">产检提醒</option>
            <option value="medication">服药提醒</option>
            <option value="supplement">补充剂提醒</option>
            <option value="other">其他提醒</option>
          </select>
        </div>
        <div className="form-group">
          <label>提醒时间 *</label>
          <input
            type="datetime-local"
            value={formData.reminderDate}
            onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="提醒标题"
            required
          />
        </div>
        <div className="form-group">
          <label>描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="详细描述..."
            rows="2"
          />
        </div>
        <button className="submit-btn" onClick={handleSave}>添加提醒</button>
      </div>

      <div className="reminders-list">
        <h3>待办提醒</h3>
        {reminders.map((reminder) => (
          <div key={reminder.id} className="reminder-card">
            <div className="reminder-header">
              <span className="reminder-type">
                {reminder.reminder_type === 'checkup' && '🏥 产检'}
                {reminder.reminder_type === 'medication' && '💊 服药'}
                {reminder.reminder_type === 'supplement' && '💉 补充剂'}
                {reminder.reminder_type === 'other' && '📌 其他'}
              </span>
              <span className="reminder-date">
                {new Date(reminder.reminder_date).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="reminder-title">{reminder.title}</div>
            {reminder.description && (
              <div className="reminder-description">{reminder.description}</div>
            )}
            <button
              className="complete-btn"
              onClick={() => handleComplete(reminder.id)}
            >
              ✓ 完成
            </button>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="empty-state">
            <p>没有待办提醒，添加一些提醒事项吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Statistics({ userId }) {
  const [weightHistory, setWeightHistory] = useState([]);
  const [fetalMovement, setFetalMovement] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [weightRes, movementRes] = await Promise.all([
        fetch(`/api/weight-history/${userId}`),
        fetch(`/api/fetal-movement/${userId}`)
      ]);

      const weightData = await weightRes.json();
      const movementData = await movementRes.json();

      setWeightHistory(weightData);
      setFetalMovement(movementData);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  return (
    <div className="statistics-container">
      <h2>📊 数据统计</h2>

      <div className="stats-section">
        <h3>体重变化</h3>
        {weightHistory.length > 0 ? (
          <div className="weight-chart">
            {weightHistory.map((record, index) => (
              <div key={index} className="weight-bar">
                <div className="weight-date">{record.record_date}</div>
                <div className="weight-value">{record.weight} kg</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>还没有体重记录，在每日记录中添加体重数据吧！</p>
          </div>
        )}
      </div>

      <div className="stats-section">
        <h3>胎动记录</h3>
        {fetalMovement.length > 0 ? (
          <div className="movement-chart">
            {fetalMovement.map((record, index) => (
              <div key={index} className="movement-bar">
                <div className="movement-date">{record.record_date}</div>
                <div className="movement-value">{record.fetal_movement} 次</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>还没有胎动记录，在健康监测中添加胎动数据吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;