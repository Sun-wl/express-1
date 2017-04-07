var express = require('express');
var dbUtil = require("dbUtil");
var router = express.Router();

//过滤器，中间件
router.use("/",function (req, res, next) {
    //将session中的学生信息维护到locals中，为了能够让jade直接访问到
    res.locals.student = req.session.student;
    next();
});

/*
 * 路由，用来匹配http://ip:port/ => http://localhost:3000/
 */
router.get('/', function(req, res, next) {
    res.redirect("/toIndex");
});
/*
* 路由，用来匹配http://ip:port/toIndex => http://localhost:3000/toIndex
* */
router.get('/toIndex', function(req, res, next) {
    //res.locals可以存放变量，并且可以再jade中直接访问res.locals中的变量
    res.locals.currentPage = "index";
    //渲染index.jade文件，并且将渲染好的index.html发送到浏览器
    res.render('index');
});

/* GET home page. */
router.get('/toLogin', function(req, res, next) {
    res.locals.currentPage = "login";
    res.locals.msg = req.query.msg;//将查询字符串中的msg放入到locals中，这样就可以再jade中访问msg
    res.render('login');
});

/* 跳转到注册页面. */
router.get('/toRegister', function(req, res, next) {
    res.locals.currentPage = "register";
    res.locals.msg = req.query.msg;
    res.render('register');
});

router.get('/test', function(req, res, next) {
    res.render(req.session);
});

/**
 * 处理退出功能
 * */
router.get("/logout",function (req, res, next) {
    req.session.student = null;
    res.redirect("/toIndex");
});
/**
 * 处理登录请求
 * */
router.post("/login",function (req, res, next) {
    //1. 接受用户提交的参数
    var username = req.body.username;
    var password = req.body.password;
    //2. 进行用户的验证
    /*
    * 1) 通过username去数据库中查找是否该用户存在
    * 2) 如果该用户存在，获取该用户的密码，然后与password比较，如果相同说明登录成功，否则重新登录
    * 3) 登录成功后将用户的信息保存到session中
    * session是一次回话，登用户第一次访问服务的时候就创建了该session，会一直维护在服务器的内存中，直到手动删除或者是过期
    * */
    var sql = "select * from tbl_student where username = ?";
    dbUtil.execute(sql,[username],function (result) {
        if(result && result.length>0){
            var student = result[0];
            if(student.password == password){
                //登录成功
                //将登陆者的信息维护到session中
                req.session.student = student;
                res.redirect("/toIndex");
            } else {
                //密码不匹配
                res.redirect("/toLogin?msg=密码不匹配");
            }
        } else {
            //用户不存在
            res.redirect("/toLogin?msg=该用户不存在");
        }
    });

});

/* 
* 处理注册请求
* */
router.post('/register', function(req, res, next) {
    //1. 接收到用户提交的参数
    var student = req.body;
    if(student.password == student.repassword){
        var sql = "select * from tbl_student where username = ?";
        dbUtil.execute(sql, [student.username],function (result) {
            if(result && result.length>0){
                res.redirect("/toRegister?msg=注册失败！该用户名已经被占用");
            } else{
                //该用户名尚未被占用
                //2. 如果参数无误，将学生信息保存到数据库中
                delete student.repassword;
                var sql = "insert into tbl_student set ?";
                dbUtil.execute(sql , student , function () {
                    //插入成功，跳转登录页面 toLogin
                    res.redirect("/toLogin");
                });
            }
        });

    } else {
        //跳转到注册页面，继续注册，错误信息提示
        res.redirect("/toRegister?msg=您两次密码输入不一致");
    }
});



module.exports = router;
