//初始化输入框
var inputPanel;
$(function(){
    //初始化输入面板
    inputPanel = new MatrixInputPanel("input-panel-2","matrix", "DDNALib/MatrixInput/");
    inputPanel.init();

    //初始化滑动条
    $('#precision-slider').slider({
        formatter: function(value) {
            return '当前精度：' + value;
        }
    });

    $("#btn-start-computing").click(function(){
        var matrix = inputPanel.getMatrix();
        var precision = parseInt(document.forms["computing-parameters"].elements["precision"].value);
        if(matrix == null){
            alert("请先输入完矩阵再点击此按钮开始计算");
            return;
        }

        var result = DDNA.MatrixInversion.solve(matrix);
        var resultPanel = $("#result-panel");
        resultPanel.empty();
        resultPanel.append(MatrixInputPanel.Utils.matrixTeX(result, precision));

        //更新结果显示
        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, resultPanel[0]]);
        }
    });
});