const audio = {
    map: new Howl({
        src: './audio/map.wav',
        html5: true,
        volume: 0.2
    }),
    initBattle: new Howl({
        src: './audio/initBattle.wav',
        html5: true,
        volume: 0.02
    }),
    battle: new Howl({
        src: './audio/battle.mp3',
        html5: true,
        volume: 0.1
    }),
    tackleHit: new Howl({
        src: './audio/tackleHit.wav',
        html5: true,
        volume: 0.1
    }),
    fireballHit: new Howl({
        src: './audio/fireballHit.wav',
        html5: true,
        volume: 0.05
    }),
    initFireball: new Howl({
        src: './audio/initFireball.wav',
        html5: true,
        volume: 0.05
    }),
    victory: new Howl({
        src: './audio/victory.wav',
        html5: true,
        volume: 0.2
    })
}