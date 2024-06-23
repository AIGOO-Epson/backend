# AIGOO-backend

엡손 챌린지 team25 aigoo의 백엔드 repository

#### frontend repositoty

https://github.com/AIGOO-Epson/frontend

## TEAM

| <a href="https://github.com/Hoontou"><img src="https://avatars.githubusercontent.com/u/88626281?s=400&u=dd00d0aba0558bef413f4d4581088a5bba7cc2ab&v=4" width=150px alt="권도훈" /> | <a href="https://github.com/antegral"><img src="https://avatars.githubusercontent.com/u/60401462?v=4" width=150px alt="문성욱" /> |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------: |
|                                                                     **[권도훈](https://github.com/Hoontou)**                                                                      |                                             **[문성욱](https://github.com/antegral)**                                             |

## STACK

#### SERVER FRAMEWORK

Nestjs

#### DB, ORM

postgresql - typeorm , mongodb - mongoose

#### AI

LLM - Google Gemini, NLU - ETRI (과학기술정보통신부 OPEN API), OCR - Naver CLOVA OCR

#### CLOUD

AWS RDS, ATLAS mongodb, AZURE storage

#### ETC.

DOCKER, GIT

## 주요 module summary

### [/main-server/src/modules/...](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules)

### [/auth](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/auth)

사용자 인증과 JWT 토큰 관리.

### [/epson](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/epson)

EPSON CONNECT API를 사용해 복합기를 원격 제어 or 관리.

### [/korean-analyze](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/korean-analyze)

ETRI NLU OPEN API를 사용해 한국어 문장을 분석.

### [/letter](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/letter)

다른 모듈들과 협력해 손편지를 저장, 분석.

### [/study](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/study)

한국어 교육자료 생성, 관리.

### [/translate](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/translate)

Google Gemini,를 사용해 한국어 번역, 학습자료 생성.

Naver CLOVA OCR 를 사용해 손편지에서 텍스트 추출.

### [/upload](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/upload)

아이고의 사진, 손편지, 학습자료 등을 Azure Storage에 업로드.

### [/user](https://github.com/AIGOO-Epson/backend/tree/main/main-server/src/modules/user)

유저, 아티스트, 팔로우 등 유저에 관련된 전반적인 관리.

## 시작하기

### [HOW_TO_START.md](https://github.com/AIGOO-Epson/backend/blob/main/HOW_TO_START.md)
