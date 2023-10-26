var context = new AudioContext()
var o = context.createOscillator()
var  g = context.createGain()

function play() {
    context = new AudioContext()
    o = context.createOscillator()
    g = context.createGain()
    o.connect(g)
    g.connect(context.destination)
    o.start(0)
}

function stop() {
    g.gain.exponentialRampToValueAtTime(
        0.00001, context.currentTime + 0.5 // im większa liczba na końcu tym wolniej się zatrzyma
    )
}

function play2() {
    context = new AudioContext()
    o = context.createOscillator()
    g = context.createGain()
    o.connect(g)
    g.connect(context.destination)
    o.start(0)

    g.gain.exponentialRampToValueAtTime(
        0.00001, context.currentTime + 1 // im większa liczba na końcu tym wolniej się zatrzyma
    )
    
}

function play3(frequency) {
    context = new AudioContext()
    o = context.createOscillator()
    g = context.createGain()
    o.frequency.value = frequency
    o.connect(g)
    g.connect(context.destination)
    o.start(0)

    g.gain.exponentialRampToValueAtTime(
        0.00001, context.currentTime + 2 // im większa liczba na końcu tym wolniej się zatrzyma
    )
    
}