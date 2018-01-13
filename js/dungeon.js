
'use strict';

//변수 관리
var invenURL = "http://static.inven.co.kr/image_2011/hs/dataninfo/card/render/";
var info = {
    class:"",//플레이어 직업
    stage:1,//현재 층
    boss:[]//출현한 보스 목록
}
var stageInfo = [
    "리치 왕",
    "우두머리$1","지속효과","전리품",
    "우두머리$2","전리품",
    "우두머리$3","보물","전리품",
    "우두머리$4","전리품",
    "우두머리$5","지속효과","전리품",
    "우두머리$6","전리품",
    "우두머리$7","보물","전리품",
    "우두머리$8"
]
var classInfo = {
    "전사":"7",
    "주술사":"1066",
    "도적":"930",
    "성기사":"671",
    "사냥꾼":"31",
    "드루이드":"274",
    "흑마법사":"893",
    "마법사":"637",
    "사제":"813"
}

//토그왜글 대사
var voices;
function speak(input) {
    var str = "";
    switch (input) {
        case "init":
            str = "이게 무슨 냄새지? 가죽? 철? 횃불이다… 모험가들이다. 흥! 모험가들이라니!";
            break;
        case "first":
            str = "미궁에 들어설 때마다 여덟 마리의 괴물과 싸운다! 손가락 갯수랑 똑같다!";
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
        default:
            str = input;
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
    //선택창 출력
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
        //직업 이미지 표시
        $("#status_hero").src = invenURL + classInfo[choose] + ".jpg";
        //던전 개방
        dungeon_open(info.stage);
    });
}

//던전 이동
function dungeon_next() {
    //스테이지 증가
    info.stage += 1;
    //다음 던전이 있으면 진행
    if (stageInfo[info.stage] !== undefined) {
        dungeon_open(info.stage);
    //없으면 클리어 처리
    } else {
        dungeon_clear();
    }


}

//던전 관리
function dungeon_open(floor) {
    //우두머리 층 구분
    let stagestr = stageInfo[floor].split("$");
    //내부 치장하기
    switch(stagestr[0]) {
        case "우두머리":
            dungeon_create("우두머리",parseInt(stagestr[1]));
            break;
        case "지속효과":
            dungeon_create("지속효과");
            /*임시*/
            setTimeout(dungeon_next,800);
            break;
        case "보물":
            dungeon_create("보물");
            /*임시*/
            setTimeout(dungeon_next,800);
            break;
        case "전리품":
            dungeon_create("전리품");
            /*임시*/
            setTimeout(dungeon_next,800);
            break;
    }
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

function dungeon_create(type, stageNum) {
    console.log(stageNum);
    //우두머리 출현
    if (type === "우두머리") {
        let arr = [];
        //해당 층 출현가능 보스 정리
        bossList.forEach(function(boss) {
            if (boss.stage.indexOf(stageNum) >= 0 & info.boss.indexOf(boss.name) < 0) {
                arr.push(boss.id);
            }
        })
        //출현확률 정리
        let arr2 = [];
        arr.forEach(function(target) {
            arr2.push(indexArrKey(bossList,"id",target).weight)
        })
        //출현보스 선택
        let boss = arr[rand(arr2)];
        boss = indexArrKey(bossList,"id",boss);

        //출현보스 기록
        info.boss.push(boss.name);
        //토그왜글 안내(0.5초 뒤)
        setTimeout(function() {
            //첫 보스 대사
            if (stageNum === 1) {
                speak("first");
            //그 외: 보스 대사 있으면
            } else if (boss.tog !== undefined) {
                speak(boss.tog);
            }
        },500);

        //내부 치장하기
        let stage = $("#main_select_" + info.stage.toString());

        let elm_boss = document.createElement("div.select_boss");

        let elm_boss_img = document.createElement("div.boss_img");
            elm_boss_img.style.backgroundImage = "" +
            "url(./images/dungeon/boss_cover.png),url(" + invenURL + boss.cardid + ".jpg)";
        let elm_boss_desc = document.createElement("div.boss_desc");
            elm_boss_desc.innerHTML = boss.desc;
        let elm_boss_power = document.createElement("div.boss_power");
            elm_boss_power.innerHTML = boss.power;
        let elm_boss_clear = document.createElement("button.boss_clear");
            elm_boss_clear.classList.add("clickable");
            elm_boss_clear.innerHTML = "무찌르기";
        let elm_boss_name = document.createElement("div.boss_name");
            elm_boss_name.innerHTML = boss.name;
        let elm_boss_health = document.createElement("div.boss_health");
            elm_boss_health.innerHTML = boss.health;

        elm_boss.appendChild(elm_boss_img);
        elm_boss.appendChild(elm_boss_desc);
        elm_boss.appendChild(elm_boss_power);
        elm_boss.appendChild(elm_boss_clear);
        elm_boss.appendChild(elm_boss_name);
        elm_boss.appendChild(elm_boss_health);

        //버튼 설정
        elm_boss_clear.onclick = function() {
            //버튼 변경
            elm_boss_clear.innerHTML = "무찔렀음";
            //던전 폐쇄
            stage.classList.remove("opened");
            stage.classList.add("finished");
            //다음 던전
            dungeon_next();
        }
        //치장 완료
        stage.appendChild(elm_boss);
    }
    //지속효과, 보물 출현
    //전리품 출현
}

function dungeon_reset() {
    //모든 보스/보물/전리품 삭제
    $$(".select_boss").forEach(function(target) {
        target.parentNode.removeChild(target);
    })
    $$(".select_treasure").forEach(function(target) {
        target.parentNode.removeChild(target);
    })
    $$(".select_loot").forEach(function(target) {
        target.parentNode.removeChild(target);
    })

    //모든 층 닫기
    $$(".main_select").forEach(function(target) {
        target.classList.remove("finished","opened");
        target.classList.add("closed");
    })
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
