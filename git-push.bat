@echo off
chcp 65001 >nul
echo ========================================
echo 自动推送到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo 检查 Git 状态...
git status
echo.

echo 正在推送到 GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败，请检查网络连接
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接不稳定
    echo 2. GitHub 服务暂时不可用
    echo 3. 需要身份验证
    echo.
    echo 请稍后重试或检查网络设置
)

echo.
pause
