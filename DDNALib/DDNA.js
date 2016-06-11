var DDNA = {};

DDNA.Utils = {};

DDNA.Utils.copyMatrix = function(matrix){
    var i, j;
    var copy = [];
    for(i = 0; i < matrix.length; i++){
        copy[i] = [];
        for(j = 0; j < matrix[i].length; j++){
            copy[i][j] = matrix[i][j];
        }
    }
    return copy;
};

DDNA.Utils.swapRow = function(matrix, i, j){
    if(matrix.length < i || matrix.length < j || i < 0 || j < 0 || i == j)
        return matrix;
    var tempRow = matrix[i];
    matrix[i] = matrix[j];
    matrix[j] = tempRow;
    return matrix;
};

DDNA.Utils.matrixMultiply = function(a, b){
    var i, j, k;
    var matrix = [];
    for(i = 0; i < a.length; i++){
        matrix[i] = [];
        for(j = 0; j < a.length; j++){
            var sum = 0;
            for(k = 0; k < b.length; k++){
                sum += a[i][k] * b[k][j];
            }
            matrix[i][j] = sum;
        }
    }
    return matrix;
};

DDNA.Utils.isInt = function(value){
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
};

DDNA.GaussElimination = {};
/**
 * 顺序高斯消去法算法实现
 * @param augmentedMatrix 增广矩阵
 * @param callback 回调函数，用于显示运算过程
 * @returns {*}
 */
DDNA.GaussElimination.eliminateInOrder = function(augmentedMatrix, callback){
    var i, j, k;
    var matrixL, matrixU, rightVector;
    //第零步，初始化matrixL
    matrixL = [];
    for(i = 0; i < augmentedMatrix.length; i++){
        matrixL[i] = [];
        for(j = 0; j < i; j++)
            matrixL[i][j] = 0;
        matrixL[i][j] = 1;
        for(j = i + 1; j < augmentedMatrix.length; j++)
            matrixL[i][j] = 0;
    }
    //第一步，消元
    //依次迭代每一行，消去其下方所有行的当前首位非零元素
    for(i = 0; i < augmentedMatrix.length - 1; i++){
        var cell = augmentedMatrix[i][i];
        //若当前元素为零，该方法无效
        if(cell != 0){
            //依次迭代消去下方每行的首位非零元素
            for(j = i + 1; j < augmentedMatrix.length; j++){
                var ratio = augmentedMatrix[j][i] / augmentedMatrix[i][i];
                //更新matrixL
                matrixL[j][i] = ratio;
                //消该行每个元素
                for(k = i; k < augmentedMatrix[j].length; k++){
                    augmentedMatrix[j][k] -= ratio * augmentedMatrix[i][k];
                }
            }
            if(typeof callback == "function"){
                callback(augmentedMatrix);
            }
        }else{
            return null;
        }
    }

    //第二步，回代
    var result = [];
    //从最后一行往回迭代
    var lastRow = augmentedMatrix[augmentedMatrix.length - 1];
    if(lastRow[lastRow.length - 1] == 0){
        return null;
    }
    for(i = augmentedMatrix.length - 1; i >= 0; i--){
        result[i] = augmentedMatrix[i][augmentedMatrix[i].length - 1];
        //结果需减去所有当前行以下的行的结果与此行系数的乘积
        for(j = i + 1; j < augmentedMatrix.length; j++){
            result[i] -= augmentedMatrix[i][j] * result[j];
        }
        result[i] /= augmentedMatrix[i][i];
    }
    //合成matrixU，rightVector
    matrixU = [];
    rightVector = [];
    for(i = 0; i < augmentedMatrix.length; i++){
        matrixU[i] = augmentedMatrix[i].slice(0, augmentedMatrix.length);
        rightVector[i] = augmentedMatrix[i][augmentedMatrix.length];
    }

    return {
        result: result,
        matrixL: matrixL,
        matrixU: matrixU,
        rightVector: rightVector
    }
};
/**
 * 列主元高斯消去法算法实现
 * @param augmentedMatrix 增广矩阵
 * @returns {*}
 */
DDNA.GaussElimination.eliminateWithOutPCA = function(augmentedMatrix, callback){
    var i, j, k;
    var matrixL, matrixU, rightVector;
    //第零步，初始化matrixL
    matrixL = [];
    for(i = 0; i < augmentedMatrix.length; i++){
        matrixL[i] = [];
        for(j = 0; j < i; j++)
            matrixL[i][j] = 0;
        matrixL[i][j] = 1;
        for(j = i + 1; j < augmentedMatrix.length; j++)
            matrixL[i][j] = 0;
    }
    //第一步，消元
    //依次迭代每一行
    for(i = 0; i < augmentedMatrix.length - 1; i++){
        //找出列主元
        var cell = Math.abs(augmentedMatrix[i][i]);
        var cellRow = i;
        for(j = i + 1; j < augmentedMatrix.length; j++){
            if(Math.abs(augmentedMatrix[j][i]) > cell){
                cell = Math.abs(augmentedMatrix[j][i]);
                cellRow = j;
            }
        }
        //交换行
        DDNA.Utils.swapRow(augmentedMatrix, i, cellRow);
        //重新获取主元
        cell = augmentedMatrix[i][i];
        //若该列全为零，该方程无唯一解，返回null
        if(cell == 0){
            return null;
        }
        //依次迭代消去下方每行的首位非零元素
        for(j = i + 1; j < augmentedMatrix.length; j++){
            var ratio = augmentedMatrix[j][i] / augmentedMatrix[i][i];
            //更新matrixL
            matrixL[j][i] = ratio;
            //消该行每个元素
            for(k = i; k < augmentedMatrix[j].length; k++){
                augmentedMatrix[j][k] -= ratio * augmentedMatrix[i][k];
            }
        }
        if(typeof callback == "function"){
            callback(augmentedMatrix);
        }
    }

    //第二步，回代
    var result = [];
    //从最后一行往回迭代
    var lastRow = augmentedMatrix[augmentedMatrix.length - 1];
    if(lastRow[lastRow.length - 1] == 0){
        return null;
    }
    for(i = augmentedMatrix.length - 1; i >= 0; i--){
        result[i] = augmentedMatrix[i][augmentedMatrix[i].length - 1];
        //结果需减去所有当前行以下的行的结果与此行系数的乘积
        for(j = i + 1; j < augmentedMatrix.length; j++){
            result[i] -= augmentedMatrix[i][j] * result[j];
        }
        result[i] /= augmentedMatrix[i][i];
    }
    //合成matrixU，rightVector
    matrixU = [];
    rightVector = [];
    for(i = 0; i < augmentedMatrix.length; i++){
        matrixU[i] = augmentedMatrix[i].slice(0, augmentedMatrix.length);
        rightVector[i] = augmentedMatrix[i][augmentedMatrix.length];
    }

    return {
        result: result,
        matrixL: matrixL,
        matrixU: matrixU,
        rightVector: rightVector
    }
};


DDNA.SquareRootMethod = {};

/**
 * 平方根法（基本）
 * @param matrix 系数矩阵
 * @param vector b向量
 */
DDNA.SquareRootMethod.defaultSolve = function(matrix, vector){
    var i, j, k;
    var result = [];

    for(i = 0; i < matrix.length; i++){
        //a_{kk} = (a_{kk} - sum(a_{km}^2, m, 1, k-1))^{1/2} 注：不同的ijk
        //先求式中的和
        var sum1 = 0;
        for(j = 0; j < i; j++){
            sum1 += matrix[i][j] * matrix[i][j];
        }
        //对角线元素已求出
        matrix[i][i] = Math.pow(matrix[i][i] - sum1, 0.5);
        //求该对角线元素同行同列其他元素
        for(j = i + 1; j < matrix[i].length; j++){
            //a_{ik} = (a_{ik} - sum(a_{im} * a_{km}, m, 1, k-1)) / (a_{kk})
            //先求式中的和
            var sum2 = 0;
            for(k = 0; k < i; k++){
                sum2 += matrix[i][k] * matrix[j][k];
            }
            matrix[j][i] = (matrix[j][i] - sum2) / matrix[i][i];
        }
    }

    //系数矩阵已得，开始求解
    for(i = 0; i < matrix.length; i++){
        //先计算其前的乘积之和
        var sum3 = 0;
        for(j = 0; j < i; j++){
            sum3 += matrix[i][j] * result[j];
        }
        result[i] = (vector[i] - sum3) / matrix[i][i];
    }
    for(i = matrix.length - 1; i >= 0; i--){
        //先计算其前的乘积之和
        var sum4 = 0;
        for(j = matrix.length - 1; j > i; j--){
            sum4 += matrix[j][i] * result[j];
        }
        result[i] = (result[i] - sum4) / matrix[i][i];
    }

    var matrixG = [];
    for(i = 0; i < matrix.length; i++){
        matrixG[i] = [];
        for(j = 0; j <= i; j++)
            matrixG[i][j] = matrix[i][j];
        for(j = i + 1; j < matrix.length; j++)
            matrixG[i][j] = 0;
    }
    return {
        result: result,
        matrixG: matrixG
    }
};

/**
 * 改进的平方根法
 * @param matrix 系数矩阵
 * @param vector b向量
 */
DDNA.SquareRootMethod.improvedSolve = function(matrix, vector){
    var i, j, k;
    var matrixL = [], diagD = [], result = [];
    //初始化matrixL
    for(i = 0; i < matrix.length; i++){
        matrixL[i] = [];
        for(j = 0; j < i; j++)
            matrixL[i][j] = 0;
        matrixL[i][j] = 1;
        for(j = i + 1; j < matrix.length; j++)
            matrixL[i][j] = 0;
    }
    //计算公式（注意ijk含义不同，教材P30）
    //a_ik = sum(l_im * d_m * l_km, m, 1, k-1) + l_ik * d_k
    //d_k = a_kk - sum(l_km^2 * d_m, m, 1, k-1)
    //l_ik = (a_ik - sum(l_im * d_m * l_km, m, 1, k-1)) / d_k

    for(i = 0; i < matrix.length; i++){
        var sum1 = 0;
        for(j = 0; j < i; j++)
            sum1 += matrixL[i][j] * matrixL[i][j] * diagD[j];
        diagD[i] = matrix[i][i] - sum1;
        for(j = i + 1; j < matrix.length; j++){
            var sum2 = 0;
            for(k = 0; k < i; k++)
                sum2 += matrixL[j][k] * diagD[k] * matrixL[i][k];
            matrixL[j][i] = (matrix[j][i] - sum2) / diagD[i];
        }
    }

    //系数矩阵已得，开始求解
    for(i = 0; i < matrix.length; i++){
        //先计算其前的乘积之和
        var sum3 = 0;
        for(j = 0; j < i; j++){
            sum3 += matrixL[i][j] * result[j];
        }
        result[i] = (vector[i] - sum3) / matrixL[i][i];
    }

    //求D^-1 * b
    for(i = 0; i < matrix.length; i++){
        result[i] /= diagD[i];
    }

    for(i = matrix.length - 1; i >= 0; i--){
        //先计算其前的乘积之和
        var sum4 = 0;
        for(j = matrix.length - 1; j > i; j--){
            sum4 += matrixL[j][i] * result[j];
        }
        result[i] = (result[i] - sum4) / matrixL[i][i];
    }

    return {
        result: result,
        matrixL: matrixL,
        diagD: diagD
    }
};

DDNA.ChasingMethod = {};

/**
 * 解三对角方程组的追赶法
 * @param a
 * @param c
 * @param d
 * @param b
 */
DDNA.ChasingMethod.solve = function(a, c, d, b){
    var i, j;
    var alpha = [], beta = [], x = [], y = [];
    alpha[0] = a[0];
    for(i = 0; i < a.length - 1; i++){
        beta[i] = c[i] / alpha[i];
        alpha[i + 1] = a[i + 1] - d[i + 1] * beta[i];
    }

    y[0] = b[0] / alpha[0];
    for(i = 1; i < a.length; i++){
        y[i] = (b[i] - d[i] * y[i - 1]) / alpha[i];
    }
    x[a.length - 1] = y[a.length - 1];
    for(i = a.length - 2; i >= 0; i--){
        x[i] = y[i] - beta[i] * x[i + 1];
    }
    return x;
};

DDNA.MatrixInversion = {};

DDNA.MatrixInversion.solve = function(matrix){
    var solve1 = DDNA.MatrixInversion._lowerTriangleEliminate(matrix);
    if(solve1 == null)
        return null;
    var solve2 = DDNA.MatrixInversion._upperTriangleEliminate(solve1);
    if(solve2 == null)
        return null;
    var solve3 = DDNA.MatrixInversion._crossUnitize(solve2);

    return solve3;
};

DDNA.MatrixInversion._lowerTriangleEliminate = function(matrix){
    var i, j, k;
    //生成单位阵
    var result = [];
    for(i = 0; i < matrix.length; i++){
        result[i] = [];
        for(j = 0; j < i; j++){
            result[i][j] = 0;
        }
        result[i][i] = 1;
        for(j = i + 1; j < matrix[i].length; j++){
            result[i][j] = 0;
        }
    }

    //开始下三角消元
    for(i = 0; i < matrix.length - 1; i++){
        //找出列主元
        var cell = Math.abs(matrix[i][i]);
        var cellRow = i;
        for(j = i + 1; j < matrix.length; j++){
            if(Math.abs(matrix[j][i]) > cell){
                cell = Math.abs(matrix[j][i]);
                cellRow = j;
            }
        }
        //交换行
        DDNA.Utils.swapRow(matrix, i, cellRow);
        DDNA.Utils.swapRow(result, i, cellRow);
        //重新获取主元
        cell = matrix[i][i];
        //若该列全为零，该矩阵无逆
        if(cell == 0){
            return null;
        }
        //依次迭代消去下方每行的首位非零元素
        for(j = i + 1; j < matrix.length; j++){
            var ratio = matrix[j][i] / matrix[i][i];
            //消该行每个元素
            for(k = 0; k < matrix[j].length; k++){
                matrix[j][k] -= ratio * matrix[i][k];
                result[j][k] -= ratio * result[i][k];
            }
        }
    }

    return {
        matrix: matrix,
        result: result
    }
};

DDNA.MatrixInversion._upperTriangleEliminate = function(matrixResult){
    var i, j, k;

    var matrix = matrixResult.matrix;
    var result = matrixResult.result;

    for(i = matrix.length - 1; i > 0; i--){
        for(j = i - 1; j >= 0; j--){
            var ratio = matrix[j][i] / matrix[i][i];
            for(k = 0; k < matrix[j].length; k++){
                matrix[j][k] -= ratio * matrix[i][k];
                result[j][k] -= ratio * result[i][k];
            }
        }
    }

    return {
        matrix: matrix,
        result: result
    }
};

DDNA.MatrixInversion._crossUnitize = function(matrixResult){
    var i, j;

    var matrix = matrixResult.matrix;
    var result = matrixResult.result;

    for(i = 0; i < matrix.length; i++){
        for(j = 0; j < matrix[i].length; j++){
            result[i][j] = result[i][j] / matrix[i][i];
        }
    }

    return result;
};

DDNA.IterativeMethod = {};

//TODO 当计算结果NaN就直接返回，报错
DDNA.IterativeMethod.jacobiIterative = function(matrix, rightVector, initVector, epsilon, maxTimes, callback){
    var i, j, k;
    var xVectorLast = [],
        xVectorNow = [];

    //将初始向量复制
    for(i = 0; i < initVector.length; i++){
        xVectorLast[i] = initVector[i];
    }
    //开始迭代，至多maxTimes次
    for(i = 1; i <= maxTimes; i++){
        //计算新的第j行数据
        for(j = 0; j < matrix.length; j++){
            xVectorNow[j] = xVectorLast[j];
            var temp = rightVector[j];
            for(k = 0; k < matrix.length; k++){
                temp -= matrix[j][k] * xVectorLast[k];
            }
            xVectorNow[j] += temp / matrix[j][j];
        }
        var maxGap = 0;
        for(j = 0; j < xVectorNow.length; j++){
            if(maxGap < Math.abs(xVectorNow[j] - xVectorLast[j])){
                maxGap = Math.abs(xVectorNow[j] - xVectorLast[j]);
            }
        }

        //console.log(xVectorNow);
        //回调发送当前迭代结果
        if(typeof callback == "function"){
            callback(i, xVectorNow, maxGap);
        }

        if(maxGap <= epsilon)
            return xVectorNow;

        xVectorLast = xVectorNow;
        xVectorNow = [];
    }
    //超过最大迭代次数限制，直接输出
    return xVectorLast;
};

DDNA.IterativeMethod.gaussSeidelIterative = function(matrix, rightVector, initVector, epsilon, maxTimes, callback){
    DDNA.IterativeMethod.SORIterative(matrix, rightVector, initVector, epsilon, maxTimes, 1, callback);
};

DDNA.IterativeMethod.SORIterative = function(matrix, rightVector, initVector, epsilon, maxTimes, omega, callback){
    var i, j, k, l;
    var xVector = [];
    var maxX, tempDeltaX;

    //将初始向量复制
    for(i = 0; i < initVector.length; i++)
        xVector[i] = initVector[i];
    //循环迭代直到达到最大次数限制
    for(i = 1; i <= maxTimes; i++){
        //循环顺便计算本次迭代中x向量绝对值最大的分量
        maxX = 0;
        //计算矩阵每一行迭代结果
        for(k = 0; k < xVector.length; k++){
            var sum = 0;
            for(l = 0; l < xVector.length; l++){
                sum += matrix[k][l] * xVector[l];
            }
            tempDeltaX = omega * (rightVector[k] - sum) / matrix[k][k];
            if(Math.abs(tempDeltaX) > maxX)
                maxX = Math.abs(tempDeltaX);
            xVector[k] += tempDeltaX;
        }
        //回调函数返回本次迭代结果
        if(typeof callback == "function"){
            callback(i, xVector, maxX);
        }
        //判断是否已达到精度要求
        if(maxX < epsilon)
            return xVector;
    }
    //达到最大迭代次数
    return xVector;
};
/**
 * 非线性方程求根的简单迭代法
 * @param f 迭代式
 * @param initX 迭代的初始值
 * @param epsilon 迭代的精度//TODO
 * @param maxTimes 最大迭代次数
 * @param callback 回调函数
 * @returns {*} todo
 */
DDNA.IterativeMethod.simpleIterative = function(f, initX, epsilon, maxTimes, callback){
    var i;
    var xLast = initX;
    var xNow;

    for(i = 0; i < maxTimes; i++){
        xNow = f(xLast);
        // console.log(xNow);
        if(typeof callback == "function"){
            callback(i, xNow, Math.abs(xNow - xLast));
        }
        if(Math.abs(xNow - xLast) < epsilon){
            return xNow;
        }else{
            xLast = xNow;
        }
    }
};

DDNA.Interpolation = {};

DDNA.Interpolation.Lagrange = function(matrix){
    this.xs = matrix[0];
    this.ys = matrix[1];
    this.cos = [];

    var i, j;

    //计算系数
    var length = this.xs.length;
    for(i = 0; i < length; i++){
        var tempCo = 1;
        for(j = 0; j < length; j++){
            if(j != i){
                tempCo *= this.xs[i] - this.xs[j];
            }
        }
        this.cos[i] = this.ys[i] / tempCo;
    }
};

DDNA.Interpolation.Lagrange.prototype.getCoefficients = function(){
    return this.cos;
};

DDNA.Interpolation.Lagrange.prototype.valueOf = function(x){
    var i;
    var coSum = 0, commonFactor = 1;

    //遍历每一项
    for(i = 0; i < this.xs.length; i++){
        //当x存在于数据点中时直接返回
        if(this.xs[i] == x){
            return this.ys[i];
        }
        //非已存在的数据点，依次计算每一个小项
        //每项分别除以 x - x_{i}, 即可提取公因式 omega_{n+1}(x)
        coSum += this.cos[i] / (x - this.xs[i]);
        //借助本循环计算公因式 omega_{n+1}(x)
        commonFactor *= x - this.xs[i];

    }
    return commonFactor * coSum;
};

DDNA.Interpolation.PieceWiseLagrange = function(matrix, pow){
    var i;
    //先计算将插值点分为几段
    var piece = Math.floor((matrix[0].length - 1) / pow);
    //依次循环构建各段拉格朗日插值
    this.pieces = [];
    for(i = 0; i < piece; i++){
        var pieceMatrix = [];
        pieceMatrix[0] = matrix[0].slice(i * pow, (i + 1) * pow + 1);
        pieceMatrix[1] = matrix[1].slice(i * pow, (i + 1) * pow + 1);
        this.pieces.push({
            lagrange: new DDNA.Interpolation.Lagrange(pieceMatrix),
            start: pieceMatrix[0][0],
            end: pieceMatrix[0][pow]
        });
    }
};

DDNA.Interpolation.PieceWiseLagrange.prototype.valueOf = function(x){
    var i;

    for(i = 0; i < this.pieces.length; i++){
        var piece = this.pieces[i];
        if(piece.start <= x && x <= piece.end){
            return piece.lagrange.valueOf(x);
        }
    }
    return NaN;
};

DDNA.LeastSquareMethod = {};

DDNA.LeastSquareMethod.PolynomialMethod = {};

DDNA.LeastSquareMethod.PolynomialMethod = function(pow, xVector, yVector, rho){
    var i, j;

    if(typeof rho == "undefined"){
        rho = null;
    }

    var phi = [];
    //构造phi(i)的工厂方法
    function constructPhi(pow){
        return function(x){
            return Math.pow(x,pow);
        }
    }
    //构造phi(i)
    for(i = 0; i <= pow; i++){
        phi[i] = constructPhi(i);
    }
    //构造花phi(i)
    var calligraphyPhi = [];
    for(i = 0; i<= pow; i++){
        calligraphyPhi[i] = [];
        for(j = 0; j < xVector.length; j++){
            calligraphyPhi[i][j] = phi[i](xVector[j]);
        }
    }
    //构造线性方程组
    var matrix = [];
    var bVector =[];
    for(i = 0; i <= pow; i++){
        matrix[i] =[];
        for(j = 0; j <= pow; j++){
            matrix[i][j] = DDNA.LeastSquareMethod.PolynomialMethod._vectorMultiply(
                calligraphyPhi[i], calligraphyPhi[j], rho
            );
        }
    }
    for(i = 0; i <= pow; i++){
        bVector[i] = DDNA.LeastSquareMethod.PolynomialMethod._vectorMultiply(
            yVector, calligraphyPhi[i], rho
        );
    }

    //对称正定方程组，使用平方根法
    var coefficients = DDNA.SquareRootMethod.defaultSolve(matrix, bVector).result;

    this.pow = pow;
    this.coefficients = coefficients;
};

DDNA.LeastSquareMethod.PolynomialMethod.prototype.valueOf = function(x){
    var result = 0;
    for(var i = 0; i <= this.pow; i++){
        result += this.coefficients[i] * Math.pow(x, i);
    }
    return result;
};

DDNA.LeastSquareMethod.PolynomialMethod.prototype.getCoefficients = function(){
    return this.coefficients;
};

DDNA.LeastSquareMethod.PolynomialMethod._vectorMultiply = function(xVector, yVector, rho){
    var i, sum = 0;
    if(rho != null){
        for(i = 0; i < xVector.length; i++){
            sum += xVector[i] * yVector[i] *rho[i];
        }
    }else{
        for(i = 0; i < xVector.length; i++){
            sum += xVector[i] * yVector[i];
        }
    }
    return sum;
};