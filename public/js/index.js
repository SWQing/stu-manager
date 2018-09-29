//记录弹出层索引。
var index;

//总页数
var totalPage = 0;

//搜索条件
var condition = {};
condition.page = 0;

//当页的学生信息数组
var stuArr;

//对所有的ajax请求进行发送前和完成后的配置
$.ajaxSetup({
    beforeSend(){
        index = layer.load(1,{
            shade:[0.1,"#000"]
        });
    },
    complete(){
        layer.close(index);
    }
});

$('#add-modal').on('shown.bs.modal', function () {
  $('#name').focus();
});

//添加学生提交按钮
$("#add-commit").on("click",function(){
    var paramStr = $("#add-form").serialize();//name=swq&age=20&gender=男&tel=18337061774
    $.post("/stu/add",paramStr)//参数1: 发送地址, 参数2: 携带的数据
        .done(function(data){ //data就是服务器返回的数据
            //数据返回后应该做的操作
            //1.比如说, 用户提示
            //2.显示数据
            //3.跳转
            layer.msg(data.msg,{
                time:1500
            });
            if(!data.err){
                $("#add-form")[0].reset();
                // $("#add-modal").modal("hide");
            }
        });
});

//提交搜索条件按钮
$("#search-commit").on("click",function(){
    var paramArr = $("#search-form").serializeArray();
    //****重置搜索条件
    condition = {};
    condition.page = 0;

    //根据条件表单中的input值，如果这个条件有值，则加入condition对象。
    paramArr.forEach(function(element) {
        if(element.value){
            condition[element.name] = element.value;
        }
    });
    
    //进行条件查询
    queryStuOfPage();

    $("#search-modal").modal("hide");

    //重置条件列表
    resetConditionList();
});

//重置条件列表
function resetConditionList(){
    //先清空上次的条件
    $("#condition-list").html("");

    //根据本次的条件向列表中加入条件选项
    for(var k in condition){
        if(k=="page"){
            continue;
        }
        var des = {
            name:"姓名",
            age:"年龄",
            gender:"性别",
            tel:"电话",
            sortByAge:"按年龄排序"
        }
        //创建一个显示条件的div
        var itemHTML = `
            <div class="btn-group con-item">
                <button type="button" class="btn btn-danger">${des[k]}:${condition[k]}</button>
                <button type="button" class="btn btn-danger" onclick="clockBtnClick(event)" con="${k}">
                    <span class="glyphicon glyphicon-remove"></span>
                </button>
            </div>
        `;
        $(itemHTML).appendTo($("#condition-list"));
    }
}

//请求某一页的学生
function queryStuOfPage(){
    $.get("/stu",condition)//默认从0开始
        .done(function(data){
        stuArr = data.data;//10条数据
        // console.dir(data);
        //渲染table
            //EJS解析过的HTML字符串
        var htmlStr = new EJS({url:"/tpl/stu-list.ejs"}).render(data);
        $("#stu-table").html(htmlStr);

        //渲染分页符
        //计算总页数
        var pageCount = Math.ceil(data.count/10);
        totalPage = pageCount;
        var pagerStr = new EJS({url:"/tpl/pager.ejs"}).render({
            pageCount:pageCount,
            currentPage:condition.page
        });
        $("#pager").html(pagerStr);
    });
}

//页面启动之后立刻请求学生信息
queryStuOfPage();


//分页符的点击函数
//.delegate，事件代理，可以将一个元素的事件代理给另一些元素。可以实现为页面中尚不存在的元素添加事件监听。
$(document).delegate(".page-num","click",function(e){
    //通过所点击的a标签的父元素(li)的ind属性，可以知道点击的是第几页。
    var page = $(e.target).parent().attr("ind");
    if(page==condition.page){
        return;
    }
    condition.page = page;
    queryStuOfPage();
});

//左翻页
function leftClick(){
    if(condition.page<=0){
        return;
    }
    condition.page--;
    queryStuOfPage();
}

//右翻页
function rightClick(){
    if(condition.page>=totalPage-1){
        return;
    }
    condition.page++;
    queryStuOfPage();
}

//关闭条件按钮函数
function clockBtnClick(e){
    //通过button的自定义属性确定要删除的条件
    var key = $(e.target).attr("con");
    //从搜索条件对象condition中删除这个条件
    delete condition[key];
    //从页面上删除这个条件选项。
    $(e.target).parent().remove();
    //发起请求
    queryStuOfPage();
}


//按照年龄排序按钮
function ageHeadClick(){
    if(!condition.sortByAge){
        condition.sortByAge = "降序";
    }else{
        if(condition.sortByAge == "降序"){
            condition.sortByAge = "升序";
        }else{
            condition.sortByAge = "降序";
        }
    }
    resetConditionList();
    queryStuOfPage();
}

//删除按钮
function deleteBtnClick(e){
    var index = layer.confirm("确定要删除此项吗？一旦删除不可恢复",{
        btn:["取消","删除"],
        skin:"confirm-btn"
    },function(){
        layer.close(index);
    },function(){
        //发送删除请求
        $.get("/stu/delete",{_id:$(e.target).attr("stu-id")})
        .then(function(data){
            if(!data.err){
                layer.msg(data.msg);
                queryStuOfPage();
            }
        });
        layer.close(index);
    });
}

//记录要编辑的学生的id
var editStuID;

//编辑按钮
function editBtnClick(e){
    //获取所点击的行的索引
    var ind = $(e.target).attr("stu-ind");
    //根据索引从当页学生数组中取出对应的学生对象
    var s = stuArr[ind];
    //用该学生对象的信息填充编辑表单
    editStuID = s._id;
    $("#edit-name").val(s.name);
    $("#edit-tel").val(s.tel);
    $("#edit-age").val(s.age);
    if(s.gender=="男"){
        $("#male").prop("checked",true);
    }else{
        $("#female").prop("checked",true);
    }
    //显示编辑模态框
    $("#edit-modal").modal("show");
}

//提交修改信息
$("#edit-commit").on("click",function(){
    //模态框消失
    $("#edit-modal").modal("hide");
    //提取修改表单的数据
    var paramStr = $("#edit-form").serialize();
    //将id拼接在参数中
    paramStr+="&_id="+editStuID;
    //发起修改请求
    $.get("/stu/edit",paramStr)
    .done(data=>{
        layer.msg(data.msg);
        //修改之后重新请求页面数据
        queryStuOfPage();
    });
});