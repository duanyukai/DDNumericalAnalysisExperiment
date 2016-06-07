/**
 * Created by dyk on 6/4/16.
 */
// var matrix0 = [
//     [ 10,   3,   1],
//     [  2, -10,   3],
//     [  1,   3,  10]
// ];
// var vector0 =
//     [ 14,  -5,  14];
//
// var matrix1 = [
//     [  4,   2,  -3,  -1,   2,   1,   0,   0,   0,   0],
//     [  8,   6,  -5,  -3,   6,   5,   0,   1,   0,   0],
//     [  4,   2,  -2,  -1,   3,   2,  -1,   0,   3,   1],
//     [  0,  -2,   1,   5,  -1,   3,  -1,   1,   9,   4],
//     [ -4,   2,   6,  -1,   6,   7,  -3,   3,   2,   3],
//     [  8,   6,  -8,   5,   7,  17,   2,   6,  -3,   5],
//     [  0,   2,  -1,   3,  -4,   2,   5,   3,   0,   1],
//     [ 16,  10, -11,  -9,  17,  34,   2,  -1,   2,   2],
//     [  4,   6,   2,  -7,  13,   9,   2,   0,  12,   4],
//     [  0,   0,  -1,   8,  -3, -24,  -8,   6,   3,  -1]
// ];
// var vector1 =
//     [  5,  12,   3,   2,   3,  46,  13,  38,  19, -21];
// var matrix2 = [
//     [  4,   2,  -4,   0,   2,   4,   0,   0],
//     [  2,   2,  -1,  -2,   1,   3,   2,   0],
//     [ -4,  -1,  14,   1,  -8,  -3,   5,   6],
//     [  0,  -2,   1,   6,  -1,  -4,  -3,   3],
//     [  2,   1,  -8,  -1,  22,   4, -10,  -3],
//     [  4,   3,  -3,  -4,   4,  11,   1,  -4],
//     [  0,   2,   5,  -3, -10,   1,  14,   2],
//     [  0,   0,   6,   3,  -3,  -4,   2,  19]
// ];
// var vector2 =
//     [  0,  -6,   6,  23,  11, -22, -15,  45];
//
// var answer1 = DDNA.IterativeMethod.jacobiIterative(matrix0,vector0,[0,0,0],0.001,100);
// console.log(answer1);
// console.log("______________________________");
// var answer2 = DDNA.IterativeMethod.jacobiIterative(matrix1,vector1,[1,-1,0,1,2,0,3,1,-1,3],0.001,100);
// console.log(answer2);




//////////////////////////////////////////////////////////////////
var inputPanel;
var initValueInputs = [];
$(function(){
    //处理动态生成初始值输入框
    var finishCallback = function(){
        var initValuePanel = $("#init-value-input");
        initValuePanel.empty();
        initValueInputs = [];
        for(var i = 0; i < inputPanel.size; i++){
            var element = "<span class='init-input-element'><span>" + "$x_{" + (i + 1) + "}^{(0)}=$" + "</span></span>";
            var input = document.createElement("input");
            initValueInputs.push(input);
            initValuePanel.append(element);
            initValuePanel.children().last().append(input);
            initValuePanel.append("<br>");
        }
        console.log(initValueInputs);
        //更新结果显示
        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, initValuePanel[0]]);
        }
    };

    //初始化输入面板
    inputPanel = new MatrixInputPanel("input-panel","equation", "DDNALib/MatrixInput/", null, finishCallback);
    inputPanel.init();

    //初始化滑动条
    $('#precision-slider').slider({
        formatter: function(value) {
            return '当前精度：' + value;
        }
    });


    $("#btn-start-computing").click(function(){
        var i, j;

        var matrix = inputPanel.getDecomposedAugmentedMatrix();
        var form = document.forms["computing-parameters"];
        var choose = parseInt(form.elements["method"].value);
        var precision = parseInt(form.elements["precision"].value);
        var initValue = [];
        for(i = 0; i < inputPanel.size; i++){
            if($.isNumeric(initValueInputs[i].value)){
                initValue[i] = parseFloat(initValueInputs[i].value);
            }else{
                alert("第" + (i + 1) + "个初始值输入有误，非数值，请检查");
                return;
            }
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

        if(matrix == null){
            alert("请先输入完矩阵再点击此按钮开始计算");
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
            for(i = 0; i < inputPanel.size; i++)
                thead += "<th>$x_{" + (i + 1) + "}^{(k)}$</th>>";
            thead += "<th>$||x^{(k)}-x^{*}||_{\\infty}$</th></tr></thead>";

            var tbody = "<tbody><tr>";
            tbody += "<td>0</td>";
            for(i = 0; i < inputPanel.size; i++)
                tbody += "<td>" + initValue[i] + "</td>";
            tbody += "<td>-</td></tr></tbody>";
            $(tbl).append(thead);
            $(tbl).append(tbody);
            $(resultPanel).append(tbl);
        })();


        var answer;
        var tbody = $(resultPanel).find("tbody");
        var callback = function(i, vector, maxGap){
            var text = "<tr>";
            text += "<td>" + (i + 1) + "</td>";
            for(i = 0; i < vector.length; i++){
                text += "<td>" + MatrixInputPanel.Utils.beautifyFloat(vector[i], precision) + "</td>";
            }
            text += "<td>" + MatrixInputPanel.Utils.beautifyFloat(maxGap, precision) + "</td>";
            text += "</tr>";
            tbody.append(text);

        };
        switch(choose){
            case 1:
                //Jacobi迭代法
                answer = DDNA.IterativeMethod.jacobiIterative(matrix.coefficientMatrix, matrix.b, initValue, epsilon, maxTimes, callback);
                console.log(answer);
                break;
            case 2:
                //Gauss-Seidel迭代法
                break;
            case 3:
                //SOR迭代法
                break;
        }


        // resultPanel.append(MatrixInputPanel.Utils.matrixTeX(result, precision));

        //更新结果显示
        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, resultPanel[0]]);
        }
    });
});