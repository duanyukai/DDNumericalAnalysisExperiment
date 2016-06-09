$(function(){
    var i;
    var matrix = [];
    matrix[0] = [];
    matrix[1] = [];

    //表格
    var table1 = "<table class='data-table'><tr><td>$x_j$</td>";
    for(i = -5; i <= 5; i += 0.25){
        table1 += "<td>" + i + "</td>";
        matrix[0].push(i);
    }
    table1 += "</tr><tr><td>$y_j$</td>";
    for(i = -5; i <= 5; i += 0.25){
        table1 += "<td>" + (1 / (1 + i * i)).toFixed(5) + "</td>";
        matrix[1].push(1 / (1 + i * i));
    }
    table1 += "</tr></table>";

    $("#data-table-1").append(table1);


    var lagrange1 = new DDNA.Interpolation.Lagrange(matrix);

    //十次插值多项式
    var plot1 = new DDPlot("ten-pow-plot",{
        initMinX: -6.5,
        initMaxX: 6.5,
        initMinY: -3.25,
        initMaxY: 3.25,
        hasGrid: true,
        drawGap: 4,
        autoWidth: true,
        widthHeightRatio: 2
    });

    plot1.addFunction(function(x){
        return lagrange1.valueOf(x);
    });

    plot1.addFunction(function(x){
       return 1 / (1 + x * x);
    },{
        color: "#F77"
    });

    plot1.addPoints(matrix);
    plot1.show();

    //插值比较

    var table2 = "<table class='data-table'><tr><td>$k_j$</td>";
    for(i = 1; i <= 9; i += 1){
        table2 += "<td>" + (0.45 + 0.5 * i) + "</td>";
    }
    table2 += "</tr><tr><td>$插值函数$</td>";
    for(i = 1; i <= 9; i += 1){
        table2 += "<td>" + lagrange1.valueOf(0.45 + 0.5 * i).toFixed(5) + "</td>";
    }
    table2 += "</tr><tr><td>$原函数$</td>";
    for(i = 1; i <= 9; i += 1){
        table2 += "<td>" + (1 / (1 + Math.pow(0.45 + 0.5 * i,2))).toFixed(5) + "</td>";
    }
    table2 += "</tr></table>";

    $("#data-table-2").append(table2);

    var lagrange2 = new DDNA.Interpolation.PieceWiseLagrange(matrix, 1);
    //线性插值
    var plot2 = new DDPlot("linear-plot",{
        initMinX: -6.5,
        initMaxX: 6.5,
        initMinY: -3.25,
        initMaxY: 3.25,
        hasGrid: true,
        drawGap: 4,
        autoWidth: true,
        widthHeightRatio: 2
    });

    plot2.addFunction(function(x){
        return 1 / (1 + x * x);
    },{
        color: "#F77"
    });

    plot2.addFunction(function(x){
        return lagrange2.valueOf(x);
    });

    plot2.addPoints(matrix);
    plot2.show();

    var lagrange3 = new DDNA.Interpolation.PieceWiseLagrange(matrix, 2);
    // 分段二次插值
    var plot3 = new DDPlot("two-pow-plot",{
        initMinX: -6.5,
        initMaxX: 6.5,
        initMinY: -3.25,
        initMaxY: 3.25,
        hasGrid: true,
        drawGap: 4,
        autoWidth: true,
        widthHeightRatio: 2
    });

    plot3.addFunction(function(x){
        return 1 / (1 + x * x);
    },{
        color: "#F77"
    });

    plot3.addFunction(function(x){
        return lagrange3.valueOf(x);
    });

    plot3.addPoints(matrix);
    plot3.show();
});