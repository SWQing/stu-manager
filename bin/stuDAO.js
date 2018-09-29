var mongoose = require("mongoose");

var cn = mongoose.connect("mongodb://127.0.0.1/stu_mgr", {
    useMongoClient : true
});

cn.on("open",function(){
    console.log("数据库已连接");
});

cn.on("error",function(){
    console.log("数据库连接失败");
});

//模子, 定义数据的字段和类型
var studentsSchema = new mongoose.Schema({
    name:String,
    age:Number,
    gender:String,
    tel:String
});

//生成一个模型students
var studentsDAO = mongoose.model("students",studentsSchema);

module.exports = studentsDAO;