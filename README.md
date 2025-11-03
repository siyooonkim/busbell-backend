🚌 버스 알리미 (Bus Notifier)
매번 지도 앱을 새로고침하며 버스 도착 시간을 확인하는 번거로움을 해결하기 위한 실시간 버스 도착 알림 서비스입니다.

🚀 주요 기능
버스 노선 및 정류장 검색: 공공 API와 연동하여 버스 노선과 정류장 정보를 검색합니다.

간편한 알림 설정: '도착 5분 전' 또는 '3개 정류장 전'과 같이 원하는 시점을 선택하여 푸시 알림을 예약할 수 있습니다.

실시간 푸시 알림 (FCM): 사용자가 앱을 보고 있지 않아도, 설정한 시간에 정확히 푸시 알림을 전송합니다.

동적 폴링 (Dynamic Polling): 버스가 멀리 있을 땐 천천히, 가까워질수록 더 자주 위치를 확인하여 시스템 부하와 API 호출을 최적화합니다.

사용자 인증: JWT(Access/Refresh Token) 기반의 회원가입, 로그인, 로그아웃 기능을 제공합니다.

💻 기술 스택 (Tech Stack)
Backend: NestJS, TypeScript, TypeORM

Database: PostgreSQL

Frontend: React Native, TypeScript

Infra: AWS (예정)

Others: FCM (푸시 알림), JWT (인증)

⚙️ 시작하기 (Getting Started)
1. 레포지토리 클론
   Bash
git clone [Your Repository URL]
cd busbell-backend

2. 패키지 설치
   Bash  yarn install
3. 환경변수 설정
   루트 디렉터리에 .env 파일을 생성하고, 프로젝트에 필요한 환경 변수를 설정합니다. (DB 정보, JWT 시크릿, Firebase Admin SDK 정보 등)

코드 스니펫

# Server
PORT=3000


4. 서버 실행 (개발 모드)
   Bash

yarn start:dev
📄 API 문서 (API Documentation)
서버가 실행되면 (기본 http://localhost:3000/docs)에서 전체 API 명세(Swagger)를 확인할 수 있습니다.

주요 API 모듈
Auth: /api/auth (회원가입, 로그인, 토큰 갱신)

Users: /api/users (내 정보, FCM 토큰 등록)

Bus (공공 API): /api/bus (노선 검색, 정류장 정보)

Notifications: /api/notifications (알림 예약, 조회, 취소)