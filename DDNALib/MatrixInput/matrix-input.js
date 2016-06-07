

var MatrixInputPanel = function(id, mode, libPath, generateCallback, finishCallback){
    this.panelId = id;
    this.panel = document.getElementById(id);
    //显示模式，如方程组模式"equations"或普通矩阵模式"matrix"
    this.mode = mode;
    //简单处理找不到库路径问题
    this.libPath = libPath;
    this.matrix = [];

    //输入框组
    this.inputMatrix = [];
    //矩阵大小（目前都是方阵）
    this.size = 0;

    //回调函数处理
    this.generateCallback = generateCallback;
    this.finishCallback = finishCallback;

};

MatrixInputPanel.prototype.init = function(){
    var self = this;
    //引入css
    //$("head").append('<link rel="stylesheet" href="' + this.libPath + 'matrix-input.css">');
    //插入整体模板
    $.get(this.libPath + "body.mst", function(template){
        var content;
        if(self.mode == "equation"){
            content = {
                panelName: self.panelId,
                help: "此页为普通输入模式，首先输入系数矩阵阶数，下方将生成可视化的输入框组使您能方便地输入。<br>" +
                "输入框可以空白，即默认为0, 方便稀疏矩阵的输入。",
                matrixSizeHelp: "系数矩阵阶数"
            };
        }else if(self.mode == "matrix"){
            content = {
                panelName: self.panelId,
                help: "此页为普通输入模式，首先输入矩阵阶数，下方将生成可视化的输入框组使您能方便地输入。<br>" +
                    "输入框可以空白，即默认为0, 方便稀疏矩阵的输入。",
                matrixSizeHelp: "方阵阶数"
            };
        }

        var rendered = Mustache.render(template, content);
        $(self.panel).html(rendered);

    });

    //绑定事件
    //简单输入生成矩阵按钮
    $(this.panel).on("click", ".btn-matrix-generate", function(){
        var size = $("#" + self.panelId + "-matrix-size-input").val();
        self.size = size;   //全局保存
        //判断数值合法性
        if(!MatrixInputPanel.Utils.isInt(size)){
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
                $("#" + self.panelId + "-input-tab").find("a:last").tab("show");
                return;
            }
        }
        //重置类型
        size = parseInt(size);

        var panelDiv = $(self.panel).find(".simple-input-panel");

        panelDiv.empty();

        panelDiv.append("<table></table>");
        var panelTable = panelDiv.find("table").eq(0);

        var i, j;

        //方程组类型
        if(self.mode == "equation"){
            //先单独输出第一行
            //建立第一行
            panelTable.append("<tr></tr>");
            //系数矩阵左括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
            //清空输入框
            self.inputMatrix = [];
            //系数矩阵第一行的每个元素
            self.inputMatrix[0] = [];
            for(j = 0; j < size; j++){
                panelTable.find("tr").eq(0).append('<td></td>');
                panelTable.find("tr").eq(0).find("td").eq(j + 1).append("<input>");
                self.inputMatrix[0][j] = panelTable.find("tr").eq(0).find("td").eq(j + 1).find("input");
            }
            //系数矩阵的右括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');
            //乘号空白
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '">&nbsp;&nbsp;</td>');
            //x1的左括号与数字
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
            panelTable.find("tr").eq(0).append('<td>$x_{1}$</td>');
            //更新自然显示
            if(typeof MathJax != "undefined"){
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, panelTable.find("tr").eq(0).find("td").eq(size + 4)[0]]);
            }
            //x1的右括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');
            //等号、b向量的左括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '">&nbsp;=&nbsp;</td>');
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
            //b向量第一个分量
            panelTable.find("tr").eq(0).append('<td></td>');
            panelTable.find("tr").eq(0).find("td").eq(size + 8).append("<input>");
            self.inputMatrix[0][size] = panelTable.find("tr").eq(0).find("td").eq(size + 8).find("input");
            //b向量的右括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');

            //遍历其后各行
            for(i = 1; i < size; i++){
                panelTable.append("<tr></tr>");
                self.inputMatrix[i] = [];
                for(j = 0; j < size; j++){
                    panelTable.find('tr').eq(i).append('<td></td>');
                    panelTable.find('tr').eq(i).find('td').eq(j).append("<input>");
                    self.inputMatrix[i][j] = panelTable.find("tr").eq(i).find("td").eq(j).find("input");
                }
                panelTable.find('tr').eq(i).append('<td>$x_{' + (i + 1) + '}$</td>');
                //更新数学显示
                if(typeof MathJax != "undefined"){
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub, panelTable.find("tr").eq(i).find("td").eq(size)[0]]);
                }
                //bn
                panelTable.find('tr').eq(i).append('<td></td>');
                panelTable.find('tr').eq(i).find('td').eq(size + 1).append("<input>");
                self.inputMatrix[i][j] = panelTable.find("tr").eq(i).find("td").eq(size + 1).find("input");
                //注意还需要多输出一个
            }
        }else if(self.mode == "matrix"){
            //普通矩阵类型
            //先单独输出第一行
            //建立第一行
            panelTable.append("<tr></tr>");
            //系数矩阵左括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="left-brace">&nbsp;&nbsp;</td>');
            //清空输入框
            self.inputMatrix = [];
            //系数矩阵第一行的每个元素
            self.inputMatrix[0] = [];
            for(j = 0; j < size; j++){
                panelTable.find("tr").eq(0).append('<td></td>');
                panelTable.find("tr").eq(0).find("td").eq(j + 1).append("<input>");
                self.inputMatrix[0][j] = panelTable.find("tr").eq(0).find("td").eq(j + 1).find("input");
            }
            //系数矩阵的右括号
            panelTable.find("tr").eq(0).append('<td rowspan="' + size + '" class="right-brace">&nbsp;&nbsp;</td>');
            //遍历其后各行
            for(i = 1; i < size; i++){
                panelTable.append("<tr></tr>");
                self.inputMatrix[i] = [];
                for(j = 0; j < size; j++){
                    panelTable.find('tr').eq(i).append('<td></td>');
                    panelTable.find('tr').eq(i).find('td').eq(j).append("<input>");
                    self.inputMatrix[i][j] = panelTable.find("tr").eq(i).find("td").eq(j).find("input");
                }
            }
        }

        //最后将确认按钮变为可用
        $(self.panel).find(".btn-finish-input").attr("disabled", false);

        //处理回调函数
        if(typeof self.generateCallback == "function"){
            self.generateCallback();
        }
    });

    //绑定完成输入按钮事件
    $(this.panel).on("click", ".btn-finish-input", function(){
        var i, j;
        //两种输入来源
        var methodTab = $("#" + self.panelId + "-input-tab");
        var methodIndex = methodTab.find("li").index(methodTab.find(".active"));

        switch(methodIndex){
            case 0:
                if(self.inputMatrix.length == 0){
                    alert("请先输入矩阵阶数，生成输入框矩阵并填写数据后完成输入");
                    return;
                }
                //简单输入
                //清空matrix
                self.matrix = [];
                for(i = 0; i < self.inputMatrix.length; i++){
                    self.matrix[i] = [];
                    for(j = 0; j < self.inputMatrix[i].length; j++){
                        self.matrix[i][j] = self.inputMatrix[i][j].val();
                        if(self.matrix[i][j] === ""){
                            self.matrix[i][j] = 0;
                        }else if(!$.isNumeric(self.matrix[i][j])){
                            alert((i + 1) + "行" + (j + 1) +"列处输入值非法，请检查");
                            return;
                        }else{
                            self.matrix[i][j] = parseFloat(self.matrix[i][j]);
                        }
                    }
                }
                break;
            case 1:
                //高级输入
                var JSONData = $(self.panel).find(".textarea-advanced").val();
                try{
                    self.matrix = JSON.parse(JSONData);
                }catch(e){
                    alert("输入数据有错误，请检查");
                    return;
                }
                var row = self.matrix.length;
                var lastColSize = self.matrix[0].length;
                for(i = 0; i < row; i++){
                    //先判断各行个数是否正确
                    if(self.matrix[i].length != lastColSize){
                        alert("第" + i + "行与第" + (i + 1) + "行元素个数不同，非矩阵，请检查");
                        return;
                    }else{
                        lastColSize = self.matrix[i].length;
                    }
                    //当输入方程组时，判断是否合法
                    if(self.mode == "equation" && self.matrix[i].length != row + 1){
                        alert("输入的矩阵非增广矩阵，请检查");
                        return;
                    }
                    for(j = 0; j < self.matrix.length; j++){
                        if(typeof self.matrix[i][j] != "number"){
                            alert((i + 1) + "行" + (j + 1) +"列处输入值非法，请检查");
                            return;
                        }
                    }
                }

                self.size = self.matrix.length;

                break;
        }

        var output = $(self.panel).find(".finish-input-show");

        var matrixTeX;
        if(self.mode == "equation"){
            matrixTeX = MatrixInputPanel.Utils.augmentedMatrixTeX(self.matrix);
        }else if(self.mode == "matrix"){
            matrixTeX = MatrixInputPanel.Utils.matrixTeX(self.matrix);
        }
        output.empty();
        output.append(matrixTeX);

        if(typeof MathJax != "undefined"){
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, output[0]]);
        }


        //处理回调函数
        if(typeof self.finishCallback == "function"){
            self.finishCallback();
        }
    });
};

/**
 * 获取输入的矩阵
 * @returns {Array|*}
 */
MatrixInputPanel.prototype.getMatrix = function(){
    if(this.matrix.length != 0)
        return this.matrix;
    return null;
};

/**
 * 获取分解后的增广矩阵，即返回系数矩阵以及向量b
 */
MatrixInputPanel.prototype.getDecomposedAugmentedMatrix = function(){
    if(this.matrix.length != 0)
        return MatrixInputPanel.Utils.decomposeAugmentedMatrix(this.matrix);
    return null;
};

/**
 * 工具集合
 * @type {{}}
 */
MatrixInputPanel.Utils = {};

/**
 * 判断是否为整数
 * @param value 传入的数字
 * @returns {boolean}
 */
MatrixInputPanel.Utils.isInt = function(value){
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
};

/**
 * 美化浮点数，保留给定的位数，在定点数基础上过滤多余的0
 * @param number 传入的数字
 * @param precision 保留的精度，即小数点后位数
 * @returns {*}
 */
MatrixInputPanel.Utils.beautifyFloat = function(number, precision){
    if(typeof number == "number"){
        if(MatrixInputPanel.Utils.isInt(precision) && (precision >= 0 || precision <= 16)){
            return parseFloat(number.toFixed(precision));
        }else{
            return number;
        }
    }else{
        throw new Error("传入参数非数字");
    }
};

/**
 * 分解增广矩阵
 * @param augmentedMatrix 增广矩阵
 * @returns {{coefficientMatrix: Array, b: Array}}
 */
MatrixInputPanel.Utils.decomposeAugmentedMatrix = function(augmentedMatrix){
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

/**
 * 转化增广矩阵为TeX文本
 * @param augmentedMatrix 增广矩阵
 * @param precision 保留小数点后位数，精度
 * @returns {string}
 */
MatrixInputPanel.Utils.augmentedMatrixTeX = function(augmentedMatrix, precision){
    var i, j;
    var matrixTeX = "";
    matrixTeX += "$\\begin{equation} ";
    matrixTeX += "\\begin{bmatrix} ";
    //系数矩阵
    for(i = 0; i < augmentedMatrix.length; i++){
        for(j = 0; j < augmentedMatrix[i].length - 2; j++){
            matrixTeX += MatrixInputPanel.Utils.beautifyFloat(augmentedMatrix[i][j], precision);
            matrixTeX += " & ";
        }
        matrixTeX += MatrixInputPanel.Utils.beautifyFloat(augmentedMatrix[i][augmentedMatrix[i].length - 2], precision);
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
        matrixTeX += MatrixInputPanel.Utils.beautifyFloat(augmentedMatrix[i][augmentedMatrix[i].length - 1], precision);
        matrixTeX += " \\\\ ";

    }
    matrixTeX = matrixTeX.slice(0, -3);
    matrixTeX += "\\end{bmatrix} ";
    matrixTeX += "\\end{equation}$";

    return matrixTeX;
};

/**
 * 转化一般矩阵为TeX文本
 * @param matrix 一般矩阵
 * @param precision 保留小数点后位数，精度
 * @returns {string}
 */
MatrixInputPanel.Utils.matrixTeX = function(matrix, precision){
    var i, j;
    var tex = "";
    tex += "$\\begin{bmatrix} ";
    //系数矩阵
    for(i = 0; i < matrix.length; i++){
        for(j = 0; j < matrix[i].length - 1; j++){
            tex += MatrixInputPanel.Utils.beautifyFloat(matrix[i][j], precision);
            tex += " & ";
        }
        tex += MatrixInputPanel.Utils.beautifyFloat(matrix[i][j], precision);
        tex += " \\\\ ";
    }
    tex = tex.slice(0, -3);
    tex += "\\end{bmatrix}$";
    return tex;
};

/**
 * 转化向量为TeX文本
 * @param vector 向量
 * @param precision 保留小数点后位数，精度
 * @returns {string}
 */
MatrixInputPanel.Utils.vectorTeX = function(vector, precision){
    var resultTeX = "";
    resultTeX += "$(";
    for(var i = 0; i < vector.length; i++){
        resultTeX += MatrixInputPanel.Utils.beautifyFloat(vector[i], precision);
        resultTeX += ", ";
    }
    resultTeX = resultTeX.slice(0, -2);
    resultTeX += ")^{T}$";

    return resultTeX;
};

