# 네덜란드 경매 게임 사용자 매뉴얼

## 📋 목차
1. [게임 개요](#게임-개요)
2. [시작하기](#시작하기)
3. [게임 화면 구성](#게임-화면-구성)
4. [게임 플레이](#게임-플레이)
5. [승자 대사 시스템](#승자-대사-시스템)
6. [관리자 기능](#관리자-기능)
7. [팁과 전략](#팁과-전략)
8. [문제 해결](#문제-해결)

## 🎯 게임 개요

### 네덜란드 경매란?
네덜란드 경매는 일반적인 경매와 반대로 **높은 가격에서 시작하여 점점 낮아지는** 경매 방식입니다. 참가자는 원하는 가격에 도달했을 때 입찰 버튼을 눌러 물건을 낙찰받습니다.

### 게임 목표
- 적절한 타이밍에 입찰하여 원하는 물건을 낙찰받기
- 다른 참가자들과 실시간으로 소통하며 경매 참여
- 낙찰 후 개성 있는 대사로 자신의 감정 표현하기

## 🚀 시작하기

### 1. 게임 접속
1. 웹 브라우저에서 게임 서버 주소 입력
2. 로딩 화면에서 연결 상태 확인
3. 사용자 이름 입력 (중복 불가)
4. "게임 시작" 버튼 클릭

### 2. 첫 화면 안내
- **좌측**: 참가자 목록과 경매 목록
- **중앙**: 게임 보드 (아바타 이동 가능)
- **우측**: 채팅 창

## 🖥️ 게임 화면 구성

### 좌측 패널
- **사용자 목록**: 현재 접속 중인 모든 참가자
- **경매 목록**: 진행 중이거나 대기 중인 경매들
- **경매 정보**: 현재 가격, 시작 가격, 물품명

### 중앙 게임 보드
- **아바타**: 각 참가자의 게임 내 캐릭터
- **말풍선**: 채팅 메시지가 5초간 표시
- **이동**: 보드를 클릭하여 아바타 이동
- **공지사항**: 관리자 메시지가 상단에 표시

### 우측 채팅 창
- **메시지 목록**: 모든 채팅 기록
- **입력창**: 메시지 작성 및 전송
- **시스템 메시지**: 입장/퇴장 및 게임 이벤트

### 하단 입찰 영역
- **물품 정보**: 현재 경매 중인 물품
- **현재 가격**: 실시간으로 변화하는 가격
- **입찰 버튼**: 클릭하여 즉시 낙찰

## 🎮 게임 플레이

### 기본 조작
1. **이동**: 게임 보드의 원하는 위치 클릭
2. **채팅**: 우측 창에 메시지 입력 후 Enter
3. **입찰**: 하단의 큰 입찰 버튼 클릭

### 경매 참여하기
1. **경매 시작**: 관리자가 경매를 시작하면 카운트다운 시작
2. **가격 확인**: 시작 가격부터 점점 하락하는 가격 관찰
3. **입찰 타이밍**: 원하는 가격에 도달하면 입찰 버튼 클릭
4. **즉시 낙찰**: 첫 번째 입찰자가 해당 가격에 낙찰

### 아바타 이동
- **클릭 이동**: 게임 보드의 아무 곳이나 클릭
- **부드러운 애니메이션**: 아바타가 자연스럽게 이동
- **다른 참가자 보기**: 실시간으로 모든 참가자의 위치 확인

## 🎭 승자 대사 시스템

### 낙찰 후 과정
1. **대사 선택 화면**: 낙찰 즉시 특별한 화면 등장
2. **승자 화면**: 4개의 대사 선택지와 타이머 표시
3. **다른 참가자**: 대기 화면에서 "..." 애니메이션 표시

### 대사 선택하기
1. **시간 제한**: 화면 상단의 타이머 확인 (기본 7초)
2. **선택지 확인**: 4개의 미리 준비된 대사 중 선택
3. **클릭**: 원하는 대사 버튼 클릭
4. **브로드캐스팅**: 선택된 대사가 모든 참가자에게 표시

### 특별 효과
- **심장박동 사운드**: 긴장감 있는 배경음 재생
- **펄스 애니메이션**: 선택된 대사가 심장박동에 맞춰 움직임
- **실시간 공유**: 모든 참가자가 동시에 같은 대사 확인

### 시간 초과 시
- **자동 진행**: 시간 내에 선택하지 않으면 자동으로 축하 모달로 이동
- **대사 없음**: 특별한 메시지 표시 없이 게임 진행

## 👑 관리자 기능

### 관리자 권한 확인
- **관리자 계정**: 기본값 "Kane Lee" (설정 변경 가능)
- **특별 표시**: 관리자는 톱니바퀴 ⚙️ 아이콘 표시
- **추가 권한**: 일반 사용자가 할 수 없는 기능 사용 가능

### 경매 관리
1. **톱니바퀴 클릭**: 관리자 패널 열기
2. **경매 생성**: 물품명, 시작가격, 가격 하락 간격 설정
3. **경매 시작**: 생성된 경매 목록에서 시작 버튼 클릭
4. **카운트다운**: 3-2-1 카운트다운 후 경매 시작

### 채팅 관리
- **채팅 토글**: 전체 채팅 활성화/비활성화
- **공지사항**: 메시지 앞에 `/`를 붙여 전체 공지
- **시스템 메시지**: 채팅 상태 변경 시 자동 안내

## 💡 팁과 전략

### 입찰 전략
1. **시장 가격 파악**: 비슷한 물품의 이전 낙찰가 확인
2. **타이밍 계산**: 가격 하락 속도와 패턴 관찰
3. **심리전**: 다른 참가자의 움직임 관찰
4. **빠른 반응**: 원하는 가격에 도달하면 즉시 클릭

### 소통 전략
1. **채팅 활용**: 다른 참가자들과 친밀감 형성
2. **위치 이동**: 아바타를 통해 시각적 소통
3. **대사 선택**: 승리 시 인상적인 대사로 개성 표현

### 기술적 팁
1. **안정적인 인터넷**: 지연 없는 연결로 빠른 입찰
2. **브라우저 최적화**: 최신 브라우저 사용 권장
3. **사운드 활용**: 경매 시작/종료 소리로 타이밍 파악

## 🔊 사운드 가이드

### 게임 사운드
- **경매 시작**: 경매가 시작될 때 음악 재생
- **심장박동**: 대사 선택 시 긴장감 있는 배경음
- **낙찰 완료**: 승리 시 축하 음악 재생

### 음량 조절
- **브라우저 설정**: 각 탭별 음량 조절 가능
- **시스템 음량**: 운영체제 음량 설정 활용
- **무음 모드**: 브라우저 탭 음소거 기능 사용

## 🚨 문제 해결

### 연결 문제
**문제**: 게임에 접속할 수 없어요
**해결**: 
- 서버 주소 확인
- 인터넷 연결 상태 점검
- 브라우저 새로고침 (F5)

### 입력 문제
**문제**: 이름을 입력할 수 없어요
**해결**: 
- 이미 사용 중인 이름인지 확인
- 특수문자 제거 후 재시도
- 브라우저 캐시 삭제

### 게임 플레이 문제
**문제**: 입찰 버튼이 작동하지 않아요
**해결**: 
- 경매가 진행 중인지 확인
- 브라우저 새로고침
- 다른 브라우저로 시도

### 사운드 문제
**문제**: 소리가 들리지 않아요
**해결**: 
- 브라우저 음소거 해제
- 시스템 음량 확인
- 사이트 권한 설정 확인

### 대사 시스템 문제
**문제**: 대사 선택창이 나타나지 않아요
**해결**: 
- 낙찰자인지 확인
- 브라우저 새로고침
- 관리자에게 문의

## 📞 지원 및 도움말

### 추가 지원이 필요한 경우
- **관리자 문의**: 게임 내 관리자에게 채팅으로 문의
- **기술적 문제**: 브라우저 개발자 도구 콘솔 확인
- **서버 문제**: 서버 로그 확인 또는 재시작

### 게임 규칙 문의
- **경매 방식**: 네덜란드 경매 = 높은 가격 → 낮은 가격
- **낙찰 조건**: 첫 번째 입찰자가 즉시 낙찰
- **대사 시스템**: 낙찰 후 개인 메시지 선택 및 공유

---

🎉 **즐거운 경매 게임 되세요!** 🎉

더 많은 참가자와 함께할수록 더욱 흥미진진한 경매가 됩니다.