
let CANVAS
let SPACING

let CLEF_IMAGE = new Image()
CLEF_IMAGE.src = "treble-clef.png"

function main() { // główna funkcja
    CANVAS = document.getElementById("myStaff")
    fitToScreen()
    window.addEventListener('resize', fitToScreen)
    //drawScene();
}

function fitToScreen() { // ustala rozmiar canvy na cały ekran
    CANVAS.width = window.innerWidth
    CANVAS.height = window.innerHeight

    SPACING = CANVAS.height/20 // odległości między liniami
    drawScene()
}

function drawScene() { // rysowanie pięciolinii
    let ctx = CANVAS.getContext("2d")

    ctx.strokeStyle = "black"
    ctx.lineWidth = 1

    for (let i=-2; i<=2; i++) {
        let y = CANVAS.height / 2 + i * SPACING

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS.width, y)
        ctx.stroke()
    }

    let location = {
        x: CANVAS.width * 0.5,
        y: CANVAS.height * 0.5
    }

    drawNote(ctx, location)

    location.x -= CANVAS.width * 0.3
    drawClef(ctx, location)
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

    ctx.drawImage(CLEF_IMAGE, location.x-newHeight/2, location.y-newHeight/2, newWidth, newHeight)
}