@echo off
:: rmai.local 로컬 도메인 설정 (관리자 권한으로 실행 필요)
:: 포트 80 → 3000 포워딩 (Next.js는 3000 그대로 유지)

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] 관리자 권한으로 실행해주세요.
    echo 이 파일을 우클릭 → "관리자 권한으로 실행" 하세요.
    pause
    exit /b 1
)

echo [1/2] 포트 프록시 설정 중... (80 -> 3000)
netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=80 connectaddress=127.0.0.1 connectport=3000

echo [2/2] 방화벽 규칙 추가 중...
netsh advfirewall firewall add rule name="rmai.local dev" protocol=TCP dir=in localport=80 action=allow >nul 2>&1

echo.
echo ================================================
echo  완료! 이제 http://rmai.local 로 접속할 수 있습니다.
echo  Next.js 서버는 기존대로 npm run dev 로 실행하세요.
echo ================================================
echo.
echo 설정 확인:
netsh interface portproxy show v4tov4
pause
