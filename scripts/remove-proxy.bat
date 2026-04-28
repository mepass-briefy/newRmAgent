@echo off
:: rmai.local 포트 프록시 제거 (관리자 권한으로 실행 필요)

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] 관리자 권한으로 실행해주세요.
    pause
    exit /b 1
)

netsh interface portproxy delete v4tov4 listenaddress=127.0.0.1 listenport=80
netsh advfirewall firewall delete rule name="rmai.local dev" >nul 2>&1

echo 포트 프록시가 제거되었습니다.
pause
