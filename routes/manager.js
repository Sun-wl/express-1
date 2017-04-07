var express = require('express');
var dbUtil = require("dbUtil");
var router = express.Router();

/**
 * 过滤器（中间件），表示只有用户登录之后才能对课程信息进行操作
 * http://localhost:3000/manager/toCourses
 * */
router.use("/",function (req, res, next) {
    if(req.session.student){
        //说明已经登录,放行
        next();
    } else{
       res.redirect("/toLogin?msg=您无权访问，需要先登录");
    }
});

/*
 * 跳转到课程管理页面
 * */
router.get('/toCourses', function(req, res, next) {
    // 查询所有课程信息
    var sql = "select * from tbl_courses";
    dbUtil.execute(sql,[],function (result) {
        res.render("courses/courses",{"currentPage":"courses","courses":result});
    });
});
/**
 * 跳转到添加课程的页面
 * */
router.get('/toAddCourse', function(req, res, next) {
    // 查询所有课程信息
    res.render("courses/addCourse",{});
});

/**
 * 处理添加课程的请求
 * */
router.post("/course",function (req, res, next) {
    //res.send(req.body);
    //将数据保存到数据库中
    var sql = "insert into tbl_courses set ?";
    dbUtil.execute(sql, req.body, function () {
        res.redirect("/manager/toCourses");
    });
});

/**
 * 处理删除课程的请求
 * */
router.get("/deleteCourse",function (req, res, next) {
    var id = req.query.id;
    if(id){
        var sql = "delete from tbl_courses where id = ?";
        dbUtil.execute(sql, [id], function (result) {
            res.redirect("/manager/toCourses");
        });
    }else {
        res.redirect("/manager/toCourses");
    }
});

module.exports = router;
