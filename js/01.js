
var matrix = [
    [ 2, -4,  2,  2],
    [ 1,  2,  3,  3],
    [-3, -2,  5,  1]
];
var matrix2 = [
    [  4,   2,  -3,  -1,   2,   1,   0,   0,   0,   0,   5],
    [  8,   6,  -5,  -3,   6,   5,   0,   1,   0,   0,  12],
    [  4,   2,  -2,  -1,   3,   2,  -1,   0,   3,   1,   3],
    [  0,  -2,   1,   5,  -1,   3,  -1,   1,   9,   4,   2],
    [ -4,   2,   6,  -1,   6,   7,  -3,   3,   2,   3,   3],
    [  8,   6,  -8,   5,   7,  17,   2,   6,  -3,   5,  46],
    [  0,   2,  -1,   3,  -4,   2,   5,   3,   0,   1,  13],
    [ 16,  10, -11,  -9,  17,  34,   2,  -1,   2,   2,  38],
    [  4,   6,   2,  -7,  13,   9,   2,   0,  12,   4,  19],
    [  0,   0,  -1,   8,  -3, -24,  -8,   6,   3,  -1, -21]
];
var matrix3 = [
    [  4,   2,  -4,   0,   2,   4,   0,   0],
    [  2,   2,  -1,  -2,   1,   3,   2,   0],
    [ -4,  -1,  14,   1,  -8,  -3,   5,   6],
    [  0,  -2,   1,   6,  -1,  -4,  -3,   3],
    [  2,   1,  -8,  -1,  22,   4, -10,  -3],
    [  4,   3,  -3,  -4,   4,  11,   1,  -4],
    [  0,   2,   5,  -3, -10,   1,  14,   2],
    [  0,   0,   6,   3,  -3,  -4,   2,  19]
];
var matrix4 =
    [  0,  -6,   6,  23,  11, -22, -15,  45];

var answer1 = DDNA.GaussElimination.eliminateInOrder(matrix2);
console.log(answer1);
var answer2 = DDNA.GaussElimination.eliminateWithOutPCA(matrix3);
console.log(answer2);

//实用函数及格式化函数
//判断是否为整数
function isInt(value){
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}
//转换给定精度的浮点数
var beautifyFloat = function(number, precision){
    if(typeof number == "number"){
        if(isInt(precision) && (precision >= 0 || precision <= 16)){
            return parseFloat(number.toFixed(precision));
        }else{
            return number;
        }
    }else{
        throw new Error("传入参数非数字");
    }
};

//从增广矩阵中提取系数矩阵和向量b
var decomposeAugmentedMatrix = function(augmentedMatrix){
    var i, j;
    var coefficientMatrix = [];
    var b = [];
    for(i = 0; i < augmentedMatrix.length; i++){
        coefficientMatrix[i] = [];
        for(j = 0; j < augmentedMatrix[i].length - 1; j++){
            coefficientMatrix[i][j] = augmentedMatrix[i][j];
        }
        b[i] = augmentedMatrix[i][j];
    }
    return {
        coefficientMatrix: coefficientMatrix,
        b: b
    };
};
//转换增广矩阵的TeX表示形式
var augmentedMatrixTeX = function(augmentedMatrix, precision){
    var i, j;
    var matrixTeX = "";
    matrixTeX += "$\\begin{equation} ";
    matrixTeX += "\\begin{bmatrix} ";
    //系数矩阵
    for(i = 0; i < augmentedMatrix.length; i++){
        for(j = 0; j < augmentedMatrix[i].length - 2; j++){
            matrixTeX += beautifyFloat(augmentedMatrix[i][j], precision);
            matrixTeX += " & ";
        }
        matrixTeX += beautifyFloat(augmentedMatrix[i][augmentedMatrix[i].length - 2], precision);
        matrixTeX += " \\\\ ";
    }
    matrixTeX = matrixTeX.slice(0, -3);
    matrixTeX += "\\end{bmatrix}";
    //未知数
    matrixTeX += "\\begin{bmatrix} ";
    for(i = 0; i < augmentedMatrix.length; i++){
        matrixTeX += "x_{" + (i + 1) + "} \\\\ ";
    }
    matrixTeX = matrixTeX.slice(0, -3);
    matrixTeX += "\\end{bmatrix} ";
    //等号及右侧
    matrixTeX += " = ";
    matrixTeX += "\\begin{bmatrix} ";
    for(i = 0; i < augmentedMatrix.length; i++){
        matrixTeX += beautifyFloat(augmentedMatrix[i][augmentedMatrix[i].length - 1], precision);
        matrixTeX += " \\\\ ";

    }
    matrixTeX = matrixTeX.slice(0, -3);
    matrixTeX += "\\end{bmatrix} ";
    matrixTeX += "\\end{equation}$";

    return matrixTeX;
};
//转换普通矩阵的TeX表示形式
var matrixTeX = function(matrix, precision){
    var i, j;
    var tex = "";
     tex += "$\\begin{bmatrix} ";
    //系数矩阵
    for(i = 0; i < matrix.length; i++){
        for(j = 0; j < matrix[i].length - 1; j++){
            tex += beautifyFloat(matrix[i][j], precision);
            tex += " & ";
        }
        tex += beautifyFloat(matrix[i][j], precision);
        tex += " \\\\ ";
    }
    tex = tex.slice(0, -3);
    tex += "\\end{bmatrix}$";
    return tex;
};
//转换解向量的TeX表示形式
var vectorTeX = function(vector, precision){
    var resultTeX = "";
    resultTeX += "$(";
    for(var i = 0; i < vector.length; i++){
        resultTeX += beautifyFloat(vector[i], precision);
        resultTeX += ", ";
    }
    resultTeX = resultTeX.slice(0, -2);
    resultTeX += ")^{T}$";

    return resultTeX;
};

//输入事件处理
$(function(){
    //输入框对象矩阵
    var inputMatrix = [];
    //输入矩阵
    var matrix = [];

    //按钮、滚动控件等初始化

    $('#precision-slider').slider({
        formatter: function(value) {
            return '当前精度：' + value;
        }
    });

    //输入框矩阵按钮点击事件
    $("#btn-matrix-generate").click(function(){
        var size = $("#matrix-size-input").val();
        //判断数值合法性
        if(!isInt(size)){
            alert("请输入正确的数字");
            return;
        }
        if(size > 99 || size <= 0){
            alert("数值超过范围");
            return;
        }

        if(size > 20){
            alert("推荐您使用高级输入模式");
            var bool = confirm("是否使用高级模式？");
            if(bool){
                $("#na-1-input-tab").find("a:last").tab("show");
                return;
            }
        }
        //重置类型
        size = parseInt(size);

        var panelDiv = $("#simple-input-panel");

        panelDiv.empty();

        panelDiv.append("<table></table>");
        var panelTable = panelDiv.find("table").eq(0);

        var i, j;
        //先单独输出第一行
        //建立第一行
        panelTable.append("<tr></tr>");
        //系数矩阵左括号
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
        //清空输入框
        inputMatrix = [];
        //系数矩阵第一行的每个元素
        inputMatrix[0] = [];
        for(j = 0; j < size; j++){
            panelTable.find("tr").eq(0).append('<td></td>');
            panelTable.find("tr").eq(0).find("td").eq(j + 1).append("<input>");
            inputMatrix[0][j] = panelTable.find("tr").eq(0).find("td").eq(j + 1).find("input");
        }
        //系数矩阵的右括号
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');
        //乘号空白
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '">&nbsp;&nbsp;</td>');
        //x1的左括号与数字
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
        panelTable.find("tr").eq(0).append('<td>$x_{1}$</td>');
        //更新自然显示
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, panelTable.find("tr").eq(0).find("td").eq(size + 4)[0]]);
        //x1的右括号
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');
        //等号、b向量的左括号
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '">&nbsp;=&nbsp;</td>');
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
        //b向量第一个分量
        panelTable.find("tr").eq(0).append('<td></td>');
        panelTable.find("tr").eq(0).find("td").eq(size + 8).append("<input>");
        inputMatrix[0][size] = panelTable.find("tr").eq(0).find("td").eq(size + 8).find("input");
        //b向量的右括号
        panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');

        //遍历其后各行
        for(i = 1; i < size; i++){
            panelTable.append("<tr></tr>");
            inputMatrix[i] = [];
            for(j = 0; j < size; j++){
                panelTable.find('tr').eq(i).append('<td></td>');
                panelTable.find('tr').eq(i).find('td').eq(j).append("<input>");
                inputMatrix[i][j] = panelTable.find("tr").eq(i).find("td").eq(j).find("input");
            }
            panelTable.find('tr').eq(i).append('<td>$x_{' + (i + 1) + '}$</td>');
            //更新数学显示
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, panelTable.find("tr").eq(i).find("td").eq(size)[0]]);
            //bn
            panelTable.find('tr').eq(i).append('<td></td>');
            panelTable.find('tr').eq(i).find('td').eq(size + 1).append("<input>");
            inputMatrix[i][j] = panelTable.find("tr").eq(i).find("td").eq(size + 1).find("input");
            //注意还需要多输出一个
        }

        //最后将确认按钮变为可用
        $("#btn-finish-input").attr("disabled", false);
    });

    //完成输入按钮点击事件
    $("#btn-finish-input").click(function(){
        var i, j;
        //两种输入来源
        var methodTab = $("#na-1-input-tab");
        var methodIndex = methodTab.find("li").index(methodTab.find(".active"));

        switch(methodIndex){
            case 0:
                if(inputMatrix.length == 0){
                    alert("请先输入矩阵阶数，生成输入框矩阵并填写数据后完成输入");
                    return;
                }
                //简单输入
                //清空matrix
                matrix = [];
                for(i = 0; i < inputMatrix.length; i++){
                    matrix[i] = [];
                    for(j = 0; j < inputMatrix[i].length; j++){
                        matrix[i][j] = inputMatrix[i][j].val();
                        if(matrix[i][j] === ""){
                            matrix[i][j] = 0;
                        }else if(!$.isNumeric(matrix[i][j])){
                            alert(i+(j+"输入非法"));
                            return;
                        }else{
                            matrix[i][j] = parseFloat(matrix[i][j]);
                        }
                    }
                }
                break;
            case 1:
                //高级输入
                var JSONData = $("#textarea-advanced").val();
                try{
                    matrix = JSON.parse(JSONData);
                }catch(e){
                    alert("输入数据有错误，请检查");
                    return;
                }
                var row = matrix.length;
                for(i = 0; i < row; i++){
                    if(matrix[i].length != row + 1){
                        alert("输入的矩阵非增广矩阵，请检查");
                        return;
                    }
                }
                break;
        }



        var output = $("#finish-input-show");

        var matrixTeX = augmentedMatrixTeX(matrix);

        output.empty();
        output.append(matrixTeX);
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, output[0]]);

        //最后将开始计算按钮变为可用
        $("#btn-start-computing").attr("disabled", false);

    });

    //开始计算按钮
    $("#btn-start-computing").click(function(){
        var choose = document.forms["compute-method"].elements["method"].value;
        var precision = parseInt(document.forms["compute-method"].elements["precision"].value);
        var process = document.forms["compute-method"].elements["process"].checked;
        var resultPanel = $("#result-show");
        var resultTeX = "";
        //开始计算
        resultPanel.empty();
        // resultPanel.append("开始计算：");
        //解向量
        var result;

        var stepNum = 1;

        var callback = function(matrix){
            var div = document.createElement("div");
            var title = document.createElement("p");
            title.appendChild(document.createTextNode("第" + stepNum + "步"));
            div.appendChild(title);
            div.appendChild(document.createTextNode(matrixTeX(matrix, precision)));

            resultPanel.append(div);

            stepNum++;
        };
        var copiedMatrix = DDNA.Utils.copyMatrix(matrix);
        //不同的计算方式
        switch(parseInt(choose)){
            case 1:
                //高斯顺序消元法
                if(process){
                    result = DDNA.GaussElimination.eliminateInOrder(copiedMatrix, callback);
                }else{
                    result = DDNA.GaussElimination.eliminateInOrder(copiedMatrix);
                }
                break;
            case 2:
                //高斯列主元消元法
                if(process){
                    result = DDNA.GaussElimination.eliminateWithOutPCA(copiedMatrix);
                }else{
                    result = DDNA.GaussElimination.eliminateWithOutPCA(copiedMatrix);
                }
                break;
            case 3:
                //平方根法
                var decomposed = decomposeAugmentedMatrix(matrix);
                if(process){
                    result = DDNA.SquareRootMethod.defaultSolve(decomposed.coefficientMatrix, decomposed.b);
                }else{
                    result = DDNA.SquareRootMethod.defaultSolve(decomposed.coefficientMatrix, decomposed.b);
                }
                break;
            case 4:
                //改进的平方根法

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

        //追加最终结果
        var div = document.createElement("div");
        var title = document.createElement("p");
        title.appendChild(document.createTextNode("最终结果："));
        div.appendChild(title);
        div.appendChild(document.createTextNode(vectorTeX(result, precision)));
        resultPanel.append(div);

        MathJax.Hub.Queue(["Typeset",MathJax.Hub, resultPanel[0]]);


    });
});
