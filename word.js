// JavaScript Document
// common 
function $(str) {
	return document.getElementById(str);
}
function $tag(str,target) {
	target = target || document;
	return target.getElementsByTagName(str);
}
// global
// const
var WIDTH = 20, //网格宽度
	HEIGHT = 20, //网格高度
	SAY = ["相当不错，虽然说和CNwander还不是一个级别的","可以啊，再加点油都可以和CNwander媲美了！","一个字，牛，连CNwander都甘拜下风了","差不多行了，别把游戏玩爆了"];
var len = 3, //蛇的长度
	speed, //爬行速度
	gridElems = multiArray(WIDTH,HEIGHT), //单元格对象
	carrier, //承载对象(食物，障碍，滑板，刹车)
	snake, //蛇每节的坐标点
	info, //交互对话
	btnStart, //开始按钮
	topScore = len,
	snakeTimer, //蛇行走计时器
	brakeTimers = [], //随机刹车
	skateTimers = [], //随机滑板
	directkey; // 方向键值 37-40 左上右下
window.onload = function(){
	info = $("say");
	btnStart = $("btnStart");
	initGrid(); //网格初始化
	document.onkeydown = attachEvents; //绑定方向事件
	btnStart.onclick = function (e) {
		btnStart.blur(); //firefox中必须释放焦点
		start(); //游戏开始
		btnStart.setAttribute("disabled",true);
		btnStart.style.color = "#aaa";
	}
}
//开始游戏
function start() {
	len = 3;
	speed = 10;
	directkey = 39;
	carrier = multiArray(WIDTH,HEIGHT);
	snake = new Array();
	clear();
	initSnake(); //蛇初始化
	addObject("food");
	walk();
	addRandomBrake();
}
//创建网格
function initGrid() {
	var body = $tag("body")[0];
	var table = document.createElement("table"),
		tbody = document.createElement("tbody")
	for(var j = 0; j < HEIGHT; j++) {  
		var col = document.createElement("tr");  
		for(var i = 0; i < WIDTH; i++) {  
			var row = document.createElement("td");
			gridElems[i][j] = col.appendChild(row);  
		}
		tbody.appendChild(col);  
	}
	table.appendChild(tbody);
	$("snakeWrap").appendChild(table);
}
//创建蛇
function initSnake() {
	var pointer = randomPointer(len-1, len-1, WIDTH/2);
	for(var i = 0; i < len; i++) {
		var x = pointer[0] - i,
			y = pointer[1];
		snake.push([x,y]);
		carrier[x][y] = "cover";
	}
}
//添加键盘事件
function attachEvents(e) {
	e = e || event;
	directkey = Math.abs(e.keyCode - directkey) != 2 && e.keyCode > 36 && e.keyCode < 41 ? e.keyCode : directkey; //非方向键、反向无效
	return false;
}
function walk() {
	if(snakeTimer) window.clearInterval(snakeTimer);
	snakeTimer = window.setInterval(step, Math.floor(3000/speed));
}
function step() {
	//获取目标点
	var headX = snake[0][0],
		headY = snake[0][1];
	switch(directkey) {
		case 37: headX -= 1; break;
		case 38: headY -= 1; break;
		case 39: headX += 1; break
		case 40: headY += 1; break;
	}
	//碰到边界，阻挡物，则结束游戏
	if(headX >= WIDTH || headX < 0 || headY >= HEIGHT || headY < 0 || carrier[headX][headY] == "block" || carrier[headX][headY] == "cover" ) {
		trace("GAME OVER");
		if(getText($("score"))*1 < len) trace(len,$("score"));
		btnStart.removeAttribute("disabled");
		btnStart.style.color = "#000";
		window.clearInterval(snakeTimer);
		for(var i = 0; i < brakeTimers.length; i++) window.clearTimeout(brakeTimers[i]);
		for(var i = 0; i < skateTimers.length; i++) window.clearTimeout(skateTimers[i]);
		return;
	}
	//加速
	if(len % 4 == 0 && speed < 60 && carrier[headX][headY] == "food") {
		speed += 5;
		walk();	
		trace("加速！");
	}
	//捡到刹车
	if(carrier[headX][headY] == "brake") {
		speed = 5;
		walk();
		trace("恭喜！捡到刹车一个。");
	}
	//遭遇滑板
	if(carrier[headX][headY] == "skate") {
		speed += 20;
		walk();
		trace("遭遇滑板！");
	}	
	//添加阻挡物
	if(len % 6 == 0 && len < 60 && carrier[headX][headY] == "food") {
		addObject("block");
	}	
	//对话
	if(len <= 40 && len % 10 == 0) {
		var cheer = SAY[len/10-1];
		trace(cheer);
	}	
	//吃东西
	if(carrier[headX][headY] != "food") {
		var lastX = snake[snake.length-1][0],
			lastY = snake[snake.length-1][1];
		carrier[lastX][lastY] = false;
		gridElems[lastX][lastY].className = "";
		snake.pop();
	} else {
		carrier[headX][headY] = false;
		trace("吃到食物");
		addObject("food");
	}
	snake.unshift([headX,headY]);
	carrier[headX][headY] = "cover";
	gridElems[headX][headY].className = "cover";
	
	len = snake.length;
}
//添加物品
function addObject(name) {
	var p = randomPointer();
	carrier[p[0]][p[1]] = name;
	gridElems[p[0]][p[1]].className = name;
}

//添加随机数量刹车和滑板
function addRandomBrake() {
	var num = randomNum(1,5);
	for(var i = 0; i < num; i++) {
		brakeTimers.push( window.setTimeout(function(){addObject("brake")},randomNum(10000,100000)) );
		skateTimers.push( window.setTimeout(function(){addObject("skate")},randomNum(5000,100000)) );
	}		 
}
//输出信息
function trace(sth,who) {
	who = who || info;
	if(document.all) who.innerText = sth;
	else who.textContent = sth;
}
//获取信息
function getText(target) {
	if(document.all) return target.innerText;
	else return target.textContent;
}
//创建二维数组
function multiArray(m,n) {
	var arr =  new Array(n);
	for(var i=0; i<m; i++) 
		arr[i] = new Array(m);
	return arr;
}
//清除画面
function clear() {
	for(var y = 0; y < gridElems.length; y++) {
		for(var x = 0; x < gridElems[y].length; x++) {
			gridElems[x][y].className = "";
		}
	}
}
//产生指定范围随机点
function randomPointer(startX,startY,endX,endY) {
	startX = startX || 0;
	startY = startY || 0;
	endX = endX || WIDTH;
	endY = endY || HEIGHT;
	var p = [],
		x = randomNum(startX,endX);
		y = randomNum(startY,endY);				
	if(carrier[x][y]) return randomPointer(startX,startY,endX,endY);
	p[0] = x;
	p[1] = y;
	return p;
}
//产生随机整数
function randomNum(start,end) {
	return Math.floor(Math.random()*(end - start)) + start;
}