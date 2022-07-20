let drake =  window.dragula();

function setupDragula(){
    drake.destroy();
    drake = dragula([].slice.apply(document.querySelectorAll('.nested')),{removeOnSpill: true});
}

let cont = document.getElementById("cont");

function add(num) {
    let elem = (num === 1) ?  '<div class="k p"> KROK </div>' : '<div class="l t"> VPRAVO-VBOK </div>';
    cont.insertAdjacentHTML("beforeend", elem);
    setupDragula();
}

function addNested(num) {
    let elem;
    if(num === 1) {
        elem = '<div class="for">OPAKUJ ' +
        '<input type="number" class="num" min="1" max="10" value="3">krát' +
        '<div class="nested"></div></div>';
    } else if(num === 2) {
        elem = '<div class="while">DOKUD NENÍ ' +
        '<select class="sel">' +
        '<option value="obstacle">PŘEKÁŽKA</option>' +
        '<option value="north">SEVER</option>' +
        '<option value="south">JIH</option>' +
        '<option value="west">ZÁPAD</option>' +
        '<option value="east">VÝCHOD</option>' +
        '</select> <div class="nested"></div></div>';
    } else if(num === 3) {
        elem = '<div class="if">KDYŽ ' +
        '<select class="sel">' +
        '<option value="obstacle">Překážka</option>' +
        '<option value="north">Sever</option>' +
        '<option value="south">Jih</option>' +
        '<option value="west">Západ</option>' +
        '<option value="east">Východ</option>' +
        '</select> <div class="nested"></div></div>';
    }
    cont.insertAdjacentHTML("beforeend", elem);
    setupDragula();
}

function addCustomCommand(a){
    cont.insertAdjacentHTML("beforeend", '<div class="'+ a.className + ' red">' + a.innerHTML + '</div>');
    setupDragula();
}

function rec(element) {
    let s = "", node;
    let nodes = element.children;
    for (let i = 0; i < nodes.length; i++) {
        node = nodes[i].className;
        if(node === "nested") {
            if (rec(nodes[i]) !== "")
                s += ("{" + rec(nodes[i])+ "}");
        } else if(node === "num") {
            s += nodes[i].value;
        } else if(node === "for" || node === "while") {
            s += ( "c" + rec(nodes[i]) );
        } else if(node === "if") {
            s += ( "p" + rec(nodes[i]) );
        } else if(node === "sel") {
            s += nodes[i].value[0]; // n - sever, s - jih, w - západ, e - východ, o - překážka
        } else {
            let i = 0;
            while(node[i] !== " ")  s += node[i++];
        }
    }
    return s;
}

document.getElementById("send").addEventListener("click", function() {
    if(end) Swal.fire({
        icon: 'error',
        title: 'Level dokončen',
        text: 'Level je již dokončen!',
    })
    else g(rec(cont));
});

document.getElementById("delete").addEventListener("click", () => { cont.innerHTML = '';});

document.getElementById("save").addEventListener("click", async () => {
    var command = rec(cont), cancel = false, name = "";
    if (command === "") {
        errorAlert('Nelze uložit prázdný příkaz!');
        return;
    }

    await Swal.fire({
        title: "Nový příkaz",
        text: "Zadejte název příkazu:",
        input: 'text',
        showCancelButton: true
    }).then((result) => {
        if (result.value) {
            name = result.value.toUpperCase();
        } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.backdrop){
            cancel = true;
        }
    });

    if(cancel) return;

    if(name !== "") {
        html = getHtml(cont);
        fetch("/commands", {
            method: 'POST',
            body: JSON.stringify({command: command, name: name, html: html}) // cont.innerHTML
        });

        var elem = '<li><a onclick="javascript:addCustomCommand(this)" class="'+ command +'">' + name + '</a></li>';
        document.getElementById("commands").insertAdjacentHTML("beforeend", elem);
        cont.innerHTML = '';
        cont.insertAdjacentHTML("beforeend", '<div class="'+ command + ' red">' + name + '</div>');
        setupDragula();
    } else {
        errorAlert('Nezadali jste jméno příkazu!')
    }
})

function errorAlert(text){
    Swal.fire({
        icon: 'error',
        title: 'Chyba při ukládání příkazu',
        text: text,
    })
}

function getHtml(element){
    let s = "", node;
    let nodes = element.children;
    for (let i = 0; i < nodes.length; i++) {
        node = nodes[i].className;
        if(node === "nested") {
            s += '<div class="nested">' + getHtml(nodes[i]) + '</div>';
        } else if(node === "num") {
            s += '<input type="number" class="num" min="1" max="10" value="' + nodes[i].value + '">krát';
        } else if(node === "sel") {
            s += '<select class="sel"> <option value="'+ nodes[i].value +'">'+ nodes[i].options[nodes[i].selectedIndex].text+'</option></select>';
        } else if(node === "for") {
            s += '<div class="for">OPAKUJ ' + getHtml(nodes[i]) + '</div>';
        } else if (node === "while"){
            s += '<div class="while">DOKUD NENÍ ' + getHtml(nodes[i]) + '</div>';
        }else if(node === "if") {
            s += '<div class="if">KDYŽ ' + getHtml(nodes[i]) + '</div>';
        } else {
            s += '<div class="' + node + '">'+nodes[i].innerHTML + '</div>';
        }
    }
    return s;
}