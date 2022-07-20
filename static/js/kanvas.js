let w, h, c, r, posX = 0, posY = 0, rot = 270, end = false;
let robot, star, starMovUp = true, starY = 9;
let platno = document.getElementById("konva-holder")

function restart(){
    posX = 0;
    posY = 0;
    rot = 270;
    steps = 0;
    starY = 9;
    starMovUp = true;
    end = false;
    createCanvas();
}

function createCanvas() {
    steps = 0;
    w = platno.offsetWidth;
    h = platno.offsetHeight;

    var stage = new Konva.Stage({
        container: 'konva-holder',
        width: 1.04 * w,
        height: 1.04 * h,
    });

    var layer = new Konva.Layer();
    stage.add(layer);

    for (let i = 0; i < c; i++) {
        for (let j = 0; j < r; j++) {
            let rect = new Konva.Rect({
                x: i * w / c + w / 80,
                y: j * h / r + w / 80,
                fill: "blue",
                stroke: "orange",
                strokeWidth: w / c / 10,
                width: w / c * 0.94,
                height: h / r * 0.94,
            });
            layer.add(rect);
        }
    }

    for (let i = 0; i < obsts; i++){
        let rect = new Konva.Rect({
            x: px[z][i] * w / c + w / 80,
            y: py[z][i] * h / r + w / 80,
            fill: "black",
            stroke: "orange",
            strokeWidth: w / c / 10,
            width: w / c * 0.94,
            height: h / r * 0.94,
        });
        layer.add(rect);
    }

    star = new Konva.Star({
        x:   (c-1/2)*w/c  + w / 120,
        y:   (r-1/2)*h/r  + w / 80,
        fill: "yellow",
        outerRadius: w / (2*c) * 0.94,
        innerRadius: w / (2*c) * 0.47,
    });
    layer.add(star);

    var imageObj = new Image();
    imageObj.onload = function () {
        robot = new Konva.Image({
            x: posX * w / c +  w / 80 + w/c*0.47,
            y: posY * h / r + w / 80 + w/c*0.08 + h/r*0.4,
            image: imageObj,
            width: w / c * 0.94,
            height: h / r * 0.80,
            offsetX: w / c * 0.47,
            offsetY: h / r * 0.4,
            rotation: rot,
        });
        layer.add(robot);
    };
    imageObj.src = "/static/images/robot.png";
    layer.draw();
}

let i, command, steps, ok = true;

function g(es){
    if (ok){
        command = es;
        ok = false;
        i = 0;
        go().then(() => {ok = true;})
    }
}

async function go(){
    while (i < command.length) {
        if (finish()) break;
        let ch = command.charAt(i++);
        if (ch === "}") {
            break;
        } else if (ch === "p") { // podmínka
            let cond = command.charAt(i++);
            if(command.charAt(i) === "{") {
                if (!condition(cond, "p")) {  // nebyla-li splněna podmínka
                    i++;
                    ignore(); // ignoruj všechny vnořené příkazy
                }
                go();
            }
        } else if (ch === "c") { // cyklus
            let cond = command.charAt(i++);
            if (command.charAt(i) === "{") {
                let j = ++i;
                if(isNaN(cond)) { // while-cyklus
                    if (!condition(cond, ch)) { // nebyla-li splněna podmínka
                        ignore(); // ignoruj všechny vnořené příkazy
                    } else {
                        while (condition(cond, "c")) { // dokud je splněna podmínka
                            i = j;
                            await go();
                        }
                    }
                } else { // for-cyklus
                    for (let u = 0; u < cond ; u++) {
                        i = j;
                        await go();
                    }
                }
            }
        } else { // jedná-li se o pohyb
            make(ch) // vykonej pohyb
            await new Promise(resolve => setTimeout(resolve, 260)); // počkej 260 ms na vykonání animace
        }
    }
    if (finish()) {
        end = true;
        star.destroy();
        Swal.fire(
            'Dobrá práce!',
            'Vyřešeno za ' + steps + ' kroků!',
            'success'
        ).then((result) => {steps=0;})
        return;
    }
}


function finish(){
    if (z == 1) return posX === c - 1 && posY == starY;
    return posX === c - 1 && posY === r - 1;
}

// funkce, která ignoruje všechny příkazy až po aktuálního bloku
function ignore(){
    let exp = 1;
    let found = 0;
    while(found !== exp){
        if(command.charAt(i) === "{")
            exp++;
        else if(command.charAt(i) === "}")
            found++;
        i++;
    }
}

// fce vrací true, pokud je před robotem překážka, jinak vrací false
function obstacle(angle){
    // nejdříve ověří jestli nejde mimo šachovnici
    if ((angle === 0 && posY === r - 1) || (angle === 90 && posX === 0) || (angle === 180 && posY === 0) || (angle === 270 && posX === c - 1)) {
        return true;
    }
    // poté ověří, jestli nemíří na překážku
    for(let index = 0; index < obsts; index++){
        if (((angle === 0 && posY === py[z][index] - 1) && posX === px[z][index]) || ((angle === 90 && posX === px[z][index] + 1) && posY === py[z][index]) || ((angle === 180 && posY === py[z][index] + 1) && posX === px[z][index]) || ((angle === 270 && posX === px[z][index] - 1) && posY === py[z][index]))
            return true;
    }
    return false;
}

function condition(cond, sender){
    var res, angle = robot.rotation() % 360;
    if(cond === "o") res = obstacle(angle);
    else if(cond === "n") res = angle === 180;
    else if(cond === "s") res = angle === 0;
    else if(cond === "e") res = angle === 270;
    else if(cond === "w") res = angle === 90;
    return (sender === "c")? !res : res;
}

// funkce na vykonání pohybu na plátně
function make(a) {
    rot = robot.rotation();
    var distanceX = 0, distanceY = 0, angle = rot % 360;
    if (a === 'k') {
        if (obstacle(angle)) return false;
        if (angle === 0) {  // JIH
            distanceY = h / r;
            posY++;
        } else if (angle === 90) {   // ZÁPAD
            distanceX = -w / c;
            posX--;
        } else if (angle === 180) {  // SEVER
            distanceY = -h / r;
            posY--;
        } else if (angle === 270) { // VÝCHOD
            distanceX = w / c
            posX++;
        }
    } else if (a === 'l') {
        rot += 90;
    }
    steps++;
    new Konva.Tween({
        node: robot,
        duration: 0.25,
        x: robot.x() + distanceX,
        y: robot.y() + distanceY,
        rotation: rot,
    }).play();
    if(z == 1){
        var sy = -h/r;
        if (starY == 9){
            starMovUp = true;
            starY--;
        } else if (starY == 0){
            starMovUp = false;
            sy = -sy;
            starY++;
        } else if(starMovUp == false) {
            sy = -sy
            starY ++;
        } else {
            starY--;
        }
        new Konva.Tween({
            node: star,
            duration: 0.25,
            y: star.y() + sy,
        }).play();
    }
    return true;
}