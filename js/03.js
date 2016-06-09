


//初始化输入框
var inputPanel;
var initValueInputs = [];
$(function(){
    //绑定单选框显示隐藏omega输入框
    $('input[name="method"]').on("change", function(){
        $('#omega-input').toggle(+this.value === 3 && this.checked);
    }).change();

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

        //omega
        if(choose == 3){
            var omega = $("#omega-input").find("input").val();
            if($.isNumeric(omega)){
                omega = parseFloat(omega);
                if(omega <= 0 || omega >= 2){
                    alert("omega值应介于0到2之间，请重新输入");
                    return;
                }
            }else{
                alert("omega有误，请检查");
                return;
            }
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
            text += "<td>" + i + "</td>";
            for(i = 0; i < vector.length; i++){
                //text += "<td>" + MatrixInputPanel.Utils.beautifyFloat(vector[i], precision) + "</td>";
                text += "<td>" + vector[i].toFixed(precision) + "</td>";
            }
            //text += "<td>" + MatrixInputPanel.Utils.beautifyFloat(maxGap, precision) + "</td>";
            text += "<td>" + maxGap.toFixed(precision) + "</td>";
            text += "</tr>";
            tbody.append(text);

        };
        switch(choose){
            case 1:
                //Jacobi迭代法
                answer = DDNA.IterativeMethod.jacobiIterative(matrix.coefficientMatrix, matrix.b, initValue, epsilon, maxTimes, callback);
                break;
            case 2:
                //Gauss-Seidel迭代法，即omega为1的SOR方法
                answer = DDNA.IterativeMethod.gaussSeidelIterative(matrix.coefficientMatrix, matrix.b, initValue, epsilon, maxTimes, callback);
                break;
            case 3:
                //SOR迭代法
                answer = DDNA.IterativeMethod.SORIterative(matrix.coefficientMatrix, matrix.b, initValue, epsilon, maxTimes, omega, callback);
                break;
        }

        //更新结果显示
        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, resultPanel[0]]);
        }
    });
});