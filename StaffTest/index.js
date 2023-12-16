
let CANVAS
let SPACING

let MARGIN_LEFT
let MARGIN_RIGHT

let CLEF_IMAGE = new Image()
CLEF_IMAGE.src = "treble-clef.png"

let MOUSE = {
    x: 0,
    y: 0,
    isDown: false
}

let SPEED = 0.005

let NOTES = ["E6", "D6", "C6", "B5", "A5", "G5", "F5",
             "E5", "D5", "C5", "B4", "A4", "G4", "F4",
             "E4", "D4", "C4", "B3", "A3", "G3", "F3"]

let FREQ = [1318.51, 1174.66, 1046.5, 987.767, 880, 783.991, 698.456, 659.255, 587.33, 523.251, 493.883, 436.04, 392.44, 349.228, 329.628, 293.665, 261.626, 246.942, 220, 195.998, 174.614]

let MOVING_NOTES = []

let AUDIO_CONTEXT

const pianoKeys = document.querySelectorAll(".piano_keys .key"),
    volumeSlider = document.querySelector(".volume-slider input"),
    keysCheckbox = document.querySelector(".keys-checkbox input");

const showHideKeys = () => {
    // alert("showHideKeys function called!");
    pianoKeys.forEach(key => key.classList.toggle("hide"));
}

keysCheckbox.addEventListener("click", showHideKeys);

class MovingNote {
    constructor(location) {
        
        let index = Math.round(location.y/SPACING * 2)
        //alert(index- Math.round(NOTES.length/2)+1)
        this.frequency = FREQ[index - Math.round(NOTES.length/2)+1]
        this.note = NOTES[index - Math.round(NOTES.length/2)+1]
        this.location = {
            x: location.x,
            y: index*SPACING * 0.5
        }
    }

    draw(ctx) {
        drawNote(ctx, this.location)
    }

    play() {
        if (AUDIO_CONTEXT == null) {
            AUDIO_CONTEXT = new(AudioContext || webkitAudioContext || window.webkitAudioContext)()
        }

        let duration = 1
        let oscylator = AUDIO_CONTEXT.createOscillator()
        let gainNode = AUDIO_CONTEXT.createGain()

        gainNode.gain.setValueAtTime(0, AUDIO_CONTEXT.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.4, AUDIO_CONTEXT.currentTime+0.05)
        gainNode.gain.linearRampToValueAtTime(0, AUDIO_CONTEXT.currentTime+duration)

        oscylator.type = "triangle"
        oscylator.frequency.value = this.frequency
        oscylator.start(AUDIO_CONTEXT.currentTime)
        oscylator.stop(AUDIO_CONTEXT.currentTime+duration)
        oscylator.connect(gainNode)
        gainNode.connect(AUDIO_CONTEXT.destination)
    }
}

function main() { // główna funkcja
    CANVAS = document.getElementById("myStaff")
    addEventListeners()
    fitToScreen()
    animate()
}

function animate() {
    updateMovingNotes()
    drawScene()
    window.requestAnimationFrame(animate)
}

function updateMovingNotes() {
    for (let i=0; i<MOVING_NOTES.length; i++) {
        MOVING_NOTES[i].location.x -= SPEED*CANVAS.width
        if (MOVING_NOTES[i].location.x <= MARGIN_LEFT) {
            MOVING_NOTES[i].play()
            MOVING_NOTES.splice(i, 1)
            i--
        }
    }
}

function addEventListeners() {
    CANVAS.addEventListener('mousemove', onMouseMove)
    CANVAS.addEventListener('mousedown', onMouseDown)
    CANVAS.addEventListener('mouseup', onMouseUp)
    window.addEventListener('resize', fitToScreen)
}

function fitToScreen() { // ustala rozmiar canvy na cały ekran
    CANVAS.width = window.innerWidth
    CANVAS.height = window.innerHeight *0.7

    SPACING = CANVAS.height/20 // odległości między liniami

    MARGIN_RIGHT = CANVAS.width * 0.8
    MARGIN_LEFT = CANVAS.width * 0.2
    MARGIN_TOP = CANVAS.height * 0.5  // Przesunięcie w górę do 5% wysokości

    drawScene()
}

function drawScene() { // rysowanie pięciolinii
    let ctx = CANVAS.getContext("2d")

    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)

    ctx.strokeStyle = "black"
    ctx.lineWidth = 1

    for (let i=-2; i<=2; i++) {
        let y = CANVAS.height / 2 + i * SPACING

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS.width, y)
        ctx.stroke()
    }

    let index = Math.round(MOUSE.y/SPACING*2)
    
    let location = {
        x: MARGIN_RIGHT,
        y: index*SPACING * 0.5
    }

    drawNote(ctx, location)

    for (let i=0; i<MOVING_NOTES.length; i++) {
        MOVING_NOTES[i].draw(ctx)
    }

    drawClef(ctx, {x: MARGIN_LEFT, y: CANVAS.height * 0.5})
}

function drawNote(ctx, location) { // rysowanie nuty
    ctx.fillStyle="black"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1

    ctx.beginPath() // rysowanie linii pionowej
    ctx.moveTo(location.x+SPACING * 0.5, location.y)
    ctx.lineTo(location.x+SPACING * 0.5, location.y - SPACING * 0.5 * 5)
    ctx.stroke()

    ctx.beginPath() // rysowanie horągiewki
    ctx.moveTo(location.x+SPACING * 0.5, location.y - SPACING * 0.5 * 5)
    ctx.bezierCurveTo(location.x + SPACING * 0.5 * 2, location.y-SPACING * 0.5 * 3,
            location.x + SPACING * 0.5 * 2.5, location.y-SPACING * 0.5 * 3,
            location.x + SPACING * 0.5 * 2.5, location.y-SPACING * 0.5 * 1)
    ctx.bezierCurveTo(location.x + SPACING * 0.5 * 2.5, location.y-SPACING * 0.5 * 2.7,
            location.x + SPACING * 0.5 * 2, location.y-SPACING * 0.5 * 2.7,
            location.x + SPACING * 0.5, location.y-SPACING * 0.5 * 4.5)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath() // rysowanie kółka
    ctx.save() // zapis ustawień canvy
    ctx.translate(location.x, location.y)
    ctx.rotate(-0.2)
    ctx.scale(1.05, 0.8)
    ctx.arc(0, 0, SPACING * 0.5, 0, Math.PI*2)
    ctx.fill()
    ctx.stroke()
    ctx.restore() // trzeba przywrócić ustawienia, żeby reszta rzeczy nie była przekręcona
}

function drawClef(ctx, location) { // rysowanie klucza wiolinowego
    let aspectRatio=CLEF_IMAGE.width/CLEF_IMAGE.height
    let newHeight = CANVAS.height * 0.45
    let newWidth = aspectRatio * newHeight

    ctx.drawImage(CLEF_IMAGE, location.x-newWidth/2, location.y-newHeight/2, newWidth, newHeight)
}

function onMouseMove(event) {
    MOUSE.x = event.x
    MOUSE.y = event.y
}

function onMouseDown(event) {
    MOUSE.isDown = true
    MOVING_NOTES.push(new MovingNote({x: MARGIN_RIGHT, y: MOUSE.y}))
}

function onMouseUp(event) {
    MOUSE.isDown = false
}



let allKeys = [],
audio = new Audio(`tune/key01.wav`); // by default, audio src is "a" tune

const playTune = (key) => {
    audio.src = `tune/${key}.wav`; // passing audio src based on key pressed 
    audio.play(); // playing audio

    const clickedKey = document.querySelector(`[data-key="${key}"]`); // getting clicked key element
    clickedKey.classList.add("active"); // adding active class to the clicked key element
    setTimeout(() => { // removing active class after 150 ms from the clicked key element
        clickedKey.classList.remove("active");
    }, 150);
}

const playTune2 = (freq) => {
    if (AUDIO_CONTEXT == null) {
        AUDIO_CONTEXT = new(AudioContext || webkitAudioContext || window.webkitAudioContext)()
    }

    let duration = 1
    let oscylator = AUDIO_CONTEXT.createOscillator()
    let gainNode = AUDIO_CONTEXT.createGain()

    gainNode.gain.setValueAtTime(0, AUDIO_CONTEXT.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.4, AUDIO_CONTEXT.currentTime+0.05)
    gainNode.gain.linearRampToValueAtTime(0, AUDIO_CONTEXT.currentTime+duration)

    oscylator.type = "triangle"
    oscylator.frequency.value = freq
    oscylator.start(AUDIO_CONTEXT.currentTime)
    oscylator.stop(AUDIO_CONTEXT.currentTime+duration)
    oscylator.connect(gainNode)
    gainNode.connect(AUDIO_CONTEXT.destination)
}

pianoKeys.forEach(key => {
    console.log(key)
    allKeys.push(key.dataset.key); // adding data-key value to the allKeys array
    // calling playTune function with passing data-key value as an argument
    key.addEventListener("click", () => playTune2(FREQ[keyMap[key.dataset.key]]));
});

const handleVolume = (e) => {
    audio.volume = e.target.value; // passing the range slider value as an audio volume
}

// Mapa łącząca kody klawiszy z odpowiadającymi wartościami data-key
const keyMap = {
    'q': 16,
    '1': '',
    'w': 15,
    '2': '',
    'e': 14,
    'r': 13,
    '3': '',
    't': 12,
    '4': '',
    'y': 11,
    '5': '',
    'u': 10,
    'i': 9,
    '6': '',
    'o': 8,
    '7': '',
    'p': 7,
    'z': 6,
    '8': '',
    'x': 5,
    '9': '',
    'c': 4,
    '0': '',
    'v': 3
};

const pressedKey = (e) => {
    // czy klawisz istnieje w mapie
    if (keyMap.hasOwnProperty(e.key)) {
        // uzyskaj odpowiadającą mu wartość data-key
        const dataKey = keyMap[e.key];
        // playTune z uzyskana wartością data-key
        playTune2(FREQ[dataKey]);
    }
}


volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);