/*******************************************************
 * 專案名稱：動物配對題 (Animal Matching Game)
 * 說明：
 * 1. 已串接老師提供的 Google Sheet CSV 線上題庫網址。
 * 2. 每次進入或重來時隨機抽取 5 題進行互動配對。
 * 3. 學生全部作答完成並點擊交卷後，顯示總分與單元弱點分析。
 * 4. 採用響應式全螢幕，動態 GIF 圖片支援，與指定的 Google Fonts。
 *******************************************************/

// ---------------------------------------------------
// 1. 全局變數與設定
// ---------------------------------------------------

// 老師的 Google Sheet 發佈 CSV 線上題庫連結
let googleSheetCSVUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnj9y_dT8Zvz3EzVKKnDx7vM33tI2fZipJ6V-R_p7m9lmAfM-tGsEBZuGzqiC99tV4yYubK5_uhL6P/pub?gid=0&single=true&output=csv";

// 20 題預備題庫 (當網路中斷或線上 CSV 載入失敗時自動備援)
const defaultQuestions = [
  { English: "Lion", Chinese: "獅子", Unit: "陸地哺乳類", ImgUrl: "https://media.giphy.com/media/l1Kdc06n3E3k3yLvy/giphy.gif" },
  { English: "Tiger", Chinese: "老虎", Unit: "陸地哺乳類", ImgUrl: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif" },
  { English: "Elephant", Chinese: "大象", Unit: "陸地哺乳類", ImgUrl: "https://media.giphy.com/media/3o7TKx2T2G5Osqb0fC/giphy.gif" },
  { English: "Giraffe", Chinese: "長頸鹿", Unit: "陸地哺乳類", ImgUrl: "https://media.giphy.com/media/3o7TKp3XAnG8419g0U/giphy.gif" },
  { English: "Bear", Chinese: "熊", Unit: "陸地哺乳類", ImgUrl: "https://media.giphy.com/media/3o7TKTvS1T9p8o3cHe/giphy.gif" },

  { English: "Dolphin", Chinese: "海豚", Unit: "海洋生物", ImgUrl: "https://media.giphy.com/media/l0HlOBZehRByZpOiQ/giphy.gif" },
  { English: "Whale", Chinese: "鯨魚", Unit: "海洋生物", ImgUrl: "https://media.giphy.com/media/3o7TKP4x0k94t32mwo/giphy.gif" },
  { English: "Shark", Chinese: "鯊魚", Unit: "海洋生物", ImgUrl: "https://media.giphy.com/media/3o7TKV2T0L35X3N3Hq/giphy.gif" },
  { English: "Penguin", Chinese: "企鵝", Unit: "海洋生物", ImgUrl: "https://media.giphy.com/media/3o7TKU8RvQuomFfUUU/giphy.gif" },
  { English: "Octopus", Chinese: "章魚", Unit: "海洋生物", ImgUrl: "https://media.giphy.com/media/3o7TKx7c7H1H0cK2R2/giphy.gif" },

  { English: "Eagle", Chinese: "老鷹", Unit: "鳥類家族", ImgUrl: "https://media.giphy.com/media/3o7TKDkDbIDJ345v8I/giphy.gif" },
  { English: "Owl", Chinese: "貓頭鷹", Unit: "鳥類家族", ImgUrl: "https://media.giphy.com/media/3o7TKs873O20P90eAM/giphy.gif" },
  { English: "Parrot", Chinese: "鸚鵡", Unit: "鳥類家族", ImgUrl: "https://media.giphy.com/media/3o7TKR153NmsT6qA36/giphy.gif" },
  { English: "Duck", Chinese: "鴨子", Unit: "鳥類家族", ImgUrl: "https://media.giphy.com/media/3o7TKp7S0Y3C9r0cWQ/giphy.gif" },
  { English: "Flamingo", Chinese: "紅鶴", Unit: "鳥類家族", ImgUrl: "https://media.giphy.com/media/3o7TKz3fK2iX1QeU3m/giphy.gif" },

  { English: "Frog", Chinese: "青蛙", Unit: "兩棲與爬蟲", ImgUrl: "https://media.giphy.com/media/3o7TKD0s1R1i1L21pC/giphy.gif" },
  { English: "Turtle", Chinese: "烏龜", Unit: "兩棲與爬蟲", ImgUrl: "https://media.giphy.com/media/3o7TKRf0J2R1A3mP04/giphy.gif" },
  { English: "Snake", Chinese: "蛇", Unit: "兩棲與爬蟲", ImgUrl: "https://media.giphy.com/media/3o7TKP124J0m3N3I3e/giphy.gif" },
  { English: "Crocodile", Chinese: "鱷魚", Unit: "兩棲與爬蟲", ImgUrl: "https://media.giphy.com/media/3o7TKq1k06jG8dGvle/giphy.gif" },
  { English: "Chameleon", Chinese: "變色龍", Unit: "兩棲與爬蟲", ImgUrl: "https://media.giphy.com/media/3o7TKz4S0824p1V7yM/giphy.gif" }
];

// 遊戲內部狀態控制變數
let rawQuestionsData = [];      // 讀取到的原始題庫資料
let currentQuiz = [];          // 當前抽出的 5 題
let imgCards = [];             // 左側 GIF 圖片卡片物件
let targetSlots = [];          // 右側目標投放框物件
let draggingCard = null;       // 當前被拖曳的卡片
let offsetX = 0, offsetY = 0;   // 拖曳時游標相對於卡片的偏移量

let gameState = 'PLAYING';     // 狀態：'PLAYING' (答題中) / 'RESULT' (顯示結算與分析)
let submitBtn = { x: 0, y: 0, w: 140, h: 45 };  // 提交答案按鈕
let restartBtn = { x: 0, y: 0, w: 160, h: 45 }; // 再試一次按鈕

let finalScore = 0;            // 計算出的最終分數
let weakUnits = [];            // 需加強的單元列表

// ---------------------------------------------------
// 2. p5.js Preload (預載入線上 CSV 題庫)
// ---------------------------------------------------
function preload() {
  if (googleSheetCSVUrl && googleSheetCSVUrl.trim() !== "") {
    // 使用 loadTable 載入線上 CSV
    loadTable(googleSheetCSVUrl, 'csv', 'header',
      (table) => {
        rawQuestionsData = [];
        for (let r = 0; r < table.getRowCount(); r++) {
          let eng = table.getString(r, 'English');
          let chi = table.getString(r, 'Chinese');
          let unit = table.getString(r, 'Unit');
          let img = table.getString(r, 'ImgUrl');

          if (eng && chi && img) {
            rawQuestionsData.push({
              English: eng.trim(),
              Chinese: chi.trim(),
              Unit: unit ? unit.trim() : "一般單元",
              ImgUrl: img.trim()
            });
          }
        }
        console.log("已成功從 Google Sheet 載入 " + rawQuestionsData.length + " 筆題目！");
      },
      (err) => {
        console.warn("線上題庫載入失敗，啟動備用題庫。錯誤資訊：", err);
        rawQuestionsData = defaultQuestions;
      }
    );
  } else {
    rawQuestionsData = defaultQuestions;
  }
}

// ---------------------------------------------------
// 3. Setup (畫布初始化)
// ---------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);

  if (!rawQuestionsData || rawQuestionsData.length === 0) {
    rawQuestionsData = defaultQuestions;
  }

  // 初始化遊戲（抽題與建立物件）
  initGame();
}

// ---------------------------------------------------
// 4. 初始化 / 重置遊戲 (initGame)
// ---------------------------------------------------
function initGame() {
  gameState = 'PLAYING';
  draggingCard = null;
  finalScore = 0;
  weakUnits = [];

  // 清除先前建立的 HTML GIF DOM 元素
  let oldGifs = selectAll('.gif-img');
  for (let g of oldGifs) {
    g.remove();
  }

  // 洗牌題庫並隨機抽出 5 題
  let shuffled = shuffle([...rawQuestionsData]);
  currentQuiz = shuffled.slice(0, min(5, shuffled.length));

  // 計算響應式卡片尺寸與間距
  let cardW = min(width * 0.18, 140);
  let cardH = cardW * 0.9;
  let startY = height * 0.2;
  let gapY = (height * 0.65) / currentQuiz.length;

  // 1. 建立左側【GIF 圖片卡片】
  imgCards = [];
  for (let i = 0; i < currentQuiz.length; i++) {
    let item = currentQuiz[i];

    // 使用 p5.dom createImg 以保持 GIF 動畫撥放
    let imgDom = createImg(item.ImgUrl, item.English);
    imgDom.addClass('gif-img');
    imgDom.style('pointer-events', 'none'); // 避免干擾拖曳滑鼠事件

    let initX = width * 0.15;
    let initY = startY + i * gapY;

    imgCards.push({
      id: i,
      data: item,
      dom: imgDom,
      x: initX,
      y: initY,
      initX: initX,
      initY: initY,
      w: cardW,
      h: cardH,
      assignedSlot: null // 綁定的目標框 ID
    });
  }

  // 2. 建立右側【目標投放框】（名稱隨機打亂）
  let textOptions = shuffle([...currentQuiz]);
  targetSlots = [];
  for (let i = 0; i < currentQuiz.length; i++) {
    let targetX = width * 0.65;
    let targetY = startY + i * gapY;

    targetSlots.push({
      id: i,
      data: textOptions[i],
      x: targetX,
      y: targetY,
      w: cardW * 1.5,
      h: cardH,
      occupant: null // 當前放入的卡片
    });
  }
}

// ---------------------------------------------------
// 5. 主繪製循環 (draw)
// ---------------------------------------------------
function draw() {
  background(240, 244, 248);

  // 繪製遊戲頂部標題
  drawTitleHeader();

  if (gameState === 'PLAYING') {
    drawPlayingScreen();
  } else if (gameState === 'RESULT') {
    drawResultScreen();
  }

  // 同步更新 HTML GIF 圖片在畫布上的座標與尺寸
  syncGifPositions();
}

// ---------------------------------------------------
// 6. 繪製標題與說明文字
// ---------------------------------------------------
function drawTitleHeader() {
  fill(44, 62, 80);
  noStroke();
  textAlign(CENTER, CENTER);

  // 遊戲名稱（使用 Google Fonts LXGW WenKai Mono TC 中文字體）
  textFont('LXGW WenKai Mono TC');
  textSize(min(width * 0.035, 36));
  textStyle(BOLD);
  text("動物配對題", width / 2, height * 0.06);

  // 操作說明
  textSize(min(width * 0.016, 16));
  textStyle(NORMAL);
  fill(100, 110, 120);
  text("將左側的可動 GIF 動物圖片拖曳配對至右側對應的名稱框中", width / 2, height * 0.1);
}

// ---------------------------------------------------
// 7. 繪製作答中畫面
// ---------------------------------------------------
function drawPlayingScreen() {
  // 1. 繪製右側目標框
  for (let slot of targetSlots) {
    strokeWeight(2);
    if (slot.occupant) {
      fill(235, 245, 255);
      stroke(52, 152, 219);
    } else {
      fill(255);
      stroke(200, 205, 210);
    }
    rect(slot.x, slot.y, slot.w, slot.h, 12);

    // 繪製英文名稱（使用 Google Fonts Dhurjati 英文字體）
    noStroke();
    textAlign(CENTER, CENTER);
    textFont('Dhurjati');
    textSize(min(slot.h * 0.38, 32));
    fill(41, 128, 185);
    text(slot.data.English, slot.x + slot.w * 0.68, slot.y + slot.h * 0.35);

    // 繪製中文名稱（使用 Google Fonts LXGW WenKai Mono TC 中文字體）
    textFont('LXGW WenKai Mono TC');
    textSize(min(slot.h * 0.28, 20));
    fill(100, 110, 120);
    text(slot.data.Chinese, slot.x + slot.w * 0.68, slot.y + slot.h * 0.7);
  }

  // 2. 繪製左側卡片底框
  for (let card of imgCards) {
    if (card === draggingCard) continue; // 拖曳中的卡片最後才畫，以確保在最上層
    drawCardBorder(card);
  }

  if (draggingCard) {
    drawCardBorder(draggingCard);
  }

  // 3. 學生全部完成配對時，顯示「提交答案」按鈕
  let isAllAnswered = imgCards.every(c => c.assignedSlot !== null);
  if (isAllAnswered) {
    drawSubmitButton();
  }
}

// 繪製卡片外框
function drawCardBorder(card) {
  strokeWeight(2);
  stroke(52, 152, 219);
  fill(255);
  if (card === draggingCard) {
    fill(245, 250, 255);
    stroke(41, 128, 185);
  }
  rect(card.x, card.y, card.w, card.h, 10);
}

// 繪製提交答案按鈕
function drawSubmitButton() {
  submitBtn.x = width / 2 - submitBtn.w / 2;
  submitBtn.y = height * 0.88;

  let isHover = mouseX > submitBtn.x && mouseX < submitBtn.x + submitBtn.w &&
                mouseY > submitBtn.y && mouseY < submitBtn.y + submitBtn.h;

  fill(isHover ? color(39, 174, 96) : color(46, 204, 113));
  noStroke();
  rect(submitBtn.x, submitBtn.y, submitBtn.w, submitBtn.h, 22);

  fill(255);
  textFont('LXGW WenKai Mono TC');
  textSize(18);
  textAlign(CENTER, CENTER);
  text("提交答案", submitBtn.x + submitBtn.w / 2, submitBtn.y + submitBtn.h / 2);
}

// ---------------------------------------------------
// 8. 繪製結算與弱點分析畫面
// ---------------------------------------------------
function drawResultScreen() {
  // 1. 繪製配對結果標示 (O / X)
  for (let slot of targetSlots) {
    let card = slot.occupant;
    let isCorrect = card && (card.data.English === slot.data.English);

    strokeWeight(3);
    stroke(isCorrect ? color(46, 204, 113) : color(231, 76, 60));
    fill(isCorrect ? color(235, 247, 240) : color(253, 237, 236));
    rect(slot.x, slot.y, slot.w, slot.h, 12);

    textFont('Dhurjati');
    textSize(min(slot.h * 0.38, 32));
    fill(44, 62, 80);
    textAlign(CENTER, CENTER);
    text(slot.data.English + " (" + slot.data.Chinese + ")", slot.x + slot.w * 0.65, slot.y + slot.h * 0.4);

    // 標示 O 或 X
    textFont('LXGW WenKai Mono TC');
    textSize(30);
    fill(isCorrect ? color(46, 204, 113) : color(231, 76, 60));
    text(isCorrect ? "O" : "X", slot.x + slot.w - 30, slot.y + slot.h / 2);
  }

  for (let card of imgCards) {
    drawCardBorder(card);
  }

  // 2. 成績與單元弱點分析卡片 (中央)
  let pX = width * 0.33;
  let pY = height * 0.22;
  let pW = width * 0.28;
  let pH = height * 0.58;

  fill(255);
  stroke(220, 225, 230);
  strokeWeight(2);
  rect(pX, pY, pW, pH, 16);

  // 分數標題
  noStroke();
  fill(44, 62, 80);
  textFont('LXGW WenKai Mono TC');
  textSize(22);
  textAlign(CENTER, TOP);
  text("測驗結果", pX + pW / 2, pY + 25);

  textSize(48);
  fill(finalScore >= 80 ? color(39, 174, 96) : color(230, 126, 34));
  text(finalScore + " 分", pX + pW / 2, pY + 65);

  // 單元弱點分析提示
  textSize(16);
  fill(50);
  textAlign(LEFT, TOP);
  let analysisY = pY + 140;
  let margin = 25;

  text("【單元學習弱點分析】", pX + margin, analysisY);

  if (weakUnits.length === 0) {
    fill(39, 174, 96);
    text("恭喜你！所有單元概念皆非常熟悉，表現相當優異！", pX + margin, analysisY + 35, pW - margin * 2);
  } else {
    fill(192, 57, 43);
    let advice = "建議針對以下單元進行加強複習：\n\n" + weakUnits.map(u => "• " + u).join("\n");
    text(advice, pX + margin, analysisY + 35, pW - margin * 2);
  }

  // 3. 再試一次按鈕
  restartBtn.x = pX + pW / 2 - restartBtn.w / 2;
  restartBtn.y = pY + pH - 65;

  let isHover = mouseX > restartBtn.x && mouseX < restartBtn.x + restartBtn.w &&
                mouseY > restartBtn.y && mouseY < restartBtn.y + restartBtn.h;

  fill(isHover ? color(41, 128, 185) : color(52, 152, 219));
  noStroke();
  rect(restartBtn.x, restartBtn.y, restartBtn.w, restartBtn.h, 22);

  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("再試一次", restartBtn.x + restartBtn.w / 2, restartBtn.y + restartBtn.h / 2);
}

// ---------------------------------------------------
// 9. GIF 圖檔 DOM 座標同步
// ---------------------------------------------------
function syncGifPositions() {
  for (let card of imgCards) {
    let padding = 8;
    card.dom.position(card.x + padding, card.y + padding);
    card.dom.size(card.w - padding * 2, card.h - padding * 2);
  }
}

// ---------------------------------------------------
// 10. 滑鼠 / 觸控互動邏輯
// ---------------------------------------------------
function mousePressed() {
  if (gameState === 'PLAYING') {
    // 檢查點擊卡片
    for (let i = imgCards.length - 1; i >= 0; i--) {
      let card = imgCards[i];
      if (mouseX > card.x && mouseX < card.x + card.w &&
          mouseY > card.y && mouseY < card.y + card.h) {

        draggingCard = card;
        offsetX = mouseX - card.x;
        offsetY = mouseY - card.y;

        // 若卡片已在某框內，先解除該框的佔用關係
        if (card.assignedSlot !== null) {
          targetSlots[card.assignedSlot].occupant = null;
          card.assignedSlot = null;
        }
        break;
      }
    }

    // 檢查點擊「提交答案」
    let isAllAnswered = imgCards.every(c => c.assignedSlot !== null);
    if (isAllAnswered && mouseX > submitBtn.x && mouseX < submitBtn.x + submitBtn.w &&
        mouseY > submitBtn.y && mouseY < submitBtn.y + submitBtn.h) {
      evaluateResults();
    }
  } else if (gameState === 'RESULT') {
    // 檢查點擊「再試一次」
    if (mouseX > restartBtn.x && mouseX < restartBtn.x + restartBtn.w &&
        mouseY > restartBtn.y && mouseY < restartBtn.y + restartBtn.h) {
      initGame();
    }
  }
}

function mouseDragged() {
  if (draggingCard && gameState === 'PLAYING') {
    draggingCard.x = mouseX - offsetX;
    draggingCard.y = mouseY - offsetY;
  }
}

function mouseReleased() {
  if (draggingCard && gameState === 'PLAYING') {
    let cardCX = draggingCard.x + draggingCard.w / 2;
    let cardCY = draggingCard.y + draggingCard.h / 2;
    let isMatched = false;

    // 檢查卡片中心點是否落在某個目標框中
    for (let slot of targetSlots) {
      if (cardCX > slot.x && cardCX < slot.x + slot.w &&
          cardCY > slot.y && cardCY < slot.y + slot.h) {

        // 若目標框已有卡片，將原卡片踢回左側預設點
        if (slot.occupant && slot.occupant !== draggingCard) {
          let prevCard = slot.occupant;
          prevCard.x = prevCard.initX;
          prevCard.y = prevCard.initY;
          prevCard.assignedSlot = null;
        }

        // 吸附卡片至目標框
        slot.occupant = draggingCard;
        draggingCard.assignedSlot = slot.id;
        draggingCard.x = slot.x + 10;
        draggingCard.y = slot.y + (slot.h - draggingCard.h) / 2;

        isMatched = true;
        break;
      }
    }

    // 未放進任何框時彈回起點
    if (!isMatched) {
      draggingCard.x = draggingCard.initX;
      draggingCard.y = draggingCard.initY;
      draggingCard.assignedSlot = null;
    }

    draggingCard = null;
  }
}

// ---------------------------------------------------
// 11. 結算成績與評估單元弱點
// ---------------------------------------------------
function evaluateResults() {
  gameState = 'RESULT';
  let correctNums = 0;
  let wrongUnits = new Set();

  for (let slot of targetSlots) {
    let card = slot.occupant;
    if (card && card.data.English === slot.data.English) {
      correctNums++;
    } else {
      // 記錄答錯項目的單元名稱 (Unit)
      if (slot.data.Unit) {
        wrongUnits.add(slot.data.Unit);
      }
    }
  }

  // 滿分 100 分 (抽 5 題，每題 20 分)
  finalScore = Math.round((correctNums / currentQuiz.length) * 100);
  weakUnits = Array.from(wrongUnits);
}

// ---------------------------------------------------
// 12. 響應式視窗縮放控制 (windowResized)
// ---------------------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  let cardW = min(width * 0.18, 140);
  let cardH = cardW * 0.9;
  let startY = height * 0.2;
  let gapY = (height * 0.65) / currentQuiz.length;

  for (let i = 0; i < imgCards.length; i++) {
    let card = imgCards[i];
    card.w = cardW;
    card.h = cardH;
    card.initX = width * 0.15;
    card.initY = startY + i * gapY;

    if (card.assignedSlot === null && card !== draggingCard) {
      card.x = card.initX;
      card.y = card.initY;
    }
  }

  for (let i = 0; i < targetSlots.length; i++) {
    let slot = targetSlots[i];
    slot.w = cardW * 1.5;
    slot.h = cardH;
    slot.x = width * 0.65;
    slot.y = startY + i * gapY;

    if (slot.occupant) {
      slot.occupant.x = slot.x + 10;
      slot.occupant.y = slot.y + (slot.h - slot.occupant.h) / 2;
      slot.occupant.w = cardW;
      slot.occupant.h = cardH;
    }
  }
}