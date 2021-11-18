/**
 * @file home.js
 * @description 单词播放控制器
 * @author ranjiayu
 */
import {disableBtn, enableBtn} from "./ui";
import {diffWords} from "diff";

window._audio_elements = [];
// 播放时间间隔
window._time_interval = 3000;
// 发音风格, 默认英
window._english_type = "1";
// 已经播放的单词
window._played = [];
// timer
window._timer = null;
window._paused = false;

// 暂停/继续
function pause() {
  let btn = document.querySelector("#pause");
  if (!window._paused) {
    clearTimeout(window._timer);
    btn.innerText = "继续";
  } else {
    btn.innerText = "暂停";
    next()
  }
  window._paused = !window._paused;
}

// 打乱数组
function shuffleSwap(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i ++) {
    let rand = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[rand]] = [arr[rand], arr[i]];
  }
  return arr;
}


// 移除所有元素和监听器
function stopDictation() {
  window._timer = null;
  for (let i = 0; i < window._played.length; i ++) {
    window._played[i].removeEventListener("ended", playWordDone);
  }
  let audioContainer = document.querySelector("#audio-container");
  audioContainer.innerHTML = "";
  document.querySelector("#progress").style.width = "0%";
  let stopBtn = document.querySelector("#stop");
  let pauseBtn = document.querySelector("#pause");
  let startBtn = document.querySelector("#start");
  enableBtn(startBtn);
  disableBtn(pauseBtn);
  disableBtn(stopBtn);
  clearCurrentWord();
}

// 清空当前单词
function clearCurrentWord() {
  let currentWord = document.querySelector("#current-word");
  currentWord.innerText = "无";
}

// 每个单词播放完毕回调
function playWordDone() {
  window._timer = setTimeout(() => {
    if (window._audio_elements.length > 0) {
      next();
    } else {
      console.log("all the words finished");
      let startButton = document.querySelector("#start");
      let pauseButton = document.querySelector("#pause");
      let stopButton = document.querySelector("#stop");
      // 按钮disable
      enableBtn(startButton);
      disableBtn(pauseButton);
      disableBtn(stopButton);
      // 移除监听, 删除元素
      stopDictation();
    }
  }, window._time_interval);
}

// 播放下一个单词
function next() {
  if (window._audio_elements.length > 0) {
    let e = window._audio_elements.shift();
    window._played.push(e);
    e.play();
    // 设置当前正在播放的单词
    let currentWord = document.querySelector("#current-word");
    currentWord.innerHTML = e.getAttribute("word-content");
    // 计算progress
    let totalCount = window._audio_elements.length + window._played.length;
    let width = parseInt(parseFloat(window._played.length) / parseFloat(totalCount) * 100);
    document.querySelector("#progress").style.width = width + "%";
  }
}

// 创建多个audio元素
function createAudio(enType, word) {
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
  window._audio_elements.push(audioEle);
  audioEle.addEventListener("ended", playWordDone);
}

// 参数验证
function validate(words, englishType, timeInterval, disorder) {
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


window.onload = () => {
  let startButton = document.querySelector("#start");
  if (startButton) {
    let pauseBtn = document.querySelector("#pause");
    let stopBtn = document.querySelector("#stop");
    startButton.addEventListener("click", () => {
      let wordsEle = document.querySelector("#words");
      let words = wordsEle.value.replace("\r\n", "\n").split("\n");
      let englishType = document.querySelector("input[name='english-type']:checked").value;
      let timeInterval = document.querySelector("#interval").value;
      let disorder = document.querySelector("input[name='disorder']:checked").value;
      // 参数验证
      if (!validate(words, englishType, timeInterval, disorder)) {
        return;
      }
      if (parseInt(disorder, 10) === 1) {
        words = shuffleSwap(words);
      }
      // 间隔设置
      window._time_interval = parseInt(timeInterval, 10) * 1000;
      // 动态创建多个source
      for (let i = 0; i < words.length; i ++) {
        createAudio(englishType, words[i]);
      }
      // 开始播放
      disableBtn(startButton);
      enableBtn(pauseBtn);
      enableBtn(stopBtn);
      next()
    });
  }
  // 暂停
  let pauseBtn = document.querySelector("#pause");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", pause);
  }

  // 停止
  let stopBtn = document.querySelector("#stop");
  if (stopBtn) {
    stopBtn.addEventListener("click", stopDictation);
  }

  // 隐藏/显示单词
  let eyeBtnContainer = document.querySelector(".eye-container");
  if (eyeBtnContainer) {
    eyeBtnContainer.addEventListener("click", () => {
      let closeEyeBtn = document.querySelector("#close-eye-btn");
      let eyeBtn = document.querySelector("#eye-btn");
      let wordContainer = document.querySelector("#current-word");
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
    });
  }

  // Diff
  let diffBtn = document.querySelector("#diffBtn");
  if (diffBtn) {
    diffBtn.addEventListener("click", () => {
      // 原始文本
      let played = [];
      for (let i = 0; i < window._played.length; i ++) {
        played.push(window._played[i].getAttribute("word-content"));
      }
      if (played.length === 0) {
        alert("请听写后对比结果");
        return;
      }
      let originalWords = played.join("\n");
      // 用户文本
      let userResult = document.querySelector("#user-result").value.replace("\r\n", "\n");
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
    });
  }

  // 导入资料库
  let importBtn = document.querySelector("#import-materials");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      let path = document.querySelector("#material-path").value;
      // console.log(path);
      fetch(path).then((res) => {
        return res.text()
      }).then((result) => {
        // console.log(result);
        document.querySelector("#words").innerHTML = result;
      })
    });
  }
};