var cube = document.querySelector('.cube');

cube.addEventListener("click", function (event) {
    cube.className = "cube animate";
    console.log("click");
})


var gos = document.querySelectorAll('.go');


// solution1
Array.prototype.map.call(gos, function (v, i) {
    v.addEventListener('click', function () {
        console.log(i + 1);
    })
});


// solution2
for (var index = 0; index < gos.length; index++) {
    var element = gos[index];
    clickEvent(gos[index], index);
}

function clickEvent(v, i) {
    v.addEventListener('click', function () {
        console.log(i + 1);
    })
}

