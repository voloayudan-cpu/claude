@echo off
chcp 65001 > nul
echo ========================================
echo   Git 自动化推送脚本
echo ========================================
echo.

echo [1/4] 添加所有更改...
git add .
if %errorlevel% neq 0 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)
echo [成功] 文件已添加
echo.

echo [2/4] 提交更改...
set /p commit_msg="请输入提交信息（默认：Update project）: "
if "%commit_msg%"=="" set commit_msg=Update project

git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo [错误] 提交失败
    pause
    exit /b 1
)
echo [成功] 已提交: %commit_msg%
echo.

echo [3/4] 推送到GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [警告] 推送失败，可能是网络问题
    echo 请检查网络连接后重试
    pause
    exit /b 1
)
echo [成功] 已推送到GitHub
echo.

echo ========================================
echo   推送完成！
echo ========================================
echo.
echo 您的代码已成功推送到:
echo https://github.com/voloayudan-cpu/claude.git
echo.
pause