# 🤰 孕期记录网站

一个温馨的孕期记录应用，帮助准妈妈们记录美好的孕期时光。

## 🌐 GitHub 仓库

项目地址：https://github.com/voloayudan-cpu/claude.git

## ✨ 功能特点

### 📅 孕期时间线
- 自动计算孕周和预产期
- 显示孕期进度百分比
- 孕期里程碑追踪

### 📝 每日记录
- 身体症状记录（孕吐、水肿等）
- 心情日记
- 体重变化追踪
- 饮食记录
- 自由备注

### 💓 健康监测
- 胎动次数记录
- 血压监测
- 血糖监测
- 用药记录

### 📸 照片相册
- 肚子变化照片
- 超声波照片
- 其他孕期照片
- 照片分类管理

### 🏥 产检记录
- 产检日期记录
- 医院和医生信息
- 检查结果记录
- 备注信息

### 🔔 提醒事项
- 产检提醒
- 服药提醒
- 补充剂提醒
- 自定义提醒

### 📊 数据统计
- 体重变化曲线
- 胎动统计
- 健康指标趋势

## 🚀 快速开始

### 前置要求
- Node.js (v14 或更高版本)
- npm 或 yarn
- Git（用于版本控制）

### 安装步骤

1. **安装依赖**
```bash
cd pregnancy-tracker
npm install
```

2. **启动后端服务器**
```bash
npm start
```
后端服务器将在 http://localhost:3001 运行

3. **启动前端开发服务器**
```bash
npm run dev
```
前端开发服务器将在 http://localhost:3000 运行

4. **打开浏览器**
访问 http://localhost:3000 开始使用

## 📱 使用指南

### 1. 注册账号
- 点击"注册"标签
- 输入用户名和密码
- 点击"注册"按钮

### 2. 登录系统
- 点击"登录"标签
- 输入用户名和密码
- 点击"登录"按钮

### 3. 设置孕期信息
- 首次登录需要设置预产期
- 可选填写受孕日期（系统会自动计算）
- 点击"开始记录"

### 4. 开始记录
- **孕期时间线**：查看当前孕周和进度
- **每日记录**：记录每天的身体状况、心情、体重等
- **健康监测**：记录胎动、血压、血糖等健康指标
- **照片相册**：上传孕期照片
- **产检记录**：记录每次产检的情况
- **提醒事项**：设置各种提醒
- **数据统计**：查看体重和胎动趋势

## 🎨 设计特点

- **温馨风格**：柔和的粉色、紫色、蓝色配色
- **简洁界面**：操作简单，易于使用
- **响应式设计**：支持手机、平板、电脑
- **玻璃态效果**：现代感十足的UI设计
- **流畅动画**：舒适的交互体验

## 📊 技术栈

### 前端
- React 18
- Vite
- CSS3（玻璃态设计）

### 后端
- Node.js
- Express
- SQLite
- Multer（文件上传）

## 🗄️ 数据库结构

### users
- id: 用户ID
- username: 用户名
- password: 密码
- created_at: 创建时间

### pregnancy_info
- id: ID
- user_id: 用户ID
- due_date: 预产期
- conception_date: 受孕日期
- created_at: 创建时间
- updated_at: 更新时间

### daily_records
- id: ID
- user_id: 用户ID
- record_date: 记录日期
- symptoms: 身体症状
- mood: 心情
- weight: 体重
- diet: 饮食记录
- notes: 备注
- created_at: 创建时间
- updated_at: 更新时间

### health_monitoring
- id: ID
- user_id: 用户ID
- record_date: 记录日期
- fetal_movement: 胎动次数
- blood_pressure: 血压
- blood_sugar: 血糖
- medication: 用药记录
- created_at: 创建时间

### photos
- id: ID
- user_id: 用户ID
- photo_date: 照片日期
- photo_type: 照片类型
- photo_path: 照片路径
- description: 描述
- created_at: 创建时间

### medical_checkups
- id: ID
- user_id: 用户ID
- checkup_date: 检查日期
- hospital: 医院
- doctor: 医生
- checkup_type: 检查类型
- results: 检查结果
- notes: 备注
- created_at: 创建时间

### reminders
- id: ID
- user_id: 用户ID
- reminder_type: 提醒类型
- reminder_date: 提醒时间
- title: 标题
- description: 描述
- is_completed: 是否完成
- created_at: 创建时间

## 🔒 安全说明

- 所有密码以明文存储（仅用于演示）
- 建议在生产环境中使用加密存储
- 照片存储在本地uploads目录

## 📝 默认账号

系统会自动创建一个管理员账号：
- 用户名：admin
- 密码：admin123

## 🐛 常见问题

### Q: 如何修改预产期？
A: 在"孕期时间线"页面点击"编辑"按钮，修改后保存即可。

### Q: 照片上传失败？
A: 请确保：
1. 选择了有效的图片文件
2. 文件大小不超过限制
3. uploads目录有写入权限

### Q: 数据会丢失吗？
A: 数据存储在SQLite数据库文件中，只要不删除数据库文件，数据就不会丢失。

### Q: 可以导出数据吗？
A: 当前版本不支持数据导出，后续版本会添加此功能。

## 🌟 未来计划

- [ ] 数据导出功能
- [ ] 多语言支持
- [ ] 离线功能
- [ ] 家人共享功能
- [ ] 医生端查看
- [ ] AI健康建议
- [ ] 社区交流功能
- [ ] 知识库文章

## 📦 项目结构

```
pregnancy-tracker/
├── server.js              # 后端服务器
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
├── index.html            # HTML入口
├── src/
│   ├── main.jsx          # React入口
│   ├── App.jsx           # 主应用组件
│   └── App.css          # 样式文件
├── uploads/             # 照片上传目录
├── pregnancy.db         # SQLite数据库
├── .gitignore          # Git忽略文件
├── git-push.bat        # Git推送脚本
└── GIT_GUIDE.md       # Git使用指南
```

## 🔄 Git 操作

### 推送代码到 GitHub

#### 方法一：使用自动化脚本（推荐）
```bash
# 双击运行 git-push.bat
# 输入提交信息
# 等待推送完成
```

#### 方法二：手动命令
```bash
# 1. 添加所有更改
git add .

# 2. 提交更改
git commit -m "您的提交信息"

# 3. 推送到GitHub
git push origin main
```

### 查看提交历史
```bash
git log --oneline
```

### 查看远程仓库
```bash
git remote -v
```

### 拉取最新代码
```bash
git pull origin main
```

更多 Git 操作请参考 [GIT_GUIDE.md](./GIT_GUIDE.md)
- [ ] 离线功能
- [ ] 家人共享功能
- [ ] 医生端查看
- [ ] AI健康建议
- [ ] 社区交流功能
- [ ] 知识库文章

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 💬 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件

---

**祝您孕期愉快！🤰💕**