
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

let NOTES = ["E6", "D6", "C6", "B5", "A5", "G5", "F5",
            "E5", "D5", "C5", "B4", "A4", "G4", "F4",
            "E4", "D4", "C4", "B3", "A3", "G3", "F3"]

function main() { // główna funkcja
    CANVAS = document.getElementById("myStaff")
    addEventListeners()
    fitToScreen()
    animate()
}

function animate() {
    drawScene()
    window.requestAnimationFrame(animate)
}

function addEventListeners() {
    CANVAS.addEventListener('mousemove', onMouseMove)
    CANVAS.addEventListener('mousedown', onMouseDown)
    CANVAS.addEventListener('mouseup', onMouseUp)
    window.addEventListener('resize', fitToScreen)
}

function fitToScreen() { // ustala rozmiar canvy na cały ekran
    CANVAS.width = window.innerWidth
    CANVAS.height = window.innerHeight

    SPACING = CANVAS.height/20 // odległości między liniami

    MARGIN_RIGHT = CANVAS.width * 0.8
    MARGIN_LEFT = CANVAS.width * 0.2

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
}

function onMouseUp(event) {
    MOUSE.isDown = false
}