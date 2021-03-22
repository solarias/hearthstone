
var i;
var costText = [
    "",
    "",
    ""
];
var material = {
    lesser:[
        "<b>속공</b>",
        "<b>도발</b>",
        "<b>천상의 보호막</b>",
        "<b>생명력 흡수</b>",
        "<b>은신</b>",
        "<b>독성</b>"
    ],
    cost1:[
        "<b>전투의 함성:</b> 다른 모든 아군 하수인에게 +1/+1을 부여합니다.",
        "<b>전투의 함성:</b> 이 하수인을 복사하여 소환합니다.",
        "<b>전투의 함성:</b> 무작위 적 하수인을 빙결시킵니다.",
        "<b>전투의 함성:</b> 무작위 적 하수인에게 피해를 3 줍니다.",
        "<b>주문 공격력 +1</b>",
        "<b>전투의 함성:</b> 카드를 1장 뽑습니다."
    ],
    cost2:[
        "<b>전투의 함성:</b> 다른 모든 아군 하수인에게 +2/+2를 부여합니다.",
        "<b>전투의 함성:</b> 이 하수인을 복사하여 소환합니다.",
        "<b>전투의 함성:</b> 무작위 적 하수인 둘을 빙결시킵니다.",
        "<b>전투의 함성:</b> 무작위 적 하수인 둘에게 피해를 3 줍니다.",
        "<b>주문 공격력 +2</b>",
        "<b>전투의 함성:</b> 카드를 2장 뽑습니다."
    ],
    cost3:[
        "<b>전투의 함성:</b> 다른 모든 아군 하수인에게 +4/+4를 부여합니다.",
        "<b>전투의 함성:</b> 이 하수인을 복사하여 소환합니다.",
        "<b>전투의 함성:</b> 모든 적 하수인을 빙결시킵니다.",
        "<b>전투의 함성:</b> 모든 적 하수인에게 피해를 3 줍니다.",
        "<b>주문 공격력 +4</b>",
        "<b>전투의 함성:</b> 카드를 4장 뽑습니다."
    ]
}
var selected = [];
var remained1 = [];
var remained2 = [];
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
                    card.style.backgroundImage = "url('./images/kazakus2/cost" + i.toString() + ".png')";
                    card.classList.add('cost')
                    card.classList.remove('herb','result')
                    $("#text" + i.toString()).innerHTML = costText[i-1];
                        card.onclick = function() {
                            //효과 준비
                            remained1 = deepCopy(material.lesser);
                            remained2 = deepCopy(material["cost" + i.toString()]);
                            //효과 클릭 개시
                            setCard("herb1", i);
                        };
                })(i);
            }

            break;
        case "herb1":
            //효과 부여
            showing = []
            remained1 = shuffle(remained1);
            while (showing.length < 3) {
                showing.push(remained1[remained1.length - 1]);
                remained1.pop();
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
                    card.style.backgroundImage = "url('./images/kazakus2/herb" + num.toString() + ".png')"
                    card.classList.add('herb')
                    card.classList.remove('cost','result')
                    card.onclick = function() {
                        //효과 저장
                        selected.push(showing[i-1]);
                        //다음 효과
                        setCard("herb2", num);
                    };
                })(i);
            }

            break;
        case "herb2":
            //효과 부여
            showing = [];
            remained2 = shuffle(remained2);
            while (showing.length < 3) {
                showing.push(remained2[remained2.length - 1]);
                remained2.pop();
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
                    card.style.backgroundImage = "url('./images/kazakus2/herb" + num.toString() + ".png')"
                    card.classList.add('herb')
                    card.classList.remove('cost','result')
                    card.onclick = function() {
                        //효과 저장
                        selected.push(showing[i-1]);
                        //효과 지정 완료 : 출력
                        setCard("result", num);
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
            card2.style.backgroundImage = "url('./images/kazakus2/result" + num.toString() + ".png')";
            card2.classList.add('result')
            card2.classList.remove('cost','herb')
            card2.classList.remove("visible");
            void card2.offsetWidth;
            setTimeout(function() {
                card2.classList.add("create");
                //재시작
                $("#start").style.visibility = "visible";
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
    $("#start").style.visibility = "hidden";
    //배경 등장
    $("#myCanvas").className = "appear";
    //실행
    setCard("cost");
}

window.onload = function() {
    $("#start").disabled = false;
    $("#start").innerHTML = "원하는 골렘 만들기";
    $("#start").onclick = function() {
        init();
    };
};
