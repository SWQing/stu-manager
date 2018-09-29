var express = require('express');
var router = express.Router();

var stuDAO = require("../bin/stuDAO.js");

//      use("/stu");

//将本路由中所有的接口都加一个1秒的延迟
/*router.use((req,res,next)=>{
  setTimeout(function() {
    next();
  }, 1000);
});*/

/* 添加学生接口 */
router.post("/add",function(req,res){
  var s = new stuDAO(req.body);
  s.save().then(function(){
    res.json({err:0,msg:"添加成功"});
  }).catch(function(){
    res.json({err:1,msg:"添加失败"});
  });
});

//按照条件查询某一页的学生
router.get("/",function(req,res){
  // console.log(req.query);
  //从参数中过滤出查询条件
    //查询条件
  var condition = {};
  //如果发过来的请求包含这些参数, 那么我们就把这些参数作为查询条件来用
    // age = 18 查询年龄是18的学生列表
  if(req.query.age){
    condition.age = req.query.age
  }
  //gender = 男, 查询性别是男的学生列表
  if(req.query.gender){
    condition.gender = req.query.gender
  }
  if(req.query.name){
    condition.name = new RegExp(req.query.name);
  }
  if(req.query.tel){
    condition.tel = new RegExp(req.query.tel);
  }

  //排序条件
    //如果请求中带有sortByAge参数, 那么我们就按照age的大小进行排序
  var sortCon = {};
  if(req.query.sortByAge){
    sortCon.age = req.query.sortByAge=="升序"?1:-1;
  }

  //先查询数据库中一共有多少条数据
  stuDAO.find(condition).count().then(function(c){
    //然后再查询某一页的数据
      console.log(req.query)
    stuDAO.find(condition)
        .sort(sortCon)
        .skip(req.query.page*10)//从哪开始查
        .limit(10)//查询多少条
        .then(function(data){
      //返回的数据中除了有这一页的内容，还有数据总条数。
      res.json({err:0,data:data,count:c});
    }).catch(function(err){
      res.json({err:0,msg:"查询失败"});
    });

  });

});

//删除接口
router.get("/delete",(req,res)=>{
  stuDAO.remove(req.query).then(function(){
    res.json({err:0,msg:"删除成功"});
  });
});

//修改接口
router.get("/edit",(req,res)=>{
  stuDAO.update({_id:req.query._id},{
    $set:{
      tel:req.query.tel,
      age:req.query.age,
      gender:req.query.gender,
    }
  })
  .then(()=>{
    res.json({err:0,msg:"修改成功"});
  });

});




module.exports = router;


//http://www.kuaidi100.com/query?postid=886181152366499146&type=yuantong