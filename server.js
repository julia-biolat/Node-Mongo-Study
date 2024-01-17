const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))

app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
    //응답.send('반갑다') 
})

app.get('/sendpage', (요청, 응답) => {
    응답.send('나는야 짱!><')
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지입니다')
})

//숙제: 유저가/about으로 접속하면 내 소개용 페이지 보내주기
app.get('/about', (요청, 응답)=> {
    응답.sendFile(__dirname + 'about.html')
})
