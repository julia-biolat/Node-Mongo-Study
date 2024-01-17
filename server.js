const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))
//웹페이지에 DB데이터 꽂기 (EJS, 서버사이드 렌더링)
app.set('view engine', 'ejs') //ejs 세팅




//mongoDB 사용법
const{MongoClient} = require('mongodb');
let db;
const url = '' //아직 create안됨.
new MongoClient(url).connect().then((client) =>{
    console.log('DB연결성공')
    db = client.db('forum'); //내가 만든 db이름 넣기
}).catch((err)=>{
    console.log(err)
})


//기본 서버(페이지) 만드는 법
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html') //HTML로 사용하는 법
    //응답.send('반갑다') //그냥 raw하게 보여주는 법
})

app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title: '어쩌구'})
    // 응답.send('나는야 짱!><')
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지입니다')
})

//숙제: 유저가/about으로 접속하면 내 소개용 페이지 보내주기
app.get('/about', (요청, 응답)=> {
    응답.sendFile(__dirname + 'about.html')
})


//MongoDB에서 데이터 출력하기
app.get('/list', async(요청, 응답)=>{
    //데이터 출력하는 코드
    let result = await db.collection('post').find().toArray()
    console.log(result)
    // 응답.send('DB에 있던 게시물')

    
    응답.render('list.ejs', {post : result})
})