console.log(DDNA.Utils.matrixMultiply([
    [1,2,3],
    [4,5,6]
],[
    [1,2],
    [3,4],
    [5,6]
]));

//初始化输入框
var inputPanel;
$(function(){
//初始化输入面板
    inputPanel = new MatrixInputPanel("input-panel","equation", "DDNALib/MatrixInput/");
    inputPanel.init();

    //初始化滑动条
    $('#precision-slider').slider({
        formatter: function(value) {
            return '当前精度：' + value;
        }
    });

    //开始计算按钮
    $("#btn-start-computing").click(function(){
        var i, j;
        var choose = parseInt(document.forms["compute-method"].elements["method"].value);
        var precision = parseInt(document.forms["compute-method"].elements["precision"].value);
        var process = document.forms["compute-method"].elements["process"].checked;
        var resultPanel = $("#result-show");
        var matrix = inputPanel.getMatrix();
        //判断矩阵是否已经输入
        if(matrix.length == 0){
            alert("请输入完成矩阵后再开始计算");
            return;
        }

        //开始计算
        resultPanel.empty();

        //解向量
        var result;

        var stepNum = 1;

        var callback = function(matrix){
            var div = document.createElement("div");
            var title = document.createElement("p");
            title.appendChild(document.createTextNode("第" + stepNum + "步"));
            div.appendChild(title);
            div.appendChild(document.createTextNode(MatrixInputPanel.Utils.matrixTeX(matrix, precision)));

            resultPanel.append(div);

            stepNum++;
        };
        var copiedMatrix = DDNA.Utils.copyMatrix(matrix);
        //不同的计算方式
        switch(choose){
            case 1:
                //高斯顺序消元法
                resultPanel.append("输入的线性方程组为：<br>");
                resultPanel.append(MatrixInputPanel.Utils.augmentedMatrixTeX(matrix, precision));

                if(process){
                    result = DDNA.GaussElimination.eliminateInOrder(copiedMatrix, callback);
                }else{
                    result = DDNA.GaussElimination.eliminateInOrder(copiedMatrix);
                }
                break;
            case 2:
                //高斯列主元消元法
                resultPanel.append("输入的线性方程组为：<br>");
                resultPanel.append(MatrixInputPanel.Utils.augmentedMatrixTeX(matrix, precision));

                if(process){
                    result = DDNA.GaussElimination.eliminateWithOutPCA(copiedMatrix, callback);
                }else{
                    result = DDNA.GaussElimination.eliminateWithOutPCA(copiedMatrix);
                }
                break;
            case 3:
                //平方根法
                for(i = 0; i < matrix.length; i++){
                    for(j = i + 1; j < matrix.length; j++){
                        matrix[i][j] = matrix[j][i];
                    }
                }
                resultPanel.append("输入的线性方程组为：<br>");
                resultPanel.append(MatrixInputPanel.Utils.augmentedMatrixTeX(matrix, precision));

                var decomposed = MatrixInputPanel.Utils.decomposeAugmentedMatrix(matrix);
                if(process){
                    result = DDNA.SquareRootMethod.defaultSolve(decomposed.coefficientMatrix, decomposed.b);
                }else{
                    result = DDNA.SquareRootMethod.defaultSolve(decomposed.coefficientMatrix, decomposed.b);
                }
                break;
            case 4:
                //改进的平方根法
                for(i = 0; i < matrix.length; i++){
                    for(j = i + 1; j < matrix.length; j++){
                        matrix[i][j] = matrix[j][i];
                    }
                }

                break;
            case 5:
                //追赶法
                
                break;
        }
        //输出向量结果
        //resultPanel.empty();
        if(result == null){
            resultPanel.append("无解或有无穷多的解");
            return;
        }
        if(choose == 1 || choose == 2){
            //高斯法多输出三角分解式
            resultPanel.append("三角分解式为：<br>");
            console.log(result);
            resultPanel.append(MatrixInputPanel.Utils.luDecomposeTeX(result.matrixL, result.matrixU, result.rightVector, precision));
            result = result.result;
        }

        //追加最终结果
        var div = document.createElement("div");
        var title = document.createElement("p");
        title.appendChild(document.createTextNode("最终结果："));
        div.appendChild(title);
        div.appendChild(document.createTextNode(MatrixInputPanel.Utils.vectorTeX(result, precision)));
        resultPanel.append(div);

        MathJax.Hub.Queue(["Typeset",MathJax.Hub, resultPanel[0]]);


    });
});
