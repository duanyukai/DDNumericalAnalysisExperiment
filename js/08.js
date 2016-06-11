$(function(){
    $("#btn-start-computing").click(function(){
        var i, j;

        var form = document.forms["computing-parameters"];
        var hasRho = false;
        var matrix;

        //读取x,y,rho数据
        var JSONData = form.elements["data-input"].value;
        try{
            matrix = JSON.parse(JSONData);
        }catch(e){
            alert("输入数据有错误，请检查");
            return;
        }

        var row = matrix.length;
        if(row == 2){
            hasRho = false;
        }else if(row == 3){
            hasRho = true;
        }else{
            alert("数据需要有两行（包含x与y）或三行（包括x,y与rho），请检查");
            return;
        }
        if(matrix[0].length != matrix[1].length || (hasRho == true && matrix[1].length != matrix[2].length)){
            alert("每行数据个数不同，请检查");
            return;
        }
        //检查数据的合法性
        for(i = 0; i < row; i++){
            for(j = 0; j < matrix.length; j++){
                if(typeof matrix[i][j] != "number"){
                    alert((i + 1) + "行" + (j + 1) +"列处输入值非法，请检查");
                    return;
                }
            }
        }
        //读取多项式次数
        var pow = form.elements["pow"].value;
        if(DDNA.Utils.isInt(pow) && parseInt(pow) > 0){
            pow = parseInt(pow);
        }else{
            alert("多项式次数值有误，请检查");
            return;
        }

        //计算最小二乘法多项式拟合
        var lsm;
        if(hasRho)
            lsm = new DDNA.LeastSquareMethod.PolynomialMethod(pow, matrix[0], matrix[1], matrix[2]);
        else
            lsm = new DDNA.LeastSquareMethod.PolynomialMethod(pow, matrix[0], matrix[1]);

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
        var plot = new DDPlot("plot",{
            initMinX: sameRatioMinX,
            initMaxX: sameRatioMaxX,
            initMinY: sameRatioMinY,
            initMaxY: sameRatioMaxY,
            hasGrid: true,
            drawGap: 4,
            autoWidth: true,
            widthHeightRatio: 1
        });

        plot.addFunction(function(x){
            return lsm.valueOf(x);
        });

        plot.addPoints(matrix);
        plot.show();

        //多项式系数输出
        var coPanel = $("#coefficient");
        coPanel.empty();

        var co = lsm.getCoefficients();
        for(i = 0; i < co.length; i++){
            coPanel.append("$a_" + i + "=" + co[i] + "$<br>");
        }

        //误差分析
        var errorPanel = $("#error-analysis");
        errorPanel.empty();

        //TODO 精度条
        //TODO 显示拟合式子
        var errorTable = "<table class='data-table'><tr><td>$t_j$</td>";
        for(i = 0; i < matrix[0].length; i++){
            errorTable += "<td>" + matrix[0][i] + "</td>";
        }
        errorTable += "</tr><tr><td>$y_j$</td>";
        for(i = 0; i < matrix[1].length; i++){
            errorTable += "<td>" + matrix[1][i] + "</td>";
        }
        errorTable += "</tr><tr><td>$y(t_j)$</td>";
        for(i = 0; i < matrix[0].length; i++){
            errorTable += "<td>" + (lsm.valueOf(matrix[0][i])).toFixed(10) + "</td>";
        }
        errorTable += "</tr><tr><td>$|y(t_j)-y_j|$</td>";
        for(i = 0; i < matrix[0].length; i++){
            errorTable += "<td>" + (Math.abs(lsm.valueOf(matrix[0][i]) - matrix[1][i])).toFixed(10) + "</td>";
        }
        errorTable += "</tr></table>";

        errorPanel.append(errorTable);

        //更新公式
        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, coPanel[0]]);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, errorPanel[0]]);
        }
    });
});