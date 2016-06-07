//mathstudio的处理模式
/*
 * 默认宽度为10个单位（具体多少像素根据宽度乘比例）
 * 纵向线最少10条最多20条，根据当前宽度为多少个单位来确定
 * 从10个单位开始，
 * 如果缩小视图，纵线仍然跟着10个单位走，缩小到原来的一半后，纵线密度减半，放大同理
 * 举例：
 * xmin -0.617
 * xmax 2.6994
 * ymin -10.62259
 * ymax -7.30582
 * 此时横向每0.25个单位一条纵线
 *
 * 坐标数只能出现在10 x 2 ^ n (n为整数)的位置上，具体级别设置即可
 * 竖线把每两个坐标数之间再分为5份，
 *
 *
 * 如差为11。格子单位是1
 * 差9，格子单位是0.5
 * 差21，格子单位是2
 * 即差除以十后取刚好比其小的2的n次方的值即可
 *
 *
 *
 *
 * 注意横纵比例设置，可以不是一比一
 * 注意设置图像精度（每个函数里的），比如每几个像素取一个点这种，1个像素取一个点肯定最精确，为了快速可以比如5个像素取一个值然后样条
 * 函数可以显示当前鼠标的横纵线焦点，显示在旁边或者图像下方div
 *
 *
 * 函数图像可参考系统资源管理器，只不过这里坐标轴是可以变的
 * 滚轮放大时渐进效果，可能需要大致算一下图像然后放大或者直接scale，慢慢放大变虚了后，重绘
 *
 *
 */

var DDPlot = function(divName, properties){

    //div处理
    this.divName = divName;

    this.width = properties.width;
    this.height = properties.height;

    this.initMinX = properties.initMinX || 10;
    this.initMaxX = properties.initMaxX || 10;
    this.initMinY = properties.initMinY || 10;
    this.initMaxY = properties.initMaxY || 10;

    this.backgroundColor = properties.backgroundColor || "#F9F9F9";
    this.hasGrid = properties.hasGrid;
    this.gridColor = properties.gridColor || "#DDD";
    this.gridWeight = properties.gridWeight;
    this.maxGridNumX = properties.maxGridNumX || 10;
    this.maxGridNumY = properties.maxGridNumY || 10;

    this.drawGap = properties.drawGap || 4;

    this.functions = [];
    this.points = [];
};

DDPlot.prototype.show = function(){
    //创建canvas
    var div = document.getElementById(this.divName);
    this.canvas = document.createElement("canvas");
    div.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    //创建离屏canvas
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenContext = this.offscreenCanvas.getContext("2d");
    //在屏canvas大小
    this.canvas.width = this.width + 40;
    this.canvas.height = this.height + 20;
    //TODO 这里可以处理自适应宽度

    //离屏canvas大小
    this.offscreenCanvas.width = this.width * 3;
    this.offscreenCanvas.height = this.height * 3;

    //背景颜色
    this.canvas.style.background = this.backgroundColor;
    this.offscreenCanvas.style.background = this.backgroundColor;

    this.currentMinX = this.initMinX;
    this.currentMaxX = this.initMaxX;
    this.currentMinY = this.initMinY;
    this.currentMaxY = this.initMaxY;

    this.diffX = this.currentMaxX - this.currentMinX;
    this.diffY = this.currentMaxY - this.currentMinY;

    if(this.diffX <= 0 || this.diffY <= 0){
        throw new Error("坐标系大小有误");
    }
    //坐标系变换
    //在屏
    this.context.translate(40, this.height);
    this.context.scale(1, -1);
    //离屏
    this.offscreenContext.translate(0, this.height * 3);
    this.offscreenContext.scale(1, -1);
    
    //刷新显示界面
    this.refresh();

    //绑定鼠标拖拽事件
    var self = this;
    //鼠标按下事件
    this.canvas.addEventListener("mousedown", function(evt){
        //改变状态
        self.dragging = true;

        //记录初始坐标
        var bRect = self.canvas.getBoundingClientRect();
        self.initMouseX = (evt.clientX - bRect.left) * (self.canvas.width / bRect.width);
        self.initMouseY = (evt.clientY - bRect.top) * (self.canvas.height / bRect.height);
        self.mouseDownMinX = self.currentMinX;
        self.mouseDownMaxX = self.currentMaxX;
        self.mouseDownMinY = self.currentMinY;
        self.mouseDownMaxY = self.currentMaxY;

        return false;
    }, false);
    //鼠标抬起事件
    this.canvas.addEventListener("mouseup", function(evt){
        self.dragging = false;
    }, false);
    //鼠标移动事件
    this.canvas.addEventListener("mousemove", function(evt){
        if(self.dragging){

            var offsetX;
            var offsetY;

            var bRect = self.canvas.getBoundingClientRect();
            self.mouseX = (evt.clientX - bRect.left) * (self.canvas.width/bRect.width);
            self.mouseY = (evt.clientY - bRect.top) * (self.canvas.height/bRect.height);

            offsetX = self.mouseX - self.initMouseX;
            offsetY = self.mouseY - self.initMouseY;

            //TODO 方向注意别反了
            self.currentMinX = self.mouseDownMinX - offsetX / self.scaleX;
            self.currentMaxX = self.mouseDownMaxX - offsetX / self.scaleX;

            self.currentMinY = self.mouseDownMinY + offsetY / self.scaleY;
            self.currentMaxY = self.mouseDownMaxY + offsetY / self.scaleY;

            self.refresh();
        }
    }, false);
    //鼠标移出区域，停止拖动
    this.canvas.addEventListener("mouseleave", function(evt){
        self.dragging = false;
    });
    //鼠标滚轮滚动事件，放大缩小图像
    this.canvas.addEventListener("wheel", function(evt){
        var wheelScale = evt.deltaY / 120;
        if(evt.deltaY > 0){
            wheelScale = 1.1;
        }else{
            wheelScale = 0.91;
        }

        var bRect = self.canvas.getBoundingClientRect();
        self.mouseX = (evt.clientX - bRect.left) * (self.canvas.width/bRect.width);
        self.mouseY = (evt.clientY - bRect.top) * (self.canvas.height/bRect.height);


        var wheelPointX = (self.mouseX - 40) / self.scaleX + self.currentMinX;
        var wheelPointY = (self.height - self.mouseY) / self.scaleY + self.currentMinY;

        self.currentMinX = wheelPointX + (self.currentMinX - wheelPointX) * wheelScale;
        self.currentMaxX = wheelPointX + (self.currentMaxX - wheelPointX) * wheelScale;
        self.currentMinY = wheelPointY + (self.currentMinY - wheelPointY) * wheelScale;
        self.currentMaxY = wheelPointY + (self.currentMaxY - wheelPointY) * wheelScale;

        self.refresh();
    });
};

DDPlot.prototype.addFunction = function(func, properties){
    this.functions.push({
        "func": func,
        "properties": properties || {},
        "data": []
    });
};

DDPlot.prototype.addPoint = function(x, y){

};

DDPlot.prototype.addPoints = function(points){

};

DDPlot.prototype.refresh = function(){
    //重新计算一些变量
    this.scaleX = this.width / (this.currentMaxX - this.currentMinX);
    this.scaleY = this.height / (this.currentMaxY - this.currentMinY);

    // console.log(this);
    // console.log("scalex: " + this.scaleX);
    // console.log("scaley: " + this.scaleY);

    this.diffX = this.currentMaxX - this.currentMinX;
    this.diffY = this.currentMaxY - this.currentMinY;

    //重绘整个界面
    this.context.fillStyle = this.backgroundColor;
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillRect(0,0,this.width + 40,this.height + 20);
    this.context.restore();

    this._drawAxises();
    this._drawFunctions();
    this._drawPoints();
};

// DDPlot.prototype._refreshView = function(){
//
// };

DDPlot.prototype._drawAxises = function(){
    var gridGapX, gridGapY;

    //计算栅格的间距
    //TODO 是否需要2×this.maxGridNumX
    if(this.diffX > this.maxGridNumX){
        gridGapX = 0.5;
        while(this.diffX / this.maxGridNumX > gridGapX){
            gridGapX = gridGapX * 2;
        }
    }else{
        gridGapX = 2;
        while(this.diffX / this.maxGridNumX < gridGapX){
            gridGapX = gridGapX / 2;
        }
    }

    if(this.diffY > this.maxGridNumY){
        gridGapY = 0.5;
        while(this.diffY / this.maxGridNumY > gridGapY){
            gridGapY = gridGapY * 2;
        }
    }else{
        gridGapY = 2;
        while(this.diffY / this.maxGridNumY < gridGapY){
            gridGapY = gridGapY / 2;
        }
    }
    // console.log("diffx: " + this.diffX);
    // console.log("diffy: " + this.diffY);
    // console.log("gridx: " + gridGapX);
    // console.log("gridy: " + gridGapY);

    //绘制栅格
    var tempGridX = Math.ceil(this.currentMinX / gridGapX)  * gridGapX;
    //console.log(tempGridX);
    while(tempGridX < this.currentMaxX){
        //TODO 是否要取整
        var realX = Math.round((tempGridX - this.currentMinX) * this.scaleX - 0.5) + 0.5;
        //绘制整条线
        this.context.beginPath();
        this.context.moveTo(realX, 0);
        this.context.lineTo(realX, this.height);
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.gridColor;
        this.context.stroke();
        //绘制边缘短线
        this.context.beginPath();
        this.context.moveTo(realX, 0);
        this.context.lineTo(realX, 5);
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#666";
        this.context.stroke();
        //绘制数字
        this.context.font = "10pt";
        this.context.textAlign = "center";
        this.context.fillStyle = "blue";
        this.context.save();
        this.context.translate(realX, 0);
        this.context.scale(1, -1);
        this.context.fillText(tempGridX.toString(), 0, 12);
        this.context.restore();
        tempGridX += gridGapX;
    }

    var tempGridY = Math.ceil(this.currentMinY / gridGapY)  * gridGapY;
    //console.log(tempGridY);
    while(tempGridY < this.currentMaxY){
        //TODO 是否要取整
        var realY = Math.round((tempGridY - this.currentMinY) * this.scaleY - 0.5) + 0.5;
        //绘制整条线
        this.context.beginPath();
        this.context.moveTo(0, realY);
        this.context.lineTo(this.width, realY);
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.gridColor;
        this.context.stroke();
        //绘制边缘短线
        this.context.beginPath();
        this.context.moveTo(0, realY);
        this.context.lineTo(5, realY);
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#666";
        this.context.stroke();
        //绘制数字
        //部分计算器仅当该处是10 * 2 ^ n时绘制数字
        //这里为了更详细，显示所有栅格的数字
        this.context.font = "10pt";
        this.context.textAlign = "right";
        this.context.fillStyle = "blue";
        this.context.save();
        this.context.translate(0, realY);
        this.context.scale(1, -1);
        this.context.fillText(tempGridY.toString(), -3, 0);
        this.context.restore();

        tempGridY += gridGapY;
    }

    //绘制矩形边框
    this.context.beginPath();
    this.context.rect(0, 0, this.width - 0.5, this.height - 0.5);
    this.context.lineWidth = 2;
    this.context.strokeStyle = "#666";
    this.context.stroke();

    //如果存在，绘制x, y坐标轴
    if(this.currentMaxX > 0 && this.currentMinX < 0){
        var realXAxis = Math.round(Math.abs(this.currentMinX) * this.scaleX -0.5) + 0.5;
        this.context.beginPath();
        this.context.moveTo(realXAxis, 0);
        this.context.lineTo(realXAxis, this.height);
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#666";
        this.context.stroke();
    }
    if(this.currentMaxY > 0 && this.currentMinY < 0){
        var realYAxis = Math.round(Math.abs(this.currentMinY) * this.scaleY -0.5) + 0.5;
        this.context.beginPath();
        this.context.moveTo(0, realYAxis);
        this.context.lineTo(this.width, realYAxis);
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#666";
        this.context.stroke();
    }


};

DDPlot.prototype._drawFunctions = function(){

    // this._calculatePoints();

    var i, j, k, func;
    for(i = 0; i < this.functions.length; i++){
        func = this.functions[i].func;
        var lastShowY, currentShowY;
        var currentValueX;
        lastShowY = (func(this.currentMinX) - this.currentMinY) * this.scaleY;

        this.context.lineWidth = 2;
        this.context.strokeStyle = this.functions[i].properties.color;

        for(j = 1; j < this.width; j = j + this.drawGap){
            currentValueX = j / this.scaleX + this.currentMinX;
            currentShowY = (func(currentValueX) - this.currentMinY) * this.scaleY;
            this.context.beginPath();
            this.context.moveTo(j - this.drawGap, lastShowY);
            this.context.lineTo(j, currentShowY);
            this.context.stroke();

            lastShowY = currentShowY;
        }
    }
};

DDPlot.prototype._calculatePoints = function(){
    var i, j, k, func;
    for(i = 0; i < this.functions.length; i++){
        func = this.functions[i].func;

        var lastShowY, currentShowY;
        var currentValueX;

        // for(j = -this.width; j <= 2* this.width; j = j + this.drawGap){
        for(j = 0; j <= this.width; j = j + this.drawGap){
            currentValueX = j / this.scaleX + this.currentMinX;
            currentShowY = (func(currentValueX) - this.currentMinY) * this.scaleY;

            this.functions[i].data.push(currentShowY);

            lastShowY = currentShowY;
        }
        //console.log(this.functions[i].data);
    }
};

DDPlot.prototype._drawPoints = function(){

};

var DDPlotFunction = function(){
    //取点密度，连点模式（线段、贝塞尔……）
    //颜色、粗细
};



var DDPlotPoint = function(){
    //大小、颜色、……
};