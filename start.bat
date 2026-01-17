@echo off
echo ========================================
echo AI-Evolve 启动脚本
echo ========================================
echo.
echo 正在启动浏览器...
start "" "%~dp0index.html"
echo.
echo ✓ 浏览器已打开
echo.
echo 如果页面无法加载数据，请确保以下文件存在：
echo - js/data-bundle.js
echo - js/chart.js
echo - js/animator.js
echo - js/main.js
echo.
pause
