/**
 * Created by dyk on 6/4/16.
 */
// var answer1 = DDNA.IterativeMethod.simpleIterative(function(x){
//     return (3 * x + 1) / (x * x);
// },2,0.001,100);
// console.log(answer1);
//
// var answer2 = DDNA.IterativeMethod.simpleIterative(function(x){
//     return (x * x * x - 1) / 3;
// },2,0.001,100);
// console.log(answer2);
//
// var answer3 = DDNA.IterativeMethod.simpleIterative(function(x){
//     return Math.pow(3 * x + 1, 1 / 3);
// },2,0.001,100);
// console.log(answer3);
//
// var answer4 = DDNA.IterativeMethod.simpleIterative(function(x){
//     return 1 / (x * x - 3);
// },2,0.001,100);
// console.log(answer4);
//
// var answer5 = DDNA.IterativeMethod.simpleIterative(function(x){
//     return Math.sqrt(3 + 1 / x);
// },2,0.001,100);
// console.log(answer5);
//
// var answer6 = DDNA.IterativeMethod.simpleIterative(function(x){
//     return x - 1 / 3 * ((x * x * x - 3 * x - 1) / (x * x - 1));
// },2,0.001,100);
// console.log(answer6);

$(function(){
    //初始化滚动条
    $('#precision-slider').slider({
        formatter: function(value) {
            return '当前精度：' + value;
        }
    });

    $("#btn-start-computing").click(function(){
        var i, j;

        var form = document.forms["computing-parameters"];
        var precision = parseInt(form.elements["precision"].value);

        var functionStr = "var iterateFunction = function(x){";
        functionStr += "return "+ form.elements["function-input"].value + ";}";
        try{
            eval(functionStr);
        }catch(e){
            alert("迭代格式输入有误，请检查");
            return;
        }

        if($.isNumeric(form.elements["init-value"].value)){
            var initValue = parseFloat(form.elements["init-value"].value);
        }else{
            alert("初始值输入有误，非数值，请检查");
            return;
        }

        if($.isNumeric(form.elements["epsilon"].value)){
            var epsilon = parseFloat(form.elements["epsilon"].value);
        }else{
            alert("终止迭代精度输入有误，非数值，请检查");
            return;
        }

        if($.isNumeric(form.elements["max-iterate-times"].value)){
            var maxTimes = parseFloat(form.elements["max-iterate-times"].value);
        }else{
            alert("最大迭代次数输入有误，非数值，请检查");
            return;
        }

        var resultPanel = $("#result-panel");
        resultPanel.empty();

        //构建表格
        (function(){
            var table = "";
            var tbl = document.createElement('table');
            var tr, td, text;
            tbl.className = "result-table";

            var thead = "<thead><tr><th>k</th>";
            thead += "<th>$x_{k}$</th>>";
            thead += "<th>$|x_k-x_{k-1}|$</th></tr></thead>";

            var tbody = "<tbody><tr>";
            tbody += "<td>0</td>";
            tbody += "<td>" + initValue + "</td>";
            tbody += "<td>-</td></tr></tbody>";
            $(tbl).append(thead);
            $(tbl).append(tbody);
            $(resultPanel).append(tbl);
        })();


        var answer;
        var tbody = $(resultPanel).find("tbody");
        var callback = function(i, value, gap){
            var text = "<tr>";
            text += "<td>" + (i + 1) + "</td>";
            text += "<td>" + MatrixInputPanel.Utils.beautifyFloat(value, precision) + "</td>";
            text += "<td>" + MatrixInputPanel.Utils.beautifyFloat(gap, precision) + "</td>";
            text += "</tr>";
            tbody.append(text);

        };

        //简单迭代法迭代法
        answer = DDNA.IterativeMethod.simpleIterative(iterateFunction, initValue, epsilon, maxTimes, callback);



        //更新结果显示
        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, resultPanel[0]]);
        }
    });
});