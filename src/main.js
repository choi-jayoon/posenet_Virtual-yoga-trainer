let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel;
let n;

let mistake = [];
let input = [];
let angle = [];
let trainer = [];

let state = 'waiting';

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 8,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyReady() {
  state='waiting'
  if (pose) {
    let nose = pose.keypoints[0].score;
    let ankleR = pose.keypoints[14].score;
    if ((nose > 0.5) && (ankleR > 0.5)) {
      //console.log('detect');
      state = 'detect';
    } else {
      state = 'waiting';
      //console.log('waiting');
    }
  }
}

function classifyPose() {
  classifyReady();
  if (pose && (state == 'detect')) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } 
  else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.8) {
    poseLabel = results[0].label;
    console.log(results[0].confidence);
    console.log(results[0].label);
    $.getJSON('trainer_angle.json', function (data) {
      console.log(data);
      n = 0;
      switch (String(poseLabel)) {
        case '0':
          n = 0;
          break;
        case '1':
          n = 1;
          break;
        case '2':
          n = 2;
          break;
        case '3':
          n = 3;
          break;
        case '4':
          n = 4;
          break;
        case '5':
          n = 5;
          break;
        case '6':
          n = 6;
          break;
        case '7':
          n = 7;
          break;
      }
    console.log("n:"+n);
    console.log(String(poseLabel));
      for (let i = 0; i < 8; i++) {
        trainer[i] = data[n][i];
      }
    })
    setTimeout(savePose, 5000);
  } else {
    classifyPose();
  }
  // 5초 후 자세 측정을 시작합니다.
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;

    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
    }
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
      if (mistake.includes(i)) {
        fill(255, 0 , 0);
        ellipse(x, y, 20, 20);
      }
    }
  }

  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(100);
  textAlign(CENTER, CENTER);
  text(state, width / 2, height / 2);
}

function savePose() {
  input = [];
  console.log(pose);
  for (let i = 0; i < pose.keypoints.length; i++) {
    let x = pose.keypoints[i].position.x;
    let y = pose.keypoints[i].position.y;
    input.push(x);
    input.push(y);
  }
  calcAngle();
}

function calcAngle() {
  angle = [];
  angle[0] = (Math.abs((Math.atan2(input[31] - input[27], input[30] - input[26])) + Math.abs(Math.atan2(input[23] - input[27], input[22] - input[26])))) * (180 / Math.PI);
  angle[1] = 360 - (Math.abs((Math.atan2(input[33] - input[29], input[32] - input[28])) + Math.abs(Math.atan2(input[25] - input[29], input[24] - input[28])))) * (180 / Math.PI);

  angle[2] = (Math.abs(Math.atan2(input[27] - input[23], input[26] - input[22])) + Math.abs(Math.atan2(input[11] - input[23], input[10] - input[22]))) * (180 / Math.PI);
  angle[3] = 360 - (Math.abs(Math.atan2(input[29] - input[25], input[28] - input[24])) + Math.abs(Math.atan2(input[13] - input[25], input[12] - input[24]))) * (180 / Math.PI);

  angle[4] = (Math.abs(Math.atan2(input[19] - input[15], input[18] - input[14])) + Math.abs(Math.atan2(input[11] - input[15], input[10] - input[14]))) * (180 / Math.PI);
  angle[5] = 360 - (Math.abs(Math.atan2(input[21] - input[17], input[20] - input[16])) + Math.abs(Math.atan2(input[13] - input[17], input[12] - input[16]))) * (180 / Math.PI);

  angle[6] = (Math.abs(Math.atan2(input[23] - input[11], input[22] - input[10])) + Math.abs(Math.atan2(input[15] - input[11], input[14] - input[10]))) * (180 / Math.PI);
  angle[7] = 360 - (Math.abs(Math.atan2(input[17] - input[13], input[16] - input[12])) + Math.abs(Math.atan2(input[25] - input[13], input[24] - input[12]))) * (180 / Math.PI);
  cmpAngle();
}

function cmpAngle() {
  let cmp;
  let pass = true;
  mistake = [];
  for (let i = 0; i < 8; i++) {
    cmp = angle[i] - trainer[i];
    if (Math.abs(cmp) > 30) {
      console.log(trainer[i]);
      console.log(angle[i]);
      console.log(cmp);
      pass = false;
      switch (i) {
        case 0:
          console.log("왼쪽 무릎");
          mistake.push(13);
          break;
        case 1:
          console.log("오른쪽 무릎");
          mistake.push(14);
          break;
        case 2:
          console.log("왼쪽 상체와 하체");
          mistake.push(11);
          break;
        case 3:
          console.log("오른쪽 상체와 하체");
          mistake.push(12);
          break;
        case 4:
          console.log("왼쪽 팔꿈치");
          mistake.push(7);
          break;
        case 5:
          console.log("오른쪽 팔꿈치");
          mistake.push(8);
          break;
        case 6:
          console.log("왼쪽 팔과 상체");
          mistake.push(5);
          break;
        case 7:
          console.log("오른쪽 팔과 상체");
          mistake.push(6);
          break;
      }
      if (cmp > 0) {
        console.log("더 구부리세요.");
      } else {
        console.log("더 펴세요.");
      }
    }
  }

  if (pass) {
    // 5초간 유지하세요
    console.log("5s start");
    setTimeout(posechange, 5000);
  } 
  else {
    // 3초 후 다시 측정합니다.
    console.log("3s start");
    setTimeout(savePose, 3000);
  }
}

function posechange() {
  console.log("change pose");
  setTimeout(classifyPose, 5000);
}