let CANVAS;
let SPACING;

let MODE = 1; // przełącza tryb piana i tryb drag and drop 0 - piano default 1 -drag and drop
let COMPOSE_MODE = 0; // tryb swobodny - 0, tryb układania melodii - 1
let NOTE_MODE = 4; // tryb nut - 4 - osemka, 3 - cwiartka, 2 - pol, 1 - cala

let REC_MODE = 0; //nagrywanie - 1, odtwarzanie - 2;

let MARGIN_LEFT;
let MARGIN_RIGHT;

let CLEF_IMAGE = new Image();
CLEF_IMAGE.src = "treble-clef.png";

let MOUSE = {
  x: 0,
  y: 0,
  isDown: false,
};

let SPEED = 0.002; //0.005; //0.0015

let NOTES = [
  "E6",
  "D6",
  "C6",
  "B5",
  "A5",
  "G5",
  "F5",
  "E5",
  "D5",
  "C5",
  "B4",
  "A4",
  "G4",
  "F4",
  "E4",
  "D4",
  "C4",
  "B3",
  "A3",
  "G3",
  "F3",
];

let FREQ = [
  1318.51, 1174.66, 1046.5, 987.767, 880, 783.991, 698.456, 659.255, 587.33,
  523.251, 493.883, 436.04, 392.44, 349.228, 329.628, 293.665, 261.626, 246.942,
  220, 195.998, 174.614,
];

let MOVING_NOTES = [];
let RECORDING = [];

let AUDIO_CONTEXT;

let sum = 0;

const pianoKeys = document.querySelectorAll(".piano_keys .key"),
  speedSlider = document.querySelector(".speed-slider input"),
  keysCheckbox = document.querySelector(".keys-checkbox input");

const showHideKeys = () => {
  // alert("showHideKeys function called!");
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
};

keysCheckbox.addEventListener("click", showHideKeys);

class MovingNote {
  add1(location, value) {
    // stary konstruktor

    let index = Math.round((location.y / SPACING) * 2);
    this.frequency = FREQ[index - Math.round(NOTES.length / 2) + 1];
    this.note = NOTES[index - Math.round(NOTES.length / 2) + 1];
    this.location = {
      x: location.x,
      y: index * SPACING * 0.5,
    };
    this.value = value;
  }

  add2(index, value, x = MARGIN_RIGHT) {
    index = index + Math.round(NOTES.length / 2) - 1;
    this.frequency = FREQ[index - Math.round(NOTES.length / 2) + 1];
    this.note = NOTES[index - Math.round(NOTES.length / 2) + 1];
    this.location = {
      x: x,
      y: index * SPACING * 0.5,
    };
    this.value = value;
  }

  draw(ctx) {
    NOTE_MODE = this.value;
    drawNote(ctx, this.location);
  }

  play() {
    if (AUDIO_CONTEXT == null) {
      AUDIO_CONTEXT = new (AudioContext ||
        webkitAudioContext ||
        window.webkitAudioContext)();
    }

    let duration = 1;
    let oscylator = AUDIO_CONTEXT.createOscillator();
    let gainNode = AUDIO_CONTEXT.createGain();

    gainNode.gain.setValueAtTime(0, AUDIO_CONTEXT.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.4,
      AUDIO_CONTEXT.currentTime + 0.05
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      AUDIO_CONTEXT.currentTime + duration
    );

    oscylator.type = "triangle";
    oscylator.frequency.value = this.frequency;
    oscylator.start(AUDIO_CONTEXT.currentTime);
    oscylator.stop(AUDIO_CONTEXT.currentTime + duration);
    oscylator.connect(gainNode);
    gainNode.connect(AUDIO_CONTEXT.destination);
  }
}

function main() {
  // główna funkcja
  CANVAS = document.getElementById("myStaff");
  addEventListeners();
  fitToScreen();
  animate();
}

function animate() {
  updateMovingNotes();
  drawScene("black");
  window.requestAnimationFrame(animate);
}

function updateMovingNotes() {
  for (let i = 0; i < MOVING_NOTES.length; i++) {
    MOVING_NOTES[i].location.x -= SPEED * CANVAS.width;
    if (MOVING_NOTES[i].location.x <= MARGIN_LEFT) {
      MOVING_NOTES[i].play();
      MOVING_NOTES.splice(i, 1);
      i--;
    }
  }
}

function addEventListeners() {
  CANVAS.addEventListener("mousemove", onMouseMove);
  CANVAS.addEventListener("mousedown", onMouseDown);
  CANVAS.addEventListener("mouseup", onMouseUp);
  window.addEventListener("resize", fitToScreen);
}

function fitToScreen() {
  // ustala rozmiar canvy na cały ekran
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight * 0.7;

  SPACING = CANVAS.height / 20; // odległości między liniami

  MARGIN_RIGHT = CANVAS.width * 0.8;
  MARGIN_LEFT = CANVAS.width * 0.2;
  MARGIN_TOP = CANVAS.height * 0.5; // Przesunięcie w górę do 5% wysokości

  drawScene();
}

function drawScene() {
  // rysowanie pięciolinii
  let ctx = CANVAS.getContext("2d");

  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  for (let i = -2; i <= 2; i++) {
    let y = CANVAS.height / 2 + i * SPACING;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS.width, y);
    ctx.stroke();
  }

  let index = Math.round((MOUSE.y / SPACING) * 2);

  let location = {
    x: MARGIN_RIGHT,
    y: index * SPACING * 0.5,
  };

  if (MODE == 1 || MODE == 3) drawNote(ctx, location);

  for (let i = 0; i < MOVING_NOTES.length; i++) {
    MOVING_NOTES[i].draw(ctx);
  }

  drawClef(ctx, { x: MARGIN_LEFT, y: CANVAS.height * 0.5 });
}

function drawNote(ctx, location) {
  // rysowanie nuty

  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  if (NOTE_MODE > 1) {
    ctx.beginPath(); // rysowanie linii pionowej
    ctx.moveTo(location.x + SPACING * 0.5, location.y);
    ctx.lineTo(location.x + SPACING * 0.5, location.y - SPACING * 0.5 * 5);
    ctx.stroke();
  }

  if (NOTE_MODE > 3) {
    ctx.beginPath(); // rysowanie horągiewki
    ctx.moveTo(location.x + SPACING * 0.5, location.y - SPACING * 0.5 * 5);
    ctx.bezierCurveTo(
      location.x + SPACING * 0.5 * 2,
      location.y - SPACING * 0.5 * 3,
      location.x + SPACING * 0.5 * 2.5,
      location.y - SPACING * 0.5 * 3,
      location.x + SPACING * 0.5 * 2.5,
      location.y - SPACING * 0.5 * 1
    );
    ctx.bezierCurveTo(
      location.x + SPACING * 0.5 * 2.5,
      location.y - SPACING * 0.5 * 2.7,
      location.x + SPACING * 0.5 * 2,
      location.y - SPACING * 0.5 * 2.7,
      location.x + SPACING * 0.5,
      location.y - SPACING * 0.5 * 4.5
    );
    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath(); // rysowanie kółka
  ctx.save(); // zapis ustawień canvy
  ctx.translate(location.x, location.y);
  ctx.rotate(-0.2);
  ctx.scale(1.05, 0.8);
  ctx.arc(0, 0, SPACING * 0.5, 0, Math.PI * 2);
  if (NOTE_MODE > 2) ctx.fill();
  ctx.stroke();
  ctx.restore(); // trzeba przywrócić ustawienia, żeby reszta rzeczy nie była przekręcona
}

function drawClef(ctx, location) {
  // rysowanie klucza wiolinowego
  let aspectRatio = CLEF_IMAGE.width / CLEF_IMAGE.height;
  let newHeight = CANVAS.height * 0.45;
  let newWidth = aspectRatio * newHeight;

  ctx.drawImage(
    CLEF_IMAGE,
    location.x - newWidth / 2,
    location.y - newHeight / 2,
    newWidth,
    newHeight
  );
}

function onMouseMove(event) {
  if (MODE == 1 || MODE == 3) MOUSE.x = event.x;
  if (MODE == 1 || MODE == 3) MOUSE.y = event.y;
}

function onMouseDown(event) {
  if ((MODE == 1 || MODE == 3) && REC_MODE !== 2) MOUSE.isDown = true;

  if ((MODE == 1 || MODE == 3) && REC_MODE !== 2)
    var movingNote = new MovingNote();
  if ((MODE == 1 || MODE == 3) && REC_MODE !== 2) {
    movingNote.add1({ x: MARGIN_RIGHT, y: MOUSE.y }, NOTE_MODE);
    if (REC_MODE) {
      sum = recordSong(movingNote, sum);
      console.log(RECORDING);
    }
  }

  if ((MODE == 1 || MODE == 3) && REC_MODE !== 2) MOVING_NOTES.push(movingNote);
}

function onMouseUp(event) {
  if ((MODE == 1 || MODE == 3) && REC_MODE !== 2) MOUSE.isDown = false;
}

function addAutoNote(note, value, offset) {
  let index = NOTES.indexOf(note);

  var movingNote = new MovingNote();
  movingNote.add2(index, value, CANVAS.width + offset);

  MOVING_NOTES.push(movingNote);
}

function recordSong(movingNote, sum) {
  if (NOTE_MODE === 1) RECORDING.push([movingNote, (sum += 70)]);
  else if (NOTE_MODE === 2) RECORDING.push([movingNote, (sum += 45)]);
  else if (NOTE_MODE === 3) RECORDING.push([movingNote, (sum += 25)]);
  else if (NOTE_MODE === 4) RECORDING.push([movingNote, (sum += 10)]);
  return sum;
}

let allKeys = [];

const playTune2 = (index) => {
  if ((MODE == 0 || MODE == 3) && REC_MODE != 2) {
    var movingNote = new MovingNote();
    movingNote.add2(index, NOTE_MODE);
    if (REC_MODE) {
      sum = recordSong(movingNote, sum);
      console.log(RECORDING);
    }
    MOVING_NOTES.push(movingNote);
  }
};

pianoKeys.forEach((key) => {
  if (key.dataset.key != "black") {
    allKeys.push(key.dataset.key); // adding data-key value to the allKeys array
    // calling playTune function with passing data-key value as an argument
    key.addEventListener("click", () => playTune2(keyMap[key.dataset.key]));
  }
});

const handleSpeed = (e) => {
  SPEED = e.target.value; // passing the range slider value as an audio speed
};

// Mapa łącząca kody klawiszy z odpowiadającymi wartościami data-key
const keyMap = {
  q: 16,
  black: "",
  w: 15, 
  black: "",
  e: 14,
  r: 13,
  black: "",
  t: 12,
  black: "",
  y: 11,
  black: "",
  u: 10,
  i: 9,
  black: "",
  o: 8,
  black: "",
  p: 7,
  z: 6,
  black: "",
  x: 5,
  black: "",
  c: 4,
  black: "",
  v: 3,
};

const pressedKey = (e) => {
  // czy klawisz istnieje w mapie
  if (keyMap.hasOwnProperty(e.key) & (e.key != "black")) {
    // uzyskaj odpowiadającą mu wartość data-key
    const dataKey = keyMap[e.key];
    // playTune z uzyskana wartością data-key
    playTune2(dataKey);
  }
};

speedSlider.addEventListener("input", handleSpeed);
document.addEventListener("keydown", pressedKey);

var piano_mode_btn = document.querySelector(".piano-mode");
var drag_mode_btn = document.querySelector(".drag-mode");
var dual_mode_btn = document.querySelector(".dual-mode");

piano_mode_btn.addEventListener("click", () => {
  alert("piano mode");
  MODE = 0;
});

drag_mode_btn.addEventListener("click", () => {
  alert("drag and play mode");
  MODE = 1;
});

dual_mode_btn.addEventListener("click", () => {
  alert("dual mode");
  MODE = 3;
});

var whole_note_btn = document.querySelector(".whole-note");
var half_note_btn = document.querySelector(".half-note");
var quarter_note_btn = document.querySelector(".quarter-note");
var eight_note_btn = document.querySelector(".eight-note");

whole_note_btn.addEventListener("click", () => {
  NOTE_MODE = 1;
  alert("cala");
});

half_note_btn.addEventListener("click", () => {
  NOTE_MODE = 2;
  alert("pol");
});

quarter_note_btn.addEventListener("click", () => {
  NOTE_MODE = 3;
  alert("cwi");
});

eight_note_btn.addEventListener("click", () => {
  NOTE_MODE = 4;
  alert("8");
});

var Cchord_btn = document.querySelector(".Cchord");
var Dmchord_btn = document.querySelector(".Dmchord");
var Emchord_btn = document.querySelector(".Emchord");
var Fchord_btn = document.querySelector(".Fchord");
var Gchord_btn = document.querySelector(".Gchord");
var Amchord_btn = document.querySelector(".Amchord");
var Hdimchord_btn = document.querySelector(".Hdimchord");

Cchord_btn.addEventListener("click", () => {
  addAutoNote("C4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("E4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("G4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

Dmchord_btn.addEventListener("click", () => {
  addAutoNote("D4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("F4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("A4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

Emchord_btn.addEventListener("click", () => {
  addAutoNote("E4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("G4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("B4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

Fchord_btn.addEventListener("click", () => {
  addAutoNote("F4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("A4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("C4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

Gchord_btn.addEventListener("click", () => {
  addAutoNote("G4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("B4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("D4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

Amchord_btn.addEventListener("click", () => {
  addAutoNote("A4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("C4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("E4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

Hdimchord_btn.addEventListener("click", () => {
  addAutoNote("B4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("D4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
  addAutoNote("F4", NOTE_MODE, 0 * CANVAS.width * SPEED * 4);
});

var freeplay_btn = document.querySelector(".freeplay-mode");
var compose_btn = document.querySelector(".compose-mode");

freeplay_btn.addEventListener("click", () => {
  COMPOSE_MODE = 0;
  REC_MODE = 0;
  alert("free");

  record_btn.style.display = "None";
  play_btn.style.display = "None";
  save_btn.style.display = "None";
  file_input.style.display = "None";
});

compose_btn.addEventListener("click", () => {
  COMPOSE_MODE = 1;
  REC_MODE = 0;
  alert("comp");

  record_btn.style.display = "inline-block";
  play_btn.style.display = "inline-block";
  save_btn.style.display = "inline-block";
  file_input.style.display = "inline-block";
});

var record_btn = document.querySelector(".record-mode");
var play_btn = document.querySelector(".play-mode");
var save_btn = document.querySelector(".save-btn");
var file_input = document.querySelector(".file-input");

record_btn.style.display = "None";
play_btn.style.display = "None";
save_btn.style.display = "None";
file_input.style.display = "None";

record_btn.addEventListener("click", () => {
  sum = 0;
  if (MOVING_NOTES.length != 0) {
    alert("Poczekaj aż piosenka przestanie grać!");
  } else {
    REC_MODE = 1;
    alert("rec");
    while (RECORDING.length > 0) {
      RECORDING.pop();
    }
  }
});

play_btn.addEventListener("click", () => {
  REC_MODE = 2;
  if (MOVING_NOTES.length != 0) {
    alert("Poczekaj aż piosenka przestanie grać!");
  } else {
    for (i = 0; i < RECORDING.length; i++) {
      console.log(RECORDING, i);
      if (i === 0) {
        console.log(RECORDING[i][1]);
        addAutoNote(
          RECORDING[i][0].note,
          RECORDING[i][0].value,
          RECORDING[i][1]
        );
      } else {
        console.log(`${i} nutka`);
        addAutoNote(
          RECORDING[i][0].note,
          RECORDING[i][0].value,
          RECORDING[i - 1][1] * CANVAS.width * SPEED * 4
        );
      }
    }
  }
});

save_btn.addEventListener("click", () => {
  var jsonString = JSON.stringify(RECORDING, null, 2);
  var blob = new Blob([jsonString], { type: "application/json" });
  var link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = "saved_songs.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

file_input.addEventListener("change", () => {
  var fileInput = event.target;
  var file = fileInput.files[0];

  if (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      try {
        var jsonData = JSON.parse(e.target.result);

        RECORDING = jsonData;
        console.log(RECORDING);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  }
});

var play_hallelujah = document.querySelector(".play-hallelujah");
var play_houseofthe = document.querySelector(".play-houseofthe");
var play_timeaftertime = document.querySelector(".play-timeaftertime");

play_hallelujah.addEventListener("click", () => {
  sum = 0;
  addAutoNote("E4", 4, sum * CANVAS.width * SPEED * 4);
  addAutoNote("G4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("E4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("G4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("A4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("F4", 4, (sum += 30 * CANVAS.width * SPEED * 4));

  addAutoNote("G4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G4", 3, (sum += 30 * CANVAS.width * SPEED * 4));
});

play_houseofthe.addEventListener("click", () => {
  sum = 0;
  addAutoNote("G4", 3, sum * CANVAS.width * SPEED * 4);
  addAutoNote("G4", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("B4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("C5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E5", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("D5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 1, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("A5", 4, (sum += 70 * CANVAS.width * SPEED * 4));
  addAutoNote("A5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A5", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("G5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E5", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E5", 1, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("G5", 3, (sum += 70 * CANVAS.width * SPEED * 4));
  addAutoNote("G5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("B4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("C5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E5", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("D5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A4", 1, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("A5", 4, (sum += 70 * CANVAS.width * SPEED * 4));
  addAutoNote("A5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("A5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("A5", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("G5", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("G5", 3, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E5", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E5", 1, (sum += 10 * CANVAS.width * SPEED * 4));
});

play_timeaftertime.addEventListener("click", () => {
  sum = 0;

  addAutoNote("F4", 2, sum * CANVAS.width * SPEED * 4);
  addAutoNote("A4", 2, sum * CANVAS.width * SPEED * 4);
  addAutoNote("C4", 2, sum * CANVAS.width * SPEED * 4);

  addAutoNote("G4", 2, sum + 50 * CANVAS.width * SPEED * 4);
  addAutoNote("B4", 2, sum + 50 * CANVAS.width * SPEED * 4);
  addAutoNote("D4", 2, sum + 50 * CANVAS.width * SPEED * 4);

  addAutoNote("E4", 2, sum + 100 * CANVAS.width * SPEED * 4);
  addAutoNote("G4", 2, sum + 100 * CANVAS.width * SPEED * 4);
  addAutoNote("B4", 2, sum + 100 * CANVAS.width * SPEED * 4);

  addAutoNote("F4", 2, sum + 150 * CANVAS.width * SPEED * 4);
  addAutoNote("A4", 2, sum + 150 * CANVAS.width * SPEED * 4);
  addAutoNote("C4", 2, sum + 150 * CANVAS.width * SPEED * 4);

  sum += 2250;

  addAutoNote("D4", 3, (sum += 50 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 4, (sum += 30 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 60 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("D4", 4, (sum += 30 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 4, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("C4", 3, (sum += 10 * CANVAS.width * SPEED * 4));

  addAutoNote("D4", 3, (sum += 35 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 3, (sum += 10 * CANVAS.width * SPEED * 4));
  addAutoNote("E4", 4, (sum += 30 * CANVAS.width * SPEED * 4));
});
