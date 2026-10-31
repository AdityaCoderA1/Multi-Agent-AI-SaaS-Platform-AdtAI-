@echo off
echo Starting all backend microservices...

start "API Gateway" cmd /k "cd gateway && npm run dev"
start "Auth Service" cmd /k "cd services\auth && npm run dev"
start "Agent Service" cmd /k "cd services\agent && npm run dev"
start "Billing Service" cmd /k "cd services\billing && npm run dev"
start "Chat Service" cmd /k "cd services\chat && npm run dev"

echo All services are starting up in separate windows!
echo Make sure your Firebase serviceAccount.json is in place for the Auth Service.
pause
