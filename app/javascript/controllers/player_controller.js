/**
 * @file player_controller.js
 * @description 播放器控制器
 */

import { Controller } from "@hotwired/stimulus";
import {diffWords} from "diff";

// Connects to data-controller="player"
export default class extends Controller {

  static targets = ["words", "materialPath", "englishType", "disorder",
    "interval", "startBtn", "pauseBtn", "stopBtn", "currentWord", "progress",
    "eyeShow", "eyeClose", "diffBtn", "userResult"] 

  connect() {
    console.log("player controller connected.");
  }

  initialize() {
    // 所有需要播放的元素
    this.audioElements = [];
    // 播放间隔
    this.timeInterval = 3000;
    // 已经播放的元素
    this.played = [];
    // Timer
    this.timer = null;
    // 是否处于暂停状态
    this.pause = false;
  }

  // 导入语料库
  importMaterials() {
    let path = this.materialPathTarget.value;
    fetch(path).then((res) => {
      return res.text()
    }).then((result) => {
      // console.log(result);
      this.wordsTarget.innerHTML = result;
    });
  }

  // 显示隐藏正在播放的单词
  toggleCurrentWord() {
    let closeEyeBtn = this.eyeCloseTarget;
    let eyeBtn = this.eyeShowTarget;
    let wordContainer = this.currentWordTarget;
    if (closeEyeBtn.style.display === "none") {
      // 隐藏
      closeEyeBtn.style.display = "block";
      eyeBtn.style.display = "none";
      wordContainer.style.visibility = "hidden";
    } else {
      closeEyeBtn.style.display = "none";
      eyeBtn.style.display = "block";
      wordContainer.style.visibility = "visible";
    }
  }

  // 开始播放
  start() {
    let words = this.wordsTarget.value;
    let englishType = this.englishTypeTargets.filter((item) => item.checked === true)[0].value;
    let disorder = this.disorderTargets.filter((item) => item.checked === true)[0].value;
    let interval = parseInt(this.intervalTarget.value, 10);

    words = words.replace("\r\n", "\n").split("\n");

    if (!this.validate(words, englishType, interval, disorder)) {
      return;
    }
    if (parseInt(disorder, 10) === 1) {
      words = this.shuffleSwap(words);
    }
    // 间隔设置
    this.timeInterval = parseInt(interval, 10) * 1000;
    // 动态创建多个source
    for (let i = 0; i < words.length; i ++) {
      this.createAudio(englishType, words[i]);
    }
    this.startBtnTarget.setAttribute("aria-disabled", "true");
    this.pauseBtnTarget.setAttribute("aria-disabled", "false")
    this.stopBtnTarget.setAttribute("aria-disabled", "false")
    this.next()
  }


  // 创建播放器元素
  createAudio(enType, word) {
    let audioContainer = document.querySelector("#audio-container");
    let audioEle = document.createElement("audio");
    audioEle.setAttribute("controls", "")
    audioEle.setAttribute("word-content", word);
    let sourceEle = document.createElement("source");
    sourceEle.setAttribute("type", "audio/mp3");
    let url = `http://dict.youdao.com/dictvoice?type=${enType}&audio=${word}`;
    sourceEle.setAttribute("src", url);
    audioEle.appendChild(sourceEle);
    audioContainer.appendChild(audioEle);
    this.audioElements.push(audioEle);
    audioEle.addEventListener("ended", this.playWordDone.bind(this));
  }

  // 每个单词播放完毕回调
  playWordDone() {
    let self = this;
    this.timer = setTimeout(() => {
      if (self.audioElements.length > 0) {
        self.next();
      } else {
        console.log("all the words finished");
        // 移除监听, 删除元素
        self.stopDictation();
      }
    }, self.timeInterval);
  }

  // 移除事件监听
  stopDictation() {
    this.timer = null;
    for (let i = 0; i < this.played.length; i ++) {
      this.played[i].removeEventListener("ended", this.playWordDone.bind(this));
    }
    for(let i = 0; i < this.audioElements.length; i ++) {
      this.audioElements.removeEventListener("ended", this.playWordDone.bind(this))
    }
    let audioContainer = document.querySelector("#audio-container");
    audioContainer.innerHTML = "";
    this.progressTarget.style.width = "0%";
    this.startBtnTarget.setAttribute("aria-disabled", "false");
    this.pauseBtnTarget.setAttribute("aria-disabled", "true")
    this.stopBtnTarget.setAttribute("aria-disabled", "true")
    this.currentWordTarget.innerHTML = "";
  }

  // 暂停
  pauseDictation() {
    if (!this.pause) {
      clearTimeout(this.timer);
      this.pauseBtnTarget.innerText = "继续";
    } else {
      this.pauseBtnTarget.innerText = "暂停";
      this.next()
    }
    this.pause = !this.pause;
  }

  // 播放下一个单词
  next() {
    if (this.audioElements.length > 0) {
      let e = this.audioElements.shift();
      this.played.push(e);
      console.log(this.audioElements);
      console.log(this.played);
      e.play();
      // 设置当前正在播放的单词
      this.currentWordTarget.innerHTML = e.getAttribute("word-content");
      // 计算progress
      let totalCount = this.audioElements.length + this.played.length;
      let width = parseInt(parseFloat(this.played.length) / parseFloat(totalCount) * 100);
      this.progressTarget.style.width = width + "%";
    }
  }

  // 参数验证
  validate(words, englishType, timeInterval, disorder) {
    // 单词中去除""和非法
    words = words.filter((item) => item !== '');
  
    if (words.length === 0) {
      alert("请输入单词, 一行一个");
      return false;
    }
    englishType = parseInt(englishType, 10);
    if (englishType !== 1 && englishType !== 0) {
      alert("请选择发音类型");
      return false;
    }
    timeInterval = parseInt(timeInterval, 10);
    if (timeInterval <= 0 || timeInterval >= 100) {
      alert("时间间隔范围[1, 99]");
      return false;
    }
    disorder = parseInt(disorder, 10);
    if (disorder !== 1 && disorder !== 0) {
      alert("order参数错误");
      return false;
    }
    return true;
  }

  // 对照结果
  diff() {
    // 原始文本
    let played = [];
    for (let i = 0; i < this.played.length; i ++) {
      played.push(this.played[i].getAttribute("word-content"));
    }
    if (played.length === 0) {
      alert("请听写后对比结果");
      return;
    }
    let originalWords = played.join("\n");
    // 用户文本
    let userResult = this.userResultTarget.value.replace("\r\n", "\n");
    console.log(originalWords, userResult);
    let diff = diffWords(originalWords, userResult),
      display = document.getElementById('display'),
      fragment = document.createDocumentFragment();
    diff.forEach((part) => {
      const color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
      let span = document.createElement('span');
      span.style.color = color;
      span.appendChild(document
        .createTextNode(part.value));
      fragment.appendChild(span);
    });
    display.innerHTML = "";
    display.appendChild(fragment);
  }

  // 打乱数组 
  shuffleSwap(arr) {
    let len = arr.length;
    for (let i = 0; i < len; i ++) {
      let rand = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[rand]] = [arr[rand], arr[i]];
    }
    return arr;
  }

}
