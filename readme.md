# aigoo-back

### How to start

npm 패키지 변경사항이 없다면

```
docker-compose up
```

npm 패키지 변경사항이 있으면, 혹은 db를 다 날리고 싶으면

```
docker-compose up --bulid
```

### 서버 접근

main-server listening on

localhost:4000

### 스웨거 API 문서

localhost:4000/swagger

### 정적파일 요청은

로컬 업로드 시

localhost:4000/files/파일url

클라우드 업로드 시

https://aigooback.blob.core.windows.net/파일url
