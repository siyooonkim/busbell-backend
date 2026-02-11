# BusBell 배포 계획서

## TL;DR

> **Quick Summary**: BusBell 버스 알림 앱의 AWS 백엔드 배포 및 iOS App Store 제출
> 
> **Deliverables**:
> - AWS EC2에 백엔드 서버 배포
> - iOS 앱 App Store 심사 제출
> 
> **Estimated Effort**: Medium (반나절~하루)
> **Critical Path**: EC2 생성 → 백엔드 배포 → API URL 변경 → App Store 제출

---

## Context

### 프로젝트 정보
- **앱**: BusBell - 버스 도착 알림 서비스
- **백엔드**: NestJS + TypeScript + PostgreSQL + Redis + FCM
- **프론트엔드**: React Native CLI (iOS/Android)
- **경로**: 
  - 백엔드: `/Users/siyoon/Desktop/busbell-backend/`
  - 프론트엔드: `/Users/siyoon/Desktop/busbell-app/`

### 현재 상태
- ✅ 백엔드 코드 수정 완료 (폴링 로직, 로깅 등)
- ✅ 프론트 버그 수정 완료
- ✅ AWS 계정 있음
- ✅ Apple Developer 승인 완료

---

## 비용 요약

| 항목 | 첫해 | 2년차~ |
|------|------|--------|
| AWS EC2 (t3.micro) | ~$2/월 (프리티어) | ~$11/월 |
| Apple Developer | $99/년 | $99/년 |
| **예상 첫해 총비용** | ~$123 | - |

---

## TODOs

### Phase 1: AWS EC2 생성

- [ ] 1. AWS Console 접속 및 EC2 인스턴스 생성

  **What to do**:
  1. AWS Console → EC2 → 인스턴스 시작
  2. 설정:
     - AMI: Amazon Linux 2023
     - 인스턴스 유형: t3.micro (프리티어)
     - 스토리지: 20GB gp3
     - 리전: ap-northeast-2 (서울)
  3. 키 페어 생성/선택 (SSH 접속용)
  4. 보안 그룹 설정:
     - SSH (22): 내 IP만
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - Custom TCP (3000): 0.0.0.0/0 (NestJS)

  **Acceptance Criteria**:
  - [ ] EC2 인스턴스 running 상태
  - [ ] SSH 접속 가능: `ssh -i key.pem ec2-user@<IP>`

- [ ] 2. Elastic IP 할당 및 연결

  **What to do**:
  1. EC2 → Elastic IP → 새 주소 할당
  2. 할당된 IP를 EC2 인스턴스에 연결
  
  **Why**: 인스턴스 재시작해도 IP 유지

  **Acceptance Criteria**:
  - [ ] Elastic IP 연결됨
  - [ ] 고정 IP로 SSH 접속 가능

---

### Phase 2: 서버 환경 설정

- [ ] 3. Docker 및 Docker Compose 설치

  **What to do**:
  ```bash
  # SSH 접속 후
  sudo yum update -y
  sudo yum install -y docker
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ec2-user
  
  # Docker Compose 설치
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  
  # 재접속 후 확인
  docker --version
  docker-compose --version
  ```

  **Acceptance Criteria**:
  - [ ] `docker --version` 출력됨
  - [ ] `docker-compose --version` 출력됨

---

### Phase 3: 백엔드 배포

- [ ] 4. 백엔드 코드 업로드

  **What to do**:
  ```bash
  # 로컬에서
  cd /Users/siyoon/Desktop/busbell-backend
  
  # node_modules, dist 제외하고 압축
  tar --exclude='node_modules' --exclude='dist' --exclude='.git' -czvf busbell-backend.tar.gz .
  
  # EC2로 전송
  scp -i <key.pem> busbell-backend.tar.gz ec2-user@<ELASTIC_IP>:~/
  
  # EC2에서
  mkdir -p ~/busbell-backend
  tar -xzvf busbell-backend.tar.gz -C ~/busbell-backend
  ```

  **Acceptance Criteria**:
  - [ ] EC2에 `~/busbell-backend` 디렉토리 존재
  - [ ] 소스 파일들 확인 가능

- [ ] 5. 환경 변수 설정 (.env)

  **What to do**:
  ```bash
  cd ~/busbell-backend
  nano .env
  ```
  
  **필수 환경 변수**:
  ```
  # Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=<secure_password>
  DB_DATABASE=busbell
  
  # Redis
  REDIS_HOST=localhost
  REDIS_PORT=6379
  
  # TAGO API
  TAGO_API_KEY=<your_tago_key>
  
  # FCM
  GOOGLE_APPLICATION_CREDENTIALS=/app/secrets/firebase-admin.json
  
  # Server
  PORT=3000
  NODE_ENV=production
  ```

  **Acceptance Criteria**:
  - [ ] `.env` 파일 생성됨
  - [ ] 모든 필수 환경 변수 설정됨

- [ ] 6. Firebase credentials 업로드

  **What to do**:
  ```bash
  # 로컬에서
  scp -i <key.pem> /Users/siyoon/Desktop/busbell-backend/secrets/firebase-admin.json ec2-user@<ELASTIC_IP>:~/busbell-backend/secrets/
  ```

  **Acceptance Criteria**:
  - [ ] `~/busbell-backend/secrets/firebase-admin.json` 존재

- [ ] 7. Docker Compose로 서비스 실행

  **What to do**:
  ```bash
  cd ~/busbell-backend
  docker-compose up -d
  ```
  
  **docker-compose.yml 확인**:
  - PostgreSQL 컨테이너
  - Redis 컨테이너
  - NestJS 앱 컨테이너

  **Acceptance Criteria**:
  - [ ] `docker-compose ps` - 모든 컨테이너 running
  - [ ] `docker-compose logs app` - 에러 없음

- [ ] 8. API 헬스체크

  **What to do**:
  ```bash
  # EC2에서 로컬 테스트
  curl http://localhost:3000/health
  
  # 외부에서 테스트
  curl http://<ELASTIC_IP>:3000/health
  ```

  **Acceptance Criteria**:
  - [ ] 200 OK 응답
  - [ ] 정상 JSON 응답

---

### Phase 4: iOS 앱 설정

- [ ] 9. API Base URL 변경

  **What to do**:
  ```bash
  # busbell-app/src/api/client.ts (또는 유사 파일)
  # localhost:3000 → http://<ELASTIC_IP>:3000 으로 변경
  ```

  **Acceptance Criteria**:
  - [ ] API URL이 EC2 IP로 변경됨

- [ ] 10. Xcode 빌드 테스트

  **What to do**:
  1. Xcode에서 busbell-app 열기
  2. 실제 기기 또는 시뮬레이터에서 빌드
  3. 앱 실행하여 API 통신 테스트

  **Acceptance Criteria**:
  - [ ] 빌드 성공
  - [ ] 앱에서 버스 검색 동작
  - [ ] 알림 예약 동작

---

### Phase 5: App Store 제출

- [ ] 11. Archive 생성

  **What to do**:
  1. Xcode → Product → Archive
  2. Organizer에서 Archive 확인

  **Acceptance Criteria**:
  - [ ] Archive 생성 성공

- [ ] 12. App Store Connect 업로드

  **What to do**:
  1. Organizer → Distribute App → App Store Connect
  2. 업로드 완료 대기

  **Acceptance Criteria**:
  - [ ] App Store Connect에 빌드 표시됨

- [ ] 13. 앱 정보 입력

  **What to do**:
  App Store Connect에서:
  - 앱 이름: BusBell
  - 부제: 버스 도착 알림
  - 카테고리: 여행/내비게이션
  - 스크린샷 (6.7", 6.5", 5.5")
  - 앱 설명
  - 키워드
  - 개인정보 처리방침 URL
  - 지원 URL

  **Acceptance Criteria**:
  - [ ] 모든 필수 정보 입력됨

- [ ] 14. 심사 제출

  **What to do**:
  1. 빌드 선택
  2. "심사를 위해 제출" 클릭

  **Acceptance Criteria**:
  - [ ] 상태: "심사 대기 중"

---

## 후속 작업 (배포 후)

1. **HTTPS 설정**: Let's Encrypt + nginx reverse proxy
2. **도메인 연결**: Route 53 또는 외부 DNS
3. **모니터링**: CloudWatch 알람 설정
4. **Update-2 구현**: 서울/경기 버스 API 추가 (마을버스 지원)
5. **Android 배포**: Google Play Store 제출

---

## 참고사항

1. **TAGO API 한계**: 서울/경기 마을버스 미지원 → update-2에서 해결 예정
2. **캐시 비활성화**: `busapi.service.ts`에서 ETA, realtime 캐시 임시 비활성화 상태 (디버깅용)
3. **iOS 먼저**: Android는 iOS 안정화 후 진행
