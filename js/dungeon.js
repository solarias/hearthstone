
'use strict';

//변수 관리
var info = {
    class:"",//플레이어 직업
    stage:1,
}
var stageInfo = {
    "우두머리":[1,2,3,4,5,6,7,8],
    "지속효과":[1-1,5-1],
    "보물":[3-1,7-1],
    "전리품":[1-2,2-1,3-2,4-1,5-2,6-1,7-2]
}


//토그왜글 대사
var voices;
function speak(situation) {
    var str = "";
    switch (situation) {
        case "init":
            str = "이게 무슨 냄새지? 가죽? 철? 횃불이다… 모험가들이다. 흥! 모험가들이라니!";
            break;
        case "finish":
            var arr = [
                "쿠엘델라를 구하지 못했다고? 그럼 미궁으로 다시 들어가!",
                "쿠엘델라를 구할 때까지 미궁 나올 생각 하지 마라.",
                "쿠엘델라가 없었다고? 네가 찾지 못했을 뿐이다.",
                "내가 미궁에 들어가면 쿠엘델라를 눈깜짝할 새에 찾을 거다. 난 안들어가겠지만.",
                "시간이 많지 않으니 어서 미궁으로 들어가 쿠엘델라를 찾아라.",
                "모험가는 많지만 쿠엘델라는 단 하나 뿐이다. 절대 뺏기지 마라.",
                "어서 쿠엘델라를 찾아라! 어서!",
                "내가 왜 쿠엘델라를 찾고 있냐고? 모험가는 알 필요 없다.",
                "절대 쿠엘델라를 벼려낼 수 없다는 팁은 거짓말이니 어서 찾아라.",
                "느려터진 노움도 너보다 쿠엘델라를 빨리 찾겠다. 안그런가?",
                "왕국의 재정만 충분했어도 너보다 뛰어난 모험가를 구했을거다.",
                "어서 쿠엘델라를 찾아 너의 돈값을 증명해라.",
                "쿠엘델라는 리치왕의 보물창고에 없다. 이 미궁에 분명히 존재한다.",
                "리노 잭슨이 쿠엘델라를 노리고 있다. 그에게서 쿠엘델라를 뺏기지 마라.",
                "쿠엘델라가 야생에서 발견되었다고? 그럴 리가 없다. 어서 미궁에 들어가라."
            ]
            str = arr[Math.floor(Math.random() * (arr.length-1))];
            break;
    }

    $("#tog_text").innerHTML = str;
    try {
        let msg = new SpeechSynthesisUtterance(str);
            msg.rate = 3;
        voice(msg);
    } catch(e){}
}

function voice(txt) {
    window.speechSynthesis.cancel();
    voices = window.speechSynthesis.speak(txt);
    window.speechSynthesis.resume();
}
//====================================================================================

//직업 선택
function select_class() {
    swal({
        title: '직업을 선택하세요.',
        input: 'select',
        inputOptions: {
            "전사":"전사",
            "주술사":"주술사",
            "도적":"도적",
            "성기사":"성기사",
            "사냥꾼":"사냥꾼",
            "드루이드":"드루이드",
            "흑마법사":"흑마법사",
            "마법사":"마법사",
            "사제":"사제"
        },
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        cancelButtonColor: '#d33',
        onOpen:function() {
            if (info.class !== "") {
                var options = $$(".swal2-select")[0].options;
                for (let  i = 0;i < options.length;i++) {
                    if (options[i].value === info.class) {
                        options.selectedIndex = i;
                        options[i].innerHTML += " (이전 영웅)";
                    }
                }
            }
        }
    }).then(function(choose) {
        //직업 결정
        info.class = choose;
        //던전 개방
        dungeon_open(info.stage);
    });
}

//던전 관리
function dungeon_open(floor) {
    //내부 세팅
    //버튼 활성화
    //해당 위치로 스크롤
    TweenMax.to($("#main_select_frame"),0.5,{scrollTo:$("#main_select_" +info.stage.toString()).offsetTop - 5});
    //해당 위치 오픈
        //1층이 아니라면 0.5초 대기
        if (info.stage !== 0) {
            setTimeout(function() {
                $("#main_select_" + info.stage.toString()).classList.remove("closed");
                $("#main_select_" + info.stage.toString()).classList.add("opened");
            },500);
        } else {
            $("#main_select_" + info.stage.toString()).classList.remove("closed");
            $("#main_select_" + info.stage.toString()).classList.add("opened");
        }
}


//=============================================================================================
//
//
window.onload = function() {
    (function() {
        let agent = navigator.userAgent.toLowerCase();
        if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
            alert("※ 인터넷 익스플로러에서는 일부 기능이 제대로 작동하지 않습니다." +
            "\n크롬, 파이어폭스 등 다른 브라우저를 이용하길 추천합니다.");
        }
    })()

    //토그왜글 환영사
    $("#tog").style.transform = "scale(1)";
    speak("init");

    //탐험 시작 버튼
    $("#status_button").onclick = function() {
        //직업 선택
        select_class();
    }
}
