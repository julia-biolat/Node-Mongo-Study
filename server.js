const express = require('express')
const app = express()
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
//웹페이지에 DB데이터 꽂기 (EJS, 서버사이드 렌더링)
app.set('view engine', 'ejs') //ejs 세팅
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie: {maxAge: 60*60*1000},
  store: MongoStore.create({
    mongoUrl:'mongodb+srv://admin:ji0707@cluster0.hygough.mongodb.net/?retryWrites=true&w=majority',
    dbName: 'forum'
  })
}))

app.use(passport.session()) 


//mongoDB 사용법
const{MongoClient, ObjectId} = require('mongodb');
let db;
const url = 'mongodb+srv://admin:ji0707@cluster0.hygough.mongodb.net/?retryWrites=true&w=majority'

//접속 시작
new MongoClient(url).connect().then((client) =>{
    console.log('DB연결성공')
    db = client.db('forum'); //내가 만든 db이름 넣기
    //기본 서버(페이지) 만드는 법
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})
}).catch((err)=>{
    console.log(err)
})




app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html') //HTML로 사용하는 법
    //응답.send('반갑다') //그냥 raw하게 보여주는 법
})

app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title: '나는짱'})
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
    console.log(result[0].title)

    응답.render('list.ejs', { 글목록 : result})
})


app.get('/time', async(요청, 응답)=>{
    응답.render('time.ejs', {times: new Date()});
})

app.get('/write', (요청, 응답)=>{
    응답.render('write.ejs')
})

app.post('/add', async (요청, 응답)=>{
    console.log(요청.body)

    try{
        if(요청.body.title == ''){
            응답.send('제목 입력하시오.')
        }else{
            await db.collection('post').insertOne({title : 요청.body
                .title, content: 요청.body.content})
            응답.redirect('/list')
        }

    } catch(e){
        console.log(e)
        응답.status(500).send('서버 에러')
    }
})

app.get('/detail/:aaaa', async (요청, 응답) => {
    try {
        const id = 요청.params.aaaa;
        const post = await db.collection('post').findOne({_id: new ObjectId(id)});

        if (post) {
            응답.render('detail.ejs', { post: post });
        } else {
            응답.status(404).send('게시물을 찾을 수 없습니다.');
        }
    } catch (e) {
        console.error(e);
        응답.status(500).send('서버 에러');
    }
});

app.get('/edit/:id', async (요청, 응답) => {
    try {
        const id = 요청.params.id;
        const post = await db.collection('post').findOne({_id: new ObjectId(id)});
        if (post) {
            응답.render('edit.ejs', { post: post });
        } else {
            응답.status(404).send('게시물을 찾을 수 없습니다.');
        }
    } catch (e) {
        console.error(e);
        응답.status(500).send('서버 에러');
    }
});

app.post('/edit', async (요청, 응답) => {
    try {
        await db.collection('post').updateOne({_id: new ObjectId(요청.params.id)}, {$set: {title: 요청.body.title, content: 요청.body.content}});
        응답.redirect('/list');
    } catch (e) {
        console.log(e);
        응답.status(500).send('서버 에러');
    }
});

app.delete('/delete', async (요청, 응답) => {
    try {
        await db.collection('post').deleteOne({_id: new ObjectId(요청.query.docid)})
        응답.send('삭제 완료')
    } catch (e) {
        console.log(e);
        응답.status(500).send('서버 에러');
    }
});

app.get('/list/:id', async (요청, 응답) => {
    let result = await db.collection('collection').find().skip( (요청.params.id - 1) * 5 ).limit(5).toArray()
    응답.render('list.ejs', {list : result})
  })

app.get('list/next/:id', async(요청, 응답)=> {
    let result = await db.collection('post')
    .find({_id : {$gt : 5000}})
    .limit(5).toArray()
    응답.render('list.ejs', {글목록: result})
})


passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username : 입력한아이디})
    if (!result) {
      return cb(null, false, { message: 'DB에 아이디 없음' })
    }
  
    if (await bcrypt.compare(입력한비번, result.password)) {
      return cb(null, result)
    } else {
      return cb(null, false, { message: '비번불일치' });
    }
  }))
  
  passport.serializeUser((user, done) => {
    console.log(user)
    process.nextTick(() => {
      done(null, { id: user._id, username: user.username })
    })
  })
  
  passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })//최신 유저 정보 반영하기 위한 코드
    delete result.password
    process.nextTick(() => {
      return done(null, result)
    })
  })

  app.get('/member/login', async (요청, 응답) => {
    console.log(요청.user)
    응답.render('login.ejs')
  })
  
  app.post('/login', async (요청, 응답, next) => {
    passport.authenticate('local', (error, user, info) => {
      if (error) return 응답.status(500).json(error)
      if (!user) return 응답.status(401).json(info.message)
      요청.logIn(user, (err) => {
        if (err) return next(err)
        응답.redirect('/')
      })
    })(요청, 응답, next)
  })
  
  app.get('/register', (요청, 응답) => {
    응답.render('register.ejs')
  })
  
  app.post('/register', async (요청, 응답) => {
  
    let 해시 = await bcrypt.hash(요청.body.password, 10)
      
    await db.collection('user').insertOne({
      username : 요청.body.username,
      password : 해시
    })
    응답.redirect('/')
  })