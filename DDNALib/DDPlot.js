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
    //初始化参数
    //div名字
    this.divName = divName;
    //初始化图像宽高
    this.width = properties.width;
    this.height = properties.height;

    //初始化绘图区域
    this.initMinX = properties.initMinX/* || 10*/;
    this.initMaxX = properties.initMaxX/* || 10*/;
    this.initMinY = properties.initMinY/* || 10*/;
    this.initMaxY = properties.initMaxY/* || 10*/;

    //初始化颜色等设置
    this.backgroundColor = properties.backgroundColor || "#F9F9F9";
    this.hasGrid = properties.hasGrid;
    this.gridColor = properties.gridColor || "#DDD";
    this.gridWeight = properties.gridWeight;
    this.maxGridNumX = properties.maxGridNumX || 10;
    this.maxGridNumY = properties.maxGridNumY || 10;

    this.drawGap = properties.drawGap || 4;

    //初始化自适应宽度
    this.autoWidth = properties.autoWidth || false;
    this.widthHeightRatio = properties.widthHeightRatio || null;

    //初始化函数、点列表
    this.functions = [];
    this.points = [];
};

DDPlot.prototype.show = function(){
    //创建canvas
    var div = document.getElementById(this.divName);
    //清空内容
    div.innerHTML = "";
    div.style.padding = 0;
    div.style.border = "none";
    div.style.position = "relative";

    this.canvas = document.createElement("canvas");
    div.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");

    //创建离屏canvas
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenContext = this.offscreenCanvas.getContext("2d");

    //在屏canvas大小
    this.canvas.width = this.width + 40;
    this.canvas.height = this.height + 20;

    //离屏canvas大小
    this.offscreenCanvas.width = this.width * 3;
    this.offscreenCanvas.height = this.height * 3;

    //处理自适应宽度
    if(this.autoWidth){
        //实际图像区域大小
        this.width = div.offsetWidth - 40;
        this.height = Math.round(this.width / this.widthHeightRatio);
        //在屏画布大小
        this.canvas.width = div.offsetWidth;
        this.canvas.height = this.height + 20;
        //离屏画布大小
        this.offscreenCanvas.width = this.width * 3;
        this.offscreenCanvas.height = this.height * 3;

        //添加监听div大小改变事件
        function setResizeHandler(callback, timeout){
            var timer_id = undefined;
            window.addEventListener("resize", function(){
                if(timer_id != undefined){
                    clearTimeout(timer_id);
                    timer_id = undefined;
                }
                timer_id = setTimeout(function(){
                    timer_id = undefined;
                    callback();
                }, timeout);
            });
        }

        function callback(){
            //实际图像区域大小
            self.width = div.offsetWidth - 40;
            self.height = Math.round(self.width / self.widthHeightRatio);
            //在屏画布大小
            self.canvas.width = div.offsetWidth;
            self.canvas.height = self.height + 20;
            //离屏画布大小
            self.offscreenCanvas.width = self.width * 3;
            self.offscreenCanvas.height = self.height * 3;

            self._reCalculate();
            self._refreshView();
        }

        setResizeHandler(callback, 300);
    }

    //背景颜色
    this.canvas.style.background = this.backgroundColor;
    this.offscreenCanvas.style.background = this.backgroundColor;

    this.currentMinX = this.initMinX;
    this.currentMaxX = this.initMaxX;
    this.currentMinY = this.initMinY;
    this.currentMaxY = this.initMaxY;



    if(this.diffX <= 0 || this.diffY <= 0){
        throw new Error("坐标系大小有误");
    }

    //新建坐标显示框
    var infoDiv = document.createElement("div");
    infoDiv.style.minWidth = "200px";
    infoDiv.style.position = "absolute";
    infoDiv.style.visibility = "hidden";
    infoDiv.style.pointerEvents = "none";       //IE11及以上，穿透鼠标事件
    infoDiv.style.background = "#EEE";
    infoDiv.style.border = "1px solid #000";
    infoDiv.style.border = "1px solid #000";


    infoDiv.appendChild(document.createElement("span"));
    infoDiv.appendChild(document.createElement("br"));
    infoDiv.appendChild(document.createElement("span"));
    infoDiv.appendChild(document.createElement("br"));
    infoDiv.appendChild(document.createElement("span"));

    this.infoDiv = infoDiv;
    div.appendChild(infoDiv);


    //刷新显示界面
    this._reCalculate();
    this._refreshView();

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
        self._reCalculate();
    }, false);
    //鼠标移动事件
    this.canvas.addEventListener("mousemove", function(evt){
        var i;

        self.infoDiv.style.visibility = "hidden";

        var bRect = self.canvas.getBoundingClientRect();
        var mouseX = (evt.clientX - bRect.left) * (self.canvas.width/bRect.width);
        var mouseY = (evt.clientY - bRect.top) * (self.canvas.height/bRect.height);

        if(self.dragging){
            var offsetX;
            var offsetY;

            self.mouseX = mouseX;
            self.mouseY = mouseY;

            offsetX = self.mouseX - self.initMouseX;
            offsetY = self.mouseY - self.initMouseY;

            self.currentMinX = self.mouseDownMinX - offsetX / self.scaleX;
            self.currentMaxX = self.mouseDownMaxX - offsetX / self.scaleX;

            self.currentMinY = self.mouseDownMinY + offsetY / self.scaleY;
            self.currentMaxY = self.mouseDownMaxY + offsetY / self.scaleY;

            self._refreshView();
        }else{
            //未在拖拽，搜索最近的点或函数，显示相关信息
            var hasFoundPoint  =false;
            var displayX, displayY;
            for(i = 0; i < self.points.length; i++){
                displayX = (self.points[i].x - self.currentMinX) * self.scaleX + 40;
                displayY = self.height - (self.points[i].y - self.currentMinY) * self.scaleY;
                if(Math.abs(displayX - mouseX) < 7 && Math.abs(displayY - mouseY) < 7){
                    infoDiv.style.visibility = "visible";
                    self.infoDiv.style.top = mouseY + 1 + "px";
                    self.infoDiv.style.left = mouseX + 1 + "px";
                    self.infoDiv.childNodes[0].innerHTML = "　点";
                    self.infoDiv.childNodes[2].innerHTML = "X: " + self.points[i].x;
                    self.infoDiv.childNodes[4].innerHTML = "Y: " + self.points[i].y;
                    hasFoundPoint = true;
                    break;
                }
            }
            var realX, realY;
            //仅当未找到点时找函数
            if(!hasFoundPoint){
                for(i = 0; i < self.functions.length; i++){
                    var func = self.functions[i].func;
                    realX = (mouseX - 40) / self.scaleX + self.currentMinX;
                    realY = func(realX);
                    displayY = self.height - (realY - self.currentMinY) * self.scaleY;

                    if(Math.abs(displayY - mouseY) < 7){
                        infoDiv.style.visibility = "visible";
                        self.infoDiv.style.top = mouseY + 1 + "px";
                        self.infoDiv.style.left = mouseX + 1 + "px";
                        self.infoDiv.childNodes[0].innerHTML = "　函数";
                        self.infoDiv.childNodes[2].innerHTML = "X: " + realX;
                        self.infoDiv.childNodes[4].innerHTML = "Y: " + realY;
                        break;
                    }
                }
            }
        }
    }, false);
    //鼠标移出区域，停止拖动
    this.canvas.addEventListener("mouseleave", function(evt){
        self.dragging = false;
        infoDiv.style.visibility = "hidden";

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

        self._reCalculate();
        self._refreshView();

        if(evt.preventDefault)
            evt.preventDefault();
        else if(evt.returnValue)
            evt.returnValue = false;
        return false;
    });
};

DDPlot.prototype.addFunction = function(func, properties){
    this.functions.push({
        func: func,
        properties: properties || {},
        data: []
    });
};

DDPlot.prototype.addPoint = function(x, y, properties){
    this.points.push({
        x: x,
        y: y,
        properties: properties || {}
    });
};

DDPlot.prototype.addPoints = function(points, properties){
    var i, j;
    var row = points.length;
    if(points.length < 2){
        //alert("数据需要有两行（包含两个数组），请检查");
        return;
    }
    if(points[0].length != points[1].length){
        //alert("两行数据个数不同，请检查");
        return;
    }
    for(i = 0; i < row; i++){
        for(j = 0; j < points.length; j++){
            if(typeof points[i][j] != "number"){
                alert((i + 1) + "行" + (j + 1) +"列处输入值非法，请检查");
                return;
            }
        }
    }
    for(i = 0; i < points[0].length; i++){
        this.points.push({
            x: points[0][i],
            y: points[1][i],
            properties: properties || {}
        });
    }
};

DDPlot.prototype._reCalculate = function(){
    //坐标系重置、变换
    //在屏
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.translate(40, this.height);
    this.context.scale(1, -1);
    //离屏
    this.offscreenContext.setTransform(1, 0, 0, 1, 0, 0);
    this.offscreenContext.translate(0, this.height * 3);
    this.offscreenContext.scale(1, -1);

    //重新计算
    this.diffX = this.currentMaxX - this.currentMinX;
    this.diffY = this.currentMaxY - this.currentMinY;

    this.scaleX = this.width / this.diffX;
    this.scaleY = this.height / this.diffY;

    //重绘整个离屏canvas
    this.offscreenContext.fillStyle = this.backgroundColor;
    this.offscreenContext.save();
    this.offscreenContext.setTransform(1, 0, 0, 1, 0, 0);
    this.offscreenContext.fillRect(0, 0, 3 * this.width, 3 * this.height);
    this.offscreenContext.restore();

    this._updateGridGap();
    this._calculateAxises();
    this._calculateFunctions();
    this._calculatePoints();
};

DDPlot.prototype._refreshView = function(){
    //重绘界面

    this.context.fillStyle = this.backgroundColor;
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillRect(0, 0, 40, this.height + 20);
    this.context.fillRect(0, this.height, this.width + 40, this.height + 20);
    this.context.restore();

    this._drawGraph();
    this._drawAxises();
};


DDPlot.prototype._updateGridGap = function(){
    //计算栅格的间距
    if(this.diffX > this.maxGridNumX){
        this.gridGapX = 0.5;
        while(this.diffX / this.maxGridNumX > this.gridGapX){
            this.gridGapX = this.gridGapX * 2;
        }
    }else{
        this.gridGapX = 2;
        while(this.diffX / this.maxGridNumX < this.gridGapX){
            this.gridGapX = this.gridGapX / 2;
        }
        this.gridGapX *= 2;
    }

    if(this.diffY > this.maxGridNumY){
        this.gridGapY = 0.5;
        while(this.diffY / this.maxGridNumY > this.gridGapY){
            this.gridGapY = this.gridGapY * 2;
        }
    }else{
        this.gridGapY = 2;
        while(this.diffY / this.maxGridNumY < this.gridGapY){
            this.gridGapY = this.gridGapY / 2;
        }
        this.gridGapY *= 2;
    }
};

DDPlot.prototype._calculateAxises = function(){
    var tempGridX = Math.ceil((this.currentMinX - this.diffX) / this.gridGapX)  * this.gridGapX;
    while(tempGridX < this.currentMaxX + this.diffY){
        var realX = Math.round((tempGridX - this.currentMinX + this.diffX) * this.scaleX - 0.5) + 0.5;
        //绘制整条线
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(realX, 0);
        this.offscreenContext.lineTo(realX, 3* this.height);
        this.offscreenContext.lineWidth = 1;
        this.offscreenContext.strokeStyle = this.gridColor;
        this.offscreenContext.stroke();

        tempGridX += this.gridGapX;
    }

    var tempGridY = Math.ceil((this.currentMinY - this.diffY) / this.gridGapY)  * this.gridGapY;
    while(tempGridY < this.currentMaxY + this.diffY){
        //TODO 是否要取整
        var realY = Math.round((tempGridY - this.currentMinY + this.diffY) * this.scaleY - 0.5) + 0.5;
        //绘制整条线
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(0, realY);
        this.offscreenContext.lineTo(3 * this.width, realY);
        this.offscreenContext.lineWidth = 1;
        this.offscreenContext.strokeStyle = this.gridColor;
        this.offscreenContext.stroke();

        tempGridY += this.gridGapY;
    }

    //如果存在，计算x, y坐标轴
    if(this.currentMaxX > 0 && this.currentMinX < 0){
        var realXAxis = Math.round(Math.abs(this.currentMinX - this.diffX) * this.scaleX - 0.5) + 0.5;
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(realXAxis, 0);
        this.offscreenContext.lineTo(realXAxis, 3 * this.height);
        this.offscreenContext.lineWidth = 1;
        this.offscreenContext.strokeStyle = "#666";
        this.offscreenContext.stroke();
    }
    if(this.currentMaxY > 0 && this.currentMinY < 0){
        var realYAxis = Math.round(Math.abs(this.currentMinY - this.diffY) * this.scaleY - 0.5) + 0.5;
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(0, realYAxis);
        this.offscreenContext.lineTo(3 * this.width, realYAxis);
        this.offscreenContext.lineWidth = 1;
        this.offscreenContext.strokeStyle = "#666";
        this.offscreenContext.stroke();
    }

};

DDPlot.prototype._calculateFunctions = function(){
    var i, j, func;
    for(i = 0; i < this.functions.length; i++){
        func = this.functions[i].func;
        var lastShowY, currentShowY;
        var currentValueX;

        lastShowY = (func(this.currentMinX - this.diffX) - this.currentMinY + this.diffY) * this.scaleY;

        this.offscreenContext.lineWidth = 2;
        this.offscreenContext.strokeStyle = this.functions[i].properties.color || "#000";

        for(j = 1; j < 3 * this.width; j = j + this.drawGap){
            currentValueX = j / this.scaleX + this.currentMinX - this.diffX;
            currentShowY = (func(currentValueX) - this.currentMinY + this.diffY) * this.scaleY;

            if(!(
                    (currentShowY > 3 * this.height && lastShowY > 3 * this.height) ||
                    (currentShowY < 0 && lastShowY < 0)
                )){
                this.offscreenContext.beginPath();
                this.offscreenContext.moveTo(j - this.drawGap, lastShowY);
                this.offscreenContext.lineTo(j, currentShowY);
                this.offscreenContext.stroke();
            }

            lastShowY = currentShowY;
        }
    }
};

DDPlot.prototype._drawAxises = function(){
    //this._updateGridGap();

    //绘制栅格
    var tempGridX = Math.ceil(this.currentMinX / this.gridGapX)  * this.gridGapX;
    while(tempGridX < this.currentMaxX){
        //TODO 是否要取整
        var realX = Math.round((tempGridX - this.currentMinX) * this.scaleX - 0.5) + 0.5;
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
        tempGridX += this.gridGapX;
    }

    var tempGridY = Math.ceil(this.currentMinY / this.gridGapY)  * this.gridGapY;
    while(tempGridY < this.currentMaxY){
        //TODO 是否要取整
        var realY = Math.round((tempGridY - this.currentMinY) * this.scaleY - 0.5) + 0.5;
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

        tempGridY += this.gridGapY;
    }

    //绘制矩形边框
    this.context.beginPath();
    this.context.rect(0, 0, this.width - 0.5, this.height - 0.5);
    this.context.lineWidth = 2;
    this.context.strokeStyle = "#666";
    this.context.stroke();
};

DDPlot.prototype._drawGraph = function(){

    this.context.save();
    this.context.scale(1, -1);
    this.context.translate(0, -this.height);
    if(this.dragging){
        this.context.drawImage(this.offscreenCanvas,
            this.width - this.mouseX + this.initMouseX,
            this.height - this.mouseY + this.initMouseY,
            this.width, this.height,
            0, 0, this.width, this.height
        )
    }else{
        this.context.drawImage(this.offscreenCanvas, this.width, this.height, this.width, this.height, 0, 0, this.width, this.height);
    }
    this.context.restore();
};

DDPlot.prototype._calculatePoints = function(){
    var i, j, x, y;
    for(i = 0; i < this.points.length; i++){
        x = this.points[i].x;
        y = this.points[i].y;

        this.offscreenContext.fillStyle = this.points[i].properties.color || "#099";
        this.offscreenContext.strokeStyle = this.points[i].properties.color || "#099";
        this.offscreenContext.beginPath();
        var showX = (x + this.diffX - this.currentMinX) * this.scaleX;
        var showY = (y + this.diffY - this.currentMinY) * this.scaleY;


        this.offscreenContext.arc(showX,showY,4,0,2*Math.PI);
        this.offscreenContext.stroke();
        this.offscreenContext.fill();
    }
};


var DDPlotFunction = function(){
    //取点密度，连点模式（线段、贝塞尔……）
    //颜色、粗细
};



var DDPlotPoint = function(){
    //大小、颜色、……
};