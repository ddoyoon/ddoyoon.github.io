// https://github.com/kylemcdonald/AppropriatingNewTechnologies/wiki/Week-2

var capture;
var tracker;
var fullX = 1280, fullY = 800;
var w = 640, h = 480;
var dino;
var init = true; var y;
var dinoX, dinoY, dinoW = 90, dinoH = 88;
var gravity = 0.4; var speed = 0;

var jump = false; var duck = false;
var jumpInit;

var obstacle;
var key;
var lowest; var backImg; var captured = false;

var play = true;
var toggle = 1;   // 1 = text input
var input;
var str, str1, str2;
var arr = [];
var score = 0;
var myFont;
var full = false; // full screen?
var started = false;

function preload(){
  dino = loadImage("images/dino.png");
  myFont = loadFont("assets/a영고딕E.ttf");
  myFont2 = loadFont("assets/NanumBarunpenB.ttf")
}

function generateRandomColor() {

  var red = random(256);
  var green = random(256);
  var blue = random(256);

    // mix the color
    red = (red + 255) / 2;
    green = (green + 255) / 2;
    blue = (blue + 255) / 2;

    var c = [red, green, blue];
    return c;
  }

  function obstacleList() {
   this.x = [];
   this.y = [];
   this.width = [];
   this.height = [];
   this.idx = 0;
   this.length = 0;
   this.color = [];
   this.text = [];
   this.temp = 0; // keep track of total obstacles (including deleted ones)
   this.success = [];
 }

 obstacleList.prototype.add = function(newX, newY, newW, newH) {
   this.length++;
   this.x[this.idx] = newX;
   this.y[this.idx] = newY;
   this.width[this.idx] = newW;
   this.height[this.idx] = newH;
   this.color[this.idx] = generateRandomColor();
   this.success[this.idx] = false;

   if(arr.length == 0) this.text[this.idx] = " ";
   else {
    this.text[this.idx] = arr[this.temp % arr.length];
    if(this.text[this.idx].length > 2) this.width[this.idx] = this.text[this.idx].length * 23;
  }
  this.idx++;
  this.temp++;
};

obstacleList.prototype.getX = function(idx) {
 return this.x[idx];
};

obstacleList.prototype.remove = function(deleteX) {
  var index = this.x.indexOf(deleteX);
  if (index > -1) {
    this.x.splice(index, 1);
    this.y.splice(index, 1);
    this.width.splice(index, 1);
    this.height.splice(index, 1);
    this.color.splice(index, 1);
    this.text.splice(index, 1);
    this.success.splice(index, 1);
  }
  this.idx--;
  this.length--;
}

obstacleList.prototype.removeAll = function(){
  for(i = 0; i < this.length; i = i + 1){
    this.x.splice(i, 1);
    this.y.splice(i, 1);
    this.width.splice(i, 1);
    this.height.splice(i, 1);
    this.color.splice(i, 1);
    this.text.splice(i, 1);
    this.success.splice(i, 1);
  }
  this.idx = 0; this.length = 0;  this.temp = 0;
}

obstacleList.prototype.update = function(sp){
  if(play){
    var i;
    for(i = 0; i < this.length; i = i + 1){
      this.x[i] -= sp;
      if(this.x[i] < -this.width[i]) this.remove(this.x[i]);
    }
  }
}

// obstacleList.prototype.moveX = function(idx, sp) {
//   this.x[idx] -= sp;
// }

obstacleList.prototype.drawObstacle = function() {
  var i;
  rectMode(CENTER);
  colorMode(RGB);
  noStroke();

  for(i = 0; i < this.length; i = i + 1){
    fill(this.color[i]);
    rect(this.x[i], this.y[i]+dinoH/2-this.height[i]/2, this.width[i], this.height[i], 10);
    fill(0);
    textSize(18);
    textAlign(CENTER, BASELINE);
    text(this.text[i], this.x[i], this.y[i]+dinoH/2-this.height[i]/2+5);
    //text(":)", this.x[i], this.y[i]+dinoH/2-this.height[i]/2);

}
}

obstacleList.prototype.die = function(xpos, ypos){
  var i;
  for(i = 0; i < this.length; i = i + 1){

    if( Math.abs(this.x[i] - xpos) < dinoW/2 - 35 + this.width[i]/2 && Math.abs(this.y[i] - ypos) < this.height[i]/2 -23 + dinoH/2){

      if(!captured) {
        captured = true;
        //console.log(captured);
      } 
      else {
        noLoop();
      }
      play = false;
      return true;
    }

  }
  return false;
}

function setup() {

  //웹캠을 불러옵니다.

  capture = createCapture(VIDEO);
  createCanvas(fullX, fullY);

  capture.size(w/4, h/4);
  capture.hide();

  colorMode(RGB);

  //얼굴인식을 위한 모델을 불러옵니다.

  tracker = new clm.tracker();
  tracker.init(pModel);
  tracker.start(capture.elt);

  dinoX = fullX/2 - w/4; dinoY = fullY/2+5;
  imageMode(CENTER);
  image(dino, dinoX, dinoY, dinoW, dinoH);

  jumpInit = true; play = true;

  obstacle = new obstacleList();
  textAlign(CENTER);
  textFont(myFont);

  backImg = createCapture(VIDEO);
  backImg.size(w, h);
  backImg.hide();
  noStroke();
  noLoop();

}

function draw() {
  background(255, 118, 130);
  textFont(myFont2);
  textAlign(CENTER);
  textSize(90);
  text("회피 게임", fullX/2, fullY/2-300);
  textSize(30);
  text("이번 판 다시? R을 누르세요!", fullX/2-w/4, fullY/2+330);
  text("새 게임? N을 누르세요!", fullX/2+w/3-34, fullY/2+330);
  textFont(myFont);

  fill(245, 215, 122);
  var rad = 40;
  for(var i = 0; i < w/rad; i++){
    ellipse(fullX/2 - w/2+rad/2+rad*i, fullY/2 - h/2, rad, rad);
    ellipse(fullX/2 - w/2+rad/2+rad*i, fullY/2 + h/2, rad, rad);
  }

  var r = random(400, 600);   //obstacle 간 거리조절
  // 웹캠을 캔버스에 그립니다.
  colorMode(RGB);
  // 인식된 얼굴의 각 부분 좌표값을 positions에 저장합니다.
  var positions = tracker.getCurrentPosition();

  if(!play && captured) {

    imageMode(CENTER);
    image(backImg, fullX/2, fullY/2, w, h);
    stroke(0);
    line(fullX/2 -w/2, fullY/2 + dinoH/2, fullX/2 +w/2, fullY/2 + dinoH/2);
    noStroke();
  }
  else if(play) {
    rectMode(CORNER);

    fill(121,169,51);
    rect(fullX/2-w/2, fullY/2+dinoH/2, w, h/2- dinoH/2);
    fill(84,209,255);
    rect(fullX/2-w/2, fullY/2-h/2, w, h/2 + dinoH/2);
    imageMode(CENTER);
    image(capture, fullX - w/4, fullY - h/4, w/4, h/4);
  }



  if(toggle == -1){
    if(obstacle.length == 0) obstacle.add(fullX/2 + w/2, fullY/2, random(75, 90), random(30, 50));
    else if(obstacle.length < 2 && obstacle.x[0] < fullX/2 + w/2 - obstacle.width[0] - r) obstacle.add(fullX/2 + w/2, fullY/2, random(25, 70), random(30, 50));
  }

  if(toggle == -1 && play && jump){
    dinoY += speed;
    speed += gravity;
    if( dinoY >= fullY/2 + 5){
      jump = false;
    }
  }

  if(toggle == -1 && positions.length>0){
    if(init == true) {
      y = positions[62][1];
      init = false;
      //capture.loadPixels();
    }
    if( jump == false && positions[62][1] < y - 7) {
      //jump
      jump = true;
      speed = -11;
    }
  }

  if(toggle == -1){
    imageMode(CENTER);
    image(dino, dinoX, dinoY, dinoW, dinoH);

  }
    obstacle.drawObstacle();

    if(!obstacle.die(dinoX, dinoY)) {
      obstacle.update(5);

      for(var j = 0; j < obstacle.length; j++){
        if(obstacle.success[j] == false && obstacle.x[j] < dinoX){
          obstacle.success[j] = true;
          score++;
        }
      }
    }

    //cover up
      colorMode(RGB);
      fill(255, 118, 130);
      rectMode(CORNER);
      rect(0, 0, fullX/2 - w/2, fullY);
      rect(fullX + w/2, 0, fullX/2 - w/2, fullY);


    fill(245, 215, 122);

    for(var i = 0; i < h/rad; i++){
    arc(fullX/2 - w/2, fullY/2 - h/2+rad/2+rad*i, rad, rad, HALF_PI, 3*HALF_PI);
    arc(fullX/2 + w/2, fullY/2 - h/2+rad/2+rad*i, rad, rad, -HALF_PI, HALF_PI);
  }
  fill(0);
  textAlign(CENTER);
  textSize(50);
  text(score, fullX/2, fullY/2 + h/4);
  if(started == false) background(0);
}

//restart, jump 기준????
function keyPressed() {
  if (key === "r" || key === 'R') {
    obstacle.removeAll();
    play = true;
    dinoX = fullX/2 - w/4; dinoY = fullY/2 + 5;
    score = 0;
    jump = false;
    init = true;
    captured = false;
    loop();
  }

  if( key === 'n' || key === 'N'){
    location.reload();
  }


  else if(keyCode == ENTER | keyCode == RETURN){

    if(!full) {
      fullScreen(true);
      full = true;
      document.getElementById('fullscreenText').style.display="none";
    }
  }
}

// TODO: new / resume function?

function textInput() {
  // input = createInput();
  // input.position(fullX/2-70, fullY/2);

  button = createButton('submit');
  button.position(fullX/2 + 50, fullY/2);
  button.mousePressed(toggleInput);
}

function toggleInput(){
  //fullScreen(true);
  toggle = toggle * -1;

  str2 = document.getElementById('final_span').innerHTML;
  str1 = document.getElementById('interim_span').innerHTML;

  str = str2;
  if(str.length !== 0) str += " ";
  str += "정말로 힘들때는 숨어도되고 당장 도망쳐도 돼요";
  arr = str.split(/\s+/);
  started = true; play = true;
  loop();
  document.getElementById("main").style.display="none";
}
