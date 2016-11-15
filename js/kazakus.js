
var i;
var costText = [
    "비용이 1인 주문을<br/>만듭니다.<br/><br/>",
    "비용이 5인 주문을<br/>만듭니다.<br/><br/>",
    "비용이 10인 주문을<br/>만듭니다.<br/><br/>"
];
var material = {
    cost1:[
        "카드를 1장 뽑습니다.",
        "모든 하수인에게 피해를 2 줍니다.",
        "이번에 죽은 내 하수인 하나를 무작위로 소환합니다.",
        "방어도를 4 얻습니다.",
        "무작위 악마 하나를 내 손으로 가져옵니다.",
        "모든 아군 하수인에게 체력 +2를 부여합니다.",
        "2/2 악마를 하나 소환합니다.",
        "피해를 3 줍니다.",
        "무작위 적 하수인 하나를 빙결시킵니다."
    ],
    cost2:[
        "카드를 2장 뽑습니다.",
        "모든 하수인에게 피해를 4 줍니다.",
        "이번에 죽은 내 하수인 둘을 무작위로 소환합니다.",
        "방어도를 7 얻습니다.",
        "무작위 하수인 하나를 1/1 양으로 변신시킵니다.",
        "무작위 악마 둘을 내 손으로 가져옵니다.",
        "모든 아군 하수인에게 체력 +4를 부여합니다.",
        "5/5 악마를 하나 소환합니다.",
        "피해를 6 줍니다.",
        "무작위 적 하수인 둘을 빙결시킵니다."
    ],
    cost3:[
        "카드를 3장 뽑습니다.",
        "모든 하수인에게 피해를 6 줍니다.",
        "이번에 죽은 내 하수인 셋을 무작위로 소환합니다.",
        "방어도를 10 얻습니다.",
        "모든 하수인을 1/1 양으로 변신시킵니다.",
        "무작위 악마 셋을 내 손으로 가져옵니다.",
        "모든 아군 하수인에게 체력 +6을 부여합니다.",
        "8/8 악마를 하나 소환합니다.",
        "피해를 9 줍니다.",
        "무작위 적 하수인 셋을 빙결시킵니다."
    ]
};
var selected = [];
var remained = [];
var showing = [];


function setCard(cmd, num) {
    switch (cmd) {
        case "cost":
            for (i = 1; i <= 3; i++) {
                (function(i) {
                    //이미지
                    var card = $("#card" + i.toString());
                    card.classList.remove("kazakus");
                    card.classList.remove("visible","create");
                    setTimeout(function() {
                        void card.offsetWidth;
                        card.classList.add("visible");
                    },700);
                    card.style.backgroundImage = "url('./images/kazakus/cost" + i.toString() + ".png')";
                    $("#text" + i.toString()).innerHTML = costText[i-1];
                        card.onclick = function() {
                            //효과 준비
                            remained = deepCopy(material["cost" + i.toString()]);
                            //효과 클릭 개시
                            setCard("effect", i);
                        };
                })(i);
            }

            break;
        case "effect":
            //효과 부여
            showing = [];
            remained = shuffle(remained);
            while (showing.length < 3) {
                showing.push(remained[remained.length - 1]);
                remained.pop();
            }
            for (i = 1; i <= 3; i++) {
                (function(i) {
                    //텍스트
                    $("#text" + i.toString()).innerHTML = showing[i - 1];
                    //이미지
                    var card = $("#card" + i.toString());
                    card.classList.remove("visible");
                    void card.offsetWidth;
                    setTimeout(function() {
                        card.classList.add("visible");
                    }, 200);
                    card.style.backgroundImage = "url('./images/kazakus/material" + num.toString() + ".png')";
                    card.onclick = function() {
                        //효과 저장
                        selected.push(showing[i-1]);
                        if (selected.length < 2) {
                            //효과 지정 남음 : 이펙트 재지정
                            setCard("effect", num);
                        } else {
                            //효과 지정 완료 : 출력
                            setCard("result", num);
                        }
                    };
                })(i);
            }

            break;
        case "result":
            //배경 제거
            $("#myCanvas").className = "disappear";
            //효과 부여
            var txt =  selected[0] + "<br/>" + selected[1];
            for (i = 1; i <= 3; i++) {
                (function(i) {
                    //이미지
                    var card = $("#card" + i.toString());
                    card.classList.remove("visible");
                    card.onclick = "";
                })(i);
            }
            //텍스트
            $("#text2").innerHTML = txt;
            $("#text2").classList.add("result");
            //이미지
            var card2 = $("#card2");
            card2.style.backgroundImage = "url('./images/kazakus/result" + num.toString() + ".png')";
            card2.classList.remove("visible");
            void card2.offsetWidth;
            setTimeout(function() {
                card2.classList.add("create");
                //재시작
                $("#start").style.display = "inline";
                $("#start").onclick = function() {
                    init();
                };
            }, 500);

            break;
    }
}

function init() {
    //변수 초기화
    selected = [];
    for (i = 1; i <= 3; i++) {
        //이미지
        $("#text" + i.toString()).innerHTML = "";
        $("#text" + i.toString()).classList.remove("result");
    }
    //버튼 감추기
    $("#start").style.display = "none";
    //배경 등장
    $("#myCanvas").className = "appear";
    //실행
    setCard("cost");
}

window.onload = function() {
    $("#start").disabled = false;
    $("#start").innerHTML = "주문 생성하기";
    $("#start").onclick = function() {
        init();
    };
};
