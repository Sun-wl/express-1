/**
 * Created by licy on 2017/3/7.
 */

$(function () {
    $(".addBtn").off().on("click",function () {
        $(".container").empty().load("/manager/toAddCourse");
    });


    /*
    $(".submitBtn").off().on("click",function () {
        $("#courseForm").submit();
    });
    */
});