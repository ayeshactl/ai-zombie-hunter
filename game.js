// ============================================
// AI ZOMBIE SHOOTER
// HAND-GESTURE CONTROLLED
// ============================================

const video = document.getElementById("webcam");
const cameraStatus = document.getElementById("cameraStatus");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");

// ============================================
// 2D HORROR BACKGROUND
// ============================================

const backgroundImage = new Image();

backgroundImage.src =
    "assets/background/cemetery-bg.png";
// ============================================
// GAME STATE
// ============================================

let score = 0;

let handDetected = false;
let pistolReady = false;

let previousFingerY = null;

let shootingCooldown = 0;

const SHOOT_THRESHOLD = 0.008;
const SHOOT_COOLDOWN = 300;


// ============================================
// GAME OBJECTS
// ============================================

const zombies = [];
// ============================================
const particles = [];


// ============================================
// AIM
// ============================================

const aim = {

    x: 0,
    y: 0,

    previousX: 0,
    previousY: 0

};


// ============================================
// CANVAS
// ============================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

    aim.x =
        canvas.width / 2;

    aim.y =
        canvas.height / 2;

    aim.previousX =
        aim.x;

    aim.previousY =
        aim.y;
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================
// DISTANCE
// ============================================

function distance(a, b) {

    const dx =
        a.x - b.x;

    const dy =
        a.y - b.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ============================================
// PISTOL GESTURE

function isGunGesture(landmarks) {

    const indexTip = landmarks[8];
    const indexPip = landmarks[6];

    const middleTip = landmarks[12];
    const middlePip = landmarks[10];

    // ONLY index + middle fingers are required.
    // Thumb, ring and pinky are intentionally ignored.

    const indexExtended =
        indexTip.y < indexPip.y;

    const middleExtended =
        middleTip.y < middlePip.y;

    return (
        indexExtended &&
        middleExtended
    );
}

// ============================================
// UPDATE AIM
// ============================================

function updateAim(
    x,
    y
) {

    aim.previousX =
        aim.x;

    aim.previousY =
        aim.y;

    aim.x = x;
    aim.y = y;
}


// ============================================
// CREATE ZOMBIE
// ============================================
// ============================================
// CREATE ZOMBIE
// ============================================
function createZombie() {

    // Randomly choose where zombie enters
    const side = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (side === 0) {
        // TOP
        x = Math.random() * canvas.width;
        y = -120;

    } else if (side === 1) {
        // RIGHT
        x = canvas.width + 120;
        y = Math.random() * canvas.height;

    } else if (side === 2) {
        // BOTTOM
        x = Math.random() * canvas.width;
        y = canvas.height + 120;

    } else {
        // LEFT
        x = -120;
        y = Math.random() * canvas.height;
    }


    const zombie = {

        x: x,
        y: y,

        radius: 42,

        // Movement
        speed:
            0.8 + Math.random() * 0.8,

        velocityX: 0,
        velocityY: 0,

        alive: true,

        rotation:
            (Math.random() - 0.5) * 0.15,

        animationTime:
            Math.random() * Math.PI * 2,

        wobbleSpeed:
            0.06 + Math.random() * 0.04

    };


    zombies.push(zombie);

    console.log(
        "🧟 SPAWN:",
        side,
        zombie.x,
        zombie.y
    );
}
// UPDATE ZOMBIES
// ============================================

function updateZombies() {

    for (
        let i = zombies.length - 1;
        i >= 0;
        i--
    ) {

        const zombie =
            zombies[i];
        if (zombie.dying) {

            const elapsed =
                Date.now() -
                zombie.deathTime;

            zombie.velocityY += 0.35;
            zombie.velocityX *= 0.96;
            zombie.rotation += 0.08;

            if (elapsed > 700) {
                zombies.splice(i, 1);
            }

            continue;
        }


        // ============================================
        // MOVE ZOMBIE TOWARDS CENTER
        // ============================================

        const targetX = canvas.width / 2;
        const targetY = canvas.height / 2;

        const dx = targetX - zombie.x;
        const dy = targetY - zombie.y;

        const distanceToTarget =
            Math.sqrt(dx * dx + dy * dy);

        if (distanceToTarget > 80) {

            zombie.velocityX =
                (dx / distanceToTarget) *
                zombie.speed;

            zombie.velocityY =
                (dy / distanceToTarget) *
                zombie.speed;

            zombie.x += zombie.velocityX;
            zombie.y += zombie.velocityY;
        }

        zombie.velocityY +=
            zombie.gravity;


        zombie.rotation +=
            0.01;

        zombie.animationTime +=
            zombie.wobbleSpeed;

        if (
            !zombie.alive
        ) {

            zombies.splice(
                i,
                1
            );

            continue;
        }


        /////

    }
}
// ============================================
// 2D HORROR WORLD
// ============================================

function drawHorrorWorld() {

    // SKY
    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    sky.addColorStop(
        0,
        "#080612"
    );

    sky.addColorStop(
        0.55,
        "#17101c"
    );

    sky.addColorStop(
        1,
        "#291713"
    );



    // -------------------------
    // MOON
    // -------------------------

    ctx.fillStyle =
        "#d8cfa8";

    ctx.beginPath();

    ctx.arc(
        canvas.width - 140,
        120,
        55,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -------------------------
    // MOON SHADOW
    // -------------------------

    ctx.fillStyle =
        "#080612";

    ctx.beginPath();

    ctx.arc(
        canvas.width - 115,
        105,
        55,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // -------------------------
    // GROUND
    // -------------------------

    ctx.fillStyle =
        "#11130f";

    ctx.fillRect(
        0,
        canvas.height - 180,
        canvas.width,
        180
    );


    // -------------------------
    // GROUND TOP
    // -------------------------

    ctx.fillStyle =
        "#25251a";

    ctx.fillRect(
        0,
        canvas.height - 180,
        canvas.width,
        12
    );


    // -------------------------
    // GRASS
    // -------------------------

    ctx.strokeStyle =
        "#3b4025";

    ctx.lineWidth =
        3;

    for (
        let x = 0;
        x < canvas.width;
        x += 25
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            canvas.height - 170
        );

        ctx.lineTo(
            x + 5,
            canvas.height - 185
        );

        ctx.stroke();
    }
}
// ============================================
// DRAW HORROR WORLD
// ============================================

function drawHorrorWorld() {

    if (backgroundImage.complete) {

        ctx.drawImage(
            backgroundImage,
            0,
            0,
            canvas.width,
            canvas.height
        );

    } else {

        ctx.fillStyle =
            "#08090d";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }
}
// ============================================
// HORROR ZOMBIE
// ============================================

function drawZombies() {

    zombies.forEach((zombie) => {

        ctx.save();

        const walk =
            Math.sin(zombie.animationTime) * 8;

        const bounce =
            Math.abs(Math.sin(zombie.animationTime)) * 5;

        const wobble =
            Math.sin(zombie.animationTime) * 0.08;
        ctx.translate(
            zombie.x,
            zombie.y + bounce
        );

        ctx.rotate(
            zombie.rotation + wobble
        );



        // -------------------------
        // SHADOW
        // -------------------------

        ctx.fillStyle =
            "rgba(0,0,0,0.55)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            55,
            48,
            13,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // -------------------------
        // BODY
        // -------------------------

        const bodyGradient =
            ctx.createLinearGradient(
                -35,
                0,
                35,
                70
            );

        bodyGradient.addColorStop(
            0,
            "#182018"
        );

        bodyGradient.addColorStop(
            1,
            "#050805"
        );

        ctx.fillStyle =
            bodyGradient;

        ctx.beginPath();

        ctx.roundRect(
            -34,
            -5,
            68,
            75,
            14
        );

        ctx.fill();


        // -------------------------
        // BLOOD ON BODY
        // -------------------------

        ctx.fillStyle =
            "#6b0000";

        ctx.beginPath();

        ctx.arc(
            -18,
            20,
            7,
            0,
            Math.PI * 2
        );

        ctx.arc(
            18,
            42,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // -------------------------
        // HEAD
        // -------------------------

        const headGradient =
            ctx.createRadialGradient(
                -10,
                -50,
                5,
                0,
                -40,
                45
            );

        headGradient.addColorStop(
            0,
            "#59695b"
        );

        headGradient.addColorStop(
            0.7,
            "#29352b"
        );

        headGradient.addColorStop(
            1,
            "#0b100c"
        );

        ctx.fillStyle =
            headGradient;

        ctx.beginPath();

        ctx.arc(
            0,
            -40,
            zombie.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // -------------------------
        // EAR
        // -------------------------

        ctx.fillStyle =
            "#29352b";

        ctx.beginPath();

        ctx.arc(
            -41,
            -40,
            10,
            0,
            Math.PI * 2
        );

        ctx.arc(
            41,
            -40,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // -------------------------
        // EYE SOCKETS
        // -------------------------

        ctx.fillStyle =
            "#090909";

        ctx.beginPath();

        ctx.ellipse(
            -14,
            -45,
            12,
            10,
            -0.2,
            0,
            Math.PI * 2
        );

        ctx.ellipse(
            14,
            -45,
            12,
            10,
            0.2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // -------------------------
        // GLOWING RED EYES
        // -------------------------

        ctx.shadowColor =
            "#ff0000";

        ctx.shadowBlur =
            18;

        ctx.fillStyle =
            "#ff1010";

        ctx.beginPath();

        ctx.arc(
            -14,
            -45,
            5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            14,
            -45,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;


        // -------------------------
        // NOSE
        // -------------------------

        ctx.fillStyle =
            "#101510";

        ctx.beginPath();

        ctx.moveTo(
            0,
            -39
        );

        ctx.lineTo(
            -6,
            -27
        );

        ctx.lineTo(
            6,
            -27
        );

        ctx.closePath();

        ctx.fill();


        // -------------------------
        // HORROR MOUTH
        // -------------------------

        ctx.fillStyle =
            "#090909";

        ctx.beginPath();

        ctx.roundRect(
            -22,
            -23,
            44,
            22,
            7
        );

        ctx.fill();


        // -------------------------
        // BLOODY MOUTH
        // -------------------------

        ctx.fillStyle =
            "#8b0000";

        ctx.beginPath();

        ctx.ellipse(
            0,
            -14,
            17,
            6,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // -------------------------
        // TEETH
        // -------------------------

        ctx.fillStyle =
            "#d6d0b5";

        for (
            let tooth = -13;
            tooth <= 13;
            tooth += 9
        ) {

            ctx.beginPath();

            ctx.moveTo(
                tooth,
                -19
            );

            ctx.lineTo(
                tooth + 4,
                -19
            );

            ctx.lineTo(
                tooth + 2,
                -10
            );

            ctx.closePath();

            ctx.fill();

        }


        // -------------------------
        // FACE SCARS
        // -------------------------

        ctx.strokeStyle =
            "#151d16";

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.moveTo(
            -27,
            -60
        );

        ctx.lineTo(
            -10,
            -54
        );

        ctx.moveTo(
            24,
            -60
        );

        ctx.lineTo(
            13,
            -52
        );

        ctx.stroke();


        // -------------------------
        // ARMS
        // -------------------------
        // -------------------------
        // ANIMATED ARMS
        // -------------------------

        const armSwing =
            Math.sin(zombie.animationTime) * 18;

        ctx.strokeStyle =
            "#344034";

        ctx.lineWidth =
            14;

        ctx.lineCap =
            "round";

        ctx.beginPath();


        // LEFT ARM

        ctx.moveTo(
            -25,
            10
        );

        ctx.lineTo(
            -58,
            32 + armSwing
        );

        ctx.lineTo(
            -72,
            15 + armSwing
        );


        // RIGHT ARM

        ctx.moveTo(
            25,
            10
        );

        ctx.lineTo(
            58,
            32 - armSwing
        );

        ctx.lineTo(
            72,
            15 - armSwing
        );

        ctx.stroke();
        // -------------------------
        // BLOODY HANDS
        // -------------------------

        ctx.fillStyle =
            "#620000";

        ctx.beginPath();

        ctx.arc(
            -72,
            15,
            7,
            0,
            Math.PI * 2
        );

        ctx.arc(
            72,
            15,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // BLOODY HANDS
        // ...

        ctx.fill();

        // -------------------------
        // ZOMBIE LEGS
        // -------------------------

        const legSwing =
            Math.sin(zombie.animationTime) * 14;

        ctx.strokeStyle =
            "#293329";

        ctx.lineWidth =
            16;

        ctx.lineCap =
            "round";

        ctx.beginPath();

        ctx.moveTo(
            -18,
            62
        );

        ctx.lineTo(
            -22 + legSwing,
            92
        );

        ctx.moveTo(
            18,
            62
        );

        ctx.lineTo(
            22 - legSwing,
            92
        );

        ctx.stroke();


        ctx.restore();
        ctx.restore();

    });

}

// ============================================
// HORROR AUDIO ENGINE
// ============================================

let audioContext = null;
let masterGain = null;
let ambientStarted = false;

function initAudio() {

    if (audioContext) {
        return;
    }

    audioContext =
        new (window.AudioContext ||
            window.webkitAudioContext)();

    masterGain =
        audioContext.createGain();

    masterGain.gain.value = 0.32;

    masterGain.connect(
        audioContext.destination
    );
}


// ============================================
// GUNSHOT
// ============================================

function playGunshot() {

    const bang =
        new Audio("sounds/BANG.mp3");

    bang.volume = 0.9;

    bang.currentTime = 0;

    bang.play().catch((error) => {
        console.log("Gunshot audio blocked:", error);
    });

}

// ============================================
// ZOMBIE HIT
// ============================================

function playZombieHit() {

    initAudio();

    const now =
        audioContext.currentTime;


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        "sawtooth";

    oscillator.frequency.setValueAtTime(
        180,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        55,
        now + 0.22
    );


    gain.gain.setValueAtTime(
        0.45,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.01,
        now + 0.22
    );


    oscillator.connect(gain);

    gain.connect(masterGain);


    oscillator.start(now);

    oscillator.stop(
        now + 0.22
    );
}


// ============================================
// ZOMBIE SCREAM
// ============================================
function playZombieScream() {

    const scream =
        new Audio("sounds/zombie-scream.mp3");

    scream.volume = 0.85;

    scream.currentTime = 0;

    scream.play().catch((error) => {
        console.log(
            "Zombie scream blocked:",
            error
        );
    });

}

// ============================================
// AMBIENT HORROR DRONE
// ============================================

function startHorrorAmbient() {

    if (ambientStarted) {
        return; closestZombie.y - 40
    }

    initAudio();

    ambientStarted = true;


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        "sine";

    oscillator.frequency.value =
        48;


    gain.gain.value =
        0.045;


    oscillator.connect(gain);

    gain.connect(masterGain);


    oscillator.start();
}
//================================
// SHOOT
// ============================================

function shoot() {

    if (!pistolReady) {
        return;
    }


    if (
        Date.now() -
        shootingCooldown <
        SHOOT_COOLDOWN
    ) {

        return;
    }


    shootingCooldown =
        Date.now();


    // MUZZLE FLASH

    createMuzzleFlash();

    checkZombieHit();

}


// ============================================
// MUZZLE FLASH
// ============================================

function createMuzzleFlash() {

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        particles.push({

            x: aim.x,

            y: aim.y,

            velocityX:
                (Math.random() - 0.5) * 14,

            velocityY:
                (Math.random() - 0.5) * 14,

            gravity: 0,

            life: 1,

            size:
                3 +
                Math.random() * 5

        });

    }
}


// ============================================
// ZOMBIE HIT
// ============================================

function checkZombieHit() {

    let closestZombie =
        null;

    let closestDistance =
        Infinity;


    zombies.forEach(
        (zombie) => {

            const dx =
                aim.x -
                zombie.x;

            const dy =
                aim.y -
                (zombie.y - 40);


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                d <
                zombie.radius + 35 &&
                d <
                closestDistance
            ) {

                closestZombie =
                    zombie;

                closestDistance =
                    d;

            }

        }
    );


    if (
        closestZombie
    ) {

        closestZombie.alive = false;
        closestZombie.dying = true;
        closestZombie.deathTime = Date.now();

        score += 10;

        scoreElement.textContent =
            score;


        createBloodEffect(
            closestZombie.x,
            closestZombie.y - 40
        );

        playGunshot();
        playZombieHit();
        playZombieScream();

    }

}


// ============================================
// BLOOD EFFECT
// ============================================

function createBloodEffect(
    x,
    y
) {

    particles.push({

        x: x,

        y: y,

        velocityX:
            (Math.random() - 0.5) * 18,

        velocityY:
            (Math.random() - 0.5) * 18 - 3,

        gravity:
            0.45,

        life:
            1,

        size:
            2 +
            Math.random() * 8

    });

}




// ============================================
// UPDATE PARTICLES
// ============================================

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.velocityX;


        particle.y +=
            particle.velocityY;


        particle.velocityY +=
            particle.gravity;


        particle.life -=
            0.025;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


// ============================================
// DRAW PARTICLES
// ============================================

function drawParticles() {

    particles.forEach(
        (particle) => {

            ctx.save();

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                "#b00000";

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();

        }
    );

}


// ============================================
// DRAW CROSSHAIR
// ============================================

function drawAim() {

    if (!handDetected) {
        return;
    }


    ctx.save();


    ctx.strokeStyle =
        pistolReady
            ? "#ff2020"
            : "#ffffff";


    ctx.lineWidth =
        3;


    ctx.beginPath();

    ctx.arc(
        aim.x,
        aim.y,
        18,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        aim.x - 30,
        aim.y
    );

    ctx.lineTo(
        aim.x + 30,
        aim.y
    );


    ctx.moveTo(
        aim.x,
        aim.y - 30
    );

    ctx.lineTo(
        aim.x,
        aim.y + 30
    );

    ctx.stroke();


    ctx.restore();

}

// ============================================
// HORROR ATMOSPHERE
// ============================================

let heartbeatAudio = null;
let lastHeartbeat = 0;

function updateHorrorAtmosphere() {

    if (!zombies.length) {
        return;
    }

    let closestDistance = Infinity;

    zombies.forEach((zombie) => {

        const dx =
            zombie.x - aim.x;

        const dy =
            zombie.y - aim.y;

        const d =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (d < closestDistance) {
            closestDistance = d;
        }

    });


    // Convert distance into danger level
    const danger =
        Math.max(
            0,
            Math.min(
                1,
                1 -
                closestDistance / 500
            )
        );


    // Heartbeat becomes faster
    // as zombie gets closer

    const interval =
        1000 -
        danger * 650;


    const now =
        Date.now();


    if (
        now - lastHeartbeat >
        interval
    ) {

        playHeartbeat();

        lastHeartbeat =
            now;

    }

}
// ============================================
// HEARTBEAT
// ============================================

function playHeartbeat() {

    initAudio();

    const now =
        audioContext.currentTime;


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.value =
        55;


    gain.gain.setValueAtTime(
        0.001,
        now
    );

    gain.gain.linearRampToValueAtTime(
        0.5,
        now + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.18
    );


    oscillator.connect(gain);

    gain.connect(masterGain);


    oscillator.start(now);

    oscillator.stop(
        now + 0.2
    );

}
// ============================================
// GAME LOOP
// ============================================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    updateZombies();
    updateHorrorAtmosphere();
    updateParticles();

    drawHorrorWorld();
    drawZombies();
    drawParticles();

    drawAim();


    requestAnimationFrame(
        gameLoop
    );

}


// ============================================
// ZOMBIE SPAWN
// ============================================

setInterval(
    createZombie,
    2500
);


// ============================================
// MEDIAPIPE
// ============================================

const hands =
    new Hands({

        locateFile:
            (file) => {

                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

            }

    });


hands.setOptions({

    maxNumHands: 1,

    modelComplexity: 1,

    minDetectionConfidence:
        0.7,

    minTrackingConfidence:
        0.7

});


hands.onResults(
    (results) => {

        if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
        ) {

            handDetected =
                true;


            const landmarks =
                results.multiHandLandmarks[0];


            // PISTOL

            const currentPistol =
                isGunGesture(
                    landmarks
                );

            pistolReady =
                currentPistol;


            if (
                pistolReady
            ) {

                cameraStatus.textContent =
                    "🔫 PISTOL READY";

            }

            else {

                cameraStatus.textContent =
                    "✋ Make pistol gesture";

            }


            // --------------------------------
            // INDEX + MIDDLE AIM POINT
            // --------------------------------

            const indexTip =
                landmarks[8];

            const middleTip =
                landmarks[12];


            const centerX =
                (
                    indexTip.x +
                    middleTip.x
                ) / 2;


            const centerY =
                (
                    indexTip.y +
                    middleTip.y
                ) / 2;


            const fingerX =
                (1 - centerX) *
                canvas.width;


            const fingerY =
                centerY *
                canvas.height;


            updateAim(
                fingerX,
                fingerY
            );


            // --------------------------------
            // TRIGGER MOVEMENT
            // --------------------------------
            // FIRE WHEN PISTOL MOVES SLIGHTLY DOWN
            // --------------------------------

            if (pistolReady) {

                if (previousFingerY !== null) {

                    const movement =
                        centerY -
                        previousFingerY;


                    // MediaPipe Y increases downward.
                    //
                    // A small positive movement means
                    // the index + middle fingers moved down.
                    //
                    // That triggers one shot.

                    if (
                        movement >=
                        SHOOT_THRESHOLD
                    ) {

                        shoot();

                    }

                }


                // Remember current finger position
                // for the next camera frame.

                previousFingerY =
                    centerY;

            }

            else {

                // Pistol gesture lost.
                // Reset the movement detector.

                previousFingerY =
                    null;

            }

        }

        else {

            handDetected =
                false;

            pistolReady =
                false;

            previousFingerY =
                null;


            cameraStatus.textContent =
                "Show your hand";

        }

    }
);


// ============================================
// CAMERA
// ============================================

const camera =
    new Camera(
        video,
        {

            onFrame:
                async () => {

                    await hands.send({
                        image: video
                    });

                },

            width: 640,

            height: 480

        }
    );


camera.start();


// ============================================
// START
// ============================================

gameLoop();
