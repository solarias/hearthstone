
"use strict";

(function() {


//변수
let otherclass = "전사";
let cardObj = {};
let count = 1;

//함수
function setOther() {
    let choosed = $("#chooseother").value;
    otherclass = choosed;
    $("#otherclass").className = "class_" + choosed;
}

function generate() {
    classcard.forEach(function(card) {
        if (card.keyword.indexOf("퀘스트") < 0) {
            if (!cardObj[card.class]) {
                cardObj[card.class] = [];
            }
            cardObj[card.class].push(card.image);
        }
    })
}

function create() {
    //무작위 선택
    let target = shuffle(deepCopy(cardObj[otherclass]))[0];
    console.log(target);
    //선택한 대상 생성
    let div = document.createElement("div");
        div.className = "card";
        div.style.backgroundImage = "url(" + target + ")";
        div.innerHTML = "<div class='count'>" + count.toString() + "</div>";
    console.log(div);
    $("#created").appendChild(div);
    count += 1;
    //스크롤
    $("#created").scrollTop = $("#created").scrollHeight;
}

function reset() {
    //카드 없애기
    $$("#created .card").forEach(function(x) {
        x.parentElement.removeChild(x);
    })
    //횟수 초기화
    count = 1;
}


//시동
document.addEventListener("DOMContentLoaded", function(e) {
    //상대편 카드 구성
    generate();
    console.log(cardObj);

    //상호작용
    $("#chooseother").onchange = function() {
        reset();
        setOther();
    }
    $("#stole").onclick = function() {
        create();
    }
    $("#reset").onclick = function() {
        reset();
    }
});




})()
