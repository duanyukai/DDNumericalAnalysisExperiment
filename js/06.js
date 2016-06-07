/**
 * Created by dyk on 6/4/16.
 */

var lagrange;

$(function(){
    //初始化输入框、按钮状态
    $("#x-input").attr("disabled",true);
    $("#btn-compute-y").attr("disabled",true);

    //绑定单选框显示隐藏次数输入框
    $('input[name="method"]').on("change", function(){
        $('#pow-input').toggle(+this.value === 2 && this.checked);
    }).change();

    $("#btn-start-computing-lagrange").click(function(){
        var i, j;

        var form = document.forms["lagrange"];
        var matrix;
        var JSONData = form.elements["lagrange-input"].value;
        try{
            matrix = JSON.parse(JSONData);
        }catch(e){
            alert("输入数据有错误，请检查");
            return;
        }

        var row = matrix.length;
        if(matrix.length != 2){
            alert("数据需要有两行（包含两个数组），请检查");
            return;
        }
        if(matrix[0].length != matrix[1].length){
            alert("两行数据个数不同，请检查");
            return;
        }
        for(i = 0; i < row; i++){
            for(j = 0; j < matrix.length; j++){
                if(typeof matrix[i][j] != "number"){
                    alert((i + 1) + "行" + (j + 1) +"列处输入值非法，请检查");
                    return;
                }
            }
        }

        var methodIndex = parseInt(form.elements["method"].value);
        if(methodIndex == 2){
            var pow = $("#pow-input").find("input").val();
            if(DDNA.Utils.isInt(pow) && parseInt(pow) > 0){
                pow = parseInt(pow);
            }else{
                alert("插值次数值有误，请检查");
                return;
            }
        }
        switch(methodIndex){
            case 1:
                lagrange = new DDNA.Interpolation.Lagrange(matrix);
                break;
            case 2:
                lagrange = new DDNA.Interpolation.PieceWiseLagrange(matrix, pow);
                break;
        }

        //获取X,Y最大最小值
        var maxX = matrix[0][0],
            maxY = matrix[1][0],
            minX = matrix[0][0],
            minY = matrix[1][0];
        for(i = 0; i < matrix[0].length; i++){
            if(matrix[0][i] > maxX)
                maxX = matrix[0][i];
            if(matrix[0][i] < minX)
                minX = matrix[0][i];
            if(matrix[1][i] > maxY)
                maxY = matrix[1][i];
            if(matrix[1][i] < maxY)
                minY = matrix[1][i];
        }

        var diffX, diffY,
            sameRatioMaxX,
            sameRatioMinX,
            sameRatioMaxY,
            sameRatioMinY;
        diffX = (maxX - minX) * 1.1;
        diffY = (maxY - minY) * 1.1;
        if(maxX - minX > maxY - minY){
            sameRatioMaxX = (maxX + minX +diffX) / 2;
            sameRatioMinX = sameRatioMaxX - diffX;
            sameRatioMaxY = (maxY + minY + diffX) / 2;
            sameRatioMinY = sameRatioMaxY - diffX;
        }else{
            sameRatioMaxX = (maxX + minX +diffY) / 2;
            sameRatioMinX = sameRatioMaxX - diffY;
            sameRatioMaxY = (maxY + minY + diffY) / 2;
            sameRatioMinY = sameRatioMaxY - diffY;
        }

        //绘图，这里先绘制xy轴等比例的
        var plot = new DDPlot("lagrange-plot",{
            initMinX: sameRatioMinX,
            initMaxX: sameRatioMaxX,
            initMinY: sameRatioMinY,
            initMaxY: sameRatioMaxY,
//        backgroundColor: "#AAA",
            hasGrid: true,
            drawGap: 4,
            autoWidth: true,
            widthHeightRatio: 1
        });

        plot.addFunction(function(x){
            return lagrange.valueOf(x);
        });

        plot.addPoints(matrix);
        plot.show();


        $("#x-input").attr("disabled", false);
        $("#btn-compute-y").attr("disabled", false);
    });

    $("#btn-compute-y").click(function(){
        var x = $("#x-input").val();
        if(!$.isNumeric(x)){
            alert("x输入的并非数值，请检查");
            return;
        }else{
            var resultPanel = $("#result-panel");
            resultPanel.empty();
            resultPanel.append("$f(" + x + ")=" + lagrange.valueOf(parseFloat(x)) + "$");

            if(typeof MathJax != "undefined"){
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, resultPanel[0]]);
            }
        }
    });


});