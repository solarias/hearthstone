
'use strict';

//============================================================================================
//※ 변수 관리
//============================================================================================
const INVENURL = "http://static.inven.co.kr/image_2011/hs/dataninfo/card/render/";
const INFO = {
    status:"standby",
    stage:1,//현재 층
    boss:[],//출현한 보스 목록
    deck:[]//현재 덱
}
    let info = {};//복사하면서 쓸 status
    let selectedClass = "";//플레이어 직업(기억용)
const STAGEINFO = [//스테이지 정보
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
const CLASSINFO = {//직업 이미지 정보
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
const DUPLICATE =  {//중복 전리품 등장 확률
    str:["미중복","2중복","3중복"],
    num:[0.76,0.23,0.01]
}
let bundle = {}//카드 번들 저장용

//============================================================================================
//※ 토그왜글 진행
//============================================================================================
let voices;
function speak(input) {
    let str = "", arr = [];
    switch (input) {
        case "init":
            str = "미궁을 도전하는 모험가들을 위해 특별히 훈련소 만들었다. 얼른 도전해라. 보상은 기대하지 말고.";
            break;
        case "first":
            str = "미궁에 들어설 때마다 여덟 마리의 괴물과 싸운다! 손가락 갯수랑 똑같다!";
            break;
        case "success":
            arr = [
                "이 정도로 훈련 충분하다고 보나? 다시 훈련소에 들어가라.",
                "어떠냐, 이번 미궁 덱은 마음에 드나?",
                "이번에는 운이 좋았군. 한 번 더 도전해봐라.",
                "쿠엘델라가 얻지 못했다면 이겨도 이긴 게 아니다. 쿠엘델라는 손에 얻었나?"
            ]
            str = arr[Math.floor(Math.random() * (arr.length-1))];
            break;
        case "failure":
            arr = [
                "포기한다고 너무 낙심하지마라. 영원히 미궁이 갇히는 것보단 빨리 포기하는 게 낫다.",
                "미궁 덱 마음에 안 드나? 다시 한 번 제대로 짜봐라.",
                "다음 번엔 더 잘 될 거다. 그렇게라도 생각해라.",
                "코볼트 왕국의 미궁은 변화무쌍하다. 나도 어쩔 도리가 없다.",
                "마음을 가다듬고 다시 도전해봐라.",
                "다음 번엔 운이 더 좋을 거다. 장담할 수는 없지만.",
                "네 운을 탓하지 말아라. 이것도 다 실력이다."
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
//============================================================================================
//※ 카드 관련
//============================================================================================
//카드 정리
function card_arrange() {
    rewardList.forEach(function(reward,i) {
        let themeArr = reward.bundle.split(",");
        themeArr.forEach(function(theme,j) {
            //지속효과, 보물, 특수보물 : 그냥 묶음
            if (["지속효과","보물","특수보물"].indexOf(theme) >= 0) {
            if (Object.keys(bundle).indexOf(theme) < 0)
                bundle[theme] = [];
                bundle[theme].push(reward.id);
            //그 외 : 직업별로 묶음
            } else {
                let bundleArr = theme.split("_");
                if (Object.keys(bundle).indexOf(bundleArr[0]) < 0)
                    bundle[bundleArr[0]] = {};
                if (Object.keys(bundle[bundleArr[0]]).indexOf(bundleArr[1]) < 0)
                    bundle[bundleArr[0]][bundleArr[1]] = [];
                bundle[bundleArr[0]][bundleArr[1]].push(reward.id);
            }
        })
    })
}

//카드 요소 생성
function card_generate(id, quantity) {
    //정보 불러오기
    let card = indexArrKey(rewardList,"id",id);
    //요소 생성
    let elm_card = document.createElement("div.card.selectable");
        elm_card.dataset.id = card.id;
        elm_card.dataset.cardid = card.cardid;
        //마우스 올리면 카드 미리보기
        elm_card.onmouseover = function() {
            card_preview("show",elm_card.dataset.cardid);
        }
        elm_card.onclick = function() {
            card_preview("show",elm_card.dataset.cardid);
        }
        elm_card.onmouseout = function() {
            card_preview("hide");
        }
    let elm_card_cost = document.createElement("div.card_cost");
        elm_card_cost.innerHTML = card.cost;
    let elm_card_name = document.createElement("div.card_name");
        elm_card_name.classList.add("rarity_" + card.rarity);
        elm_card_name.innerHTML = card.name;
    let elm_card_quantity = document.createElement("div.card_quantity");
        //수량이 2 이상: 수량 표기
        if (quantity >= 2) {
            elm_card_quantity.innerHTML = quantity;
        //수량이 1 이하: 전설이면 "별" 표기
        } else if (quantity <= 1 && card.rarity === "전설") {
            elm_card_quantity.innerHTML = "★";
        //아무것도 아니라면 숨기기
        } else {
            elm_card_quantity.classList.add("none");
        }
    //요소 합치기
    elm_card.appendChild(elm_card_cost);
    elm_card.appendChild(elm_card_name);
    elm_card.appendChild(elm_card_quantity);
    //출력
    return elm_card;
}

//카드 정보보기
function card_preview(cmd, cardid) {
    switch(cmd) {
        case "show":
            //카드 정보
            let card = indexArrKey(rewardList,"cardid",parseInt(cardid));
            //카드 이미지
            $("#card_preview").src = INVENURL + card.cardid + ".jpg";
            $("#card_preview").classList.remove("hidden");
            //카드 이름
            $("#preview_card_name").innerHTML = card.name;
            //카드 텍스트
            if (card.text) $("#preview_card_text").innerHTML = card.text;
                else $("#preview_card_text").innerHTML = "";
            //카드 공격력
            if (card.attack) $("#preview_card_attack").innerHTML = card.attack;
                else $("#preview_card_attack").innerHTML = "";
            //카드 체력
            if (card.health) $("#preview_card_health").innerHTML = card.health;
                else $("#preview_card_health").innerHTML = "";
            //카드 타입
            switch(card.type) {
                case "하수인":
                    $("#preview_card_bottom").classList.remove("spell");
                    $("#preview_card_health").classList.remove("armor");
                    if (card.race) $("#preview_card_type").innerHTML = card.race;
                        else $("#preview_card_type").innerHTML = "하수인";
                    break;
                case "주문":
                    $("#preview_card_bottom").classList.add("spell");
                    $("#preview_card_health").classList.remove("armor");
                    $("#preview_card_type").innerHTML = "주문";
                    break;
                case "무기":
                    $("#preview_card_bottom").classList.remove("spell");
                    $("#preview_card_health").classList.add("armor");
                    $("#preview_card_type").innerHTML = "무기";
                    break;
                case "영웅 교체":
                    $("#preview_card_bottom").classList.remove("spell");
                    $("#preview_card_health").classList.add("armor");
                    $("#preview_card_type").innerHTML = "영웅 교체";
                    break;
            }

            break;
        case "hide":
            $("#card_preview").classList.add("hidden");
            $("#card_preview").src = "";
            break;
    }
}

//카드 집어넣기
function card_input(param) {
    //직업명: 기본덱 구축
    if (Object.keys(CLASSINFO).indexOf(param) >= 0) {
        //기본덱 모조리 덱에 넣기
        let arr = bundle[selectedClass].기본;
        arr.forEach(function(card) {
            info.deck.push(card);
        });
    //string: 카드 id로 집어넣기
    } else if (typeof(param) === "string") {
        //해당 아이디만 덱에 넣기
        info.deck.push(param);
    //array: arr 전체 id를 집어넣기
    } else  {
        param.forEach(function(x) {
            info.deck.push(x);
        })
    }
    //덱 반영
    deck_show();
    //쿠엘델라 체크
    let queldelar = [
        indexArrKey(rewardList,"name","쿠엘델라의 칼날").id,
        indexArrKey(rewardList,"name","쿠엘델라의 손자루").id,
        indexArrKey(rewardList,"name","쿠엘델라").id
    ];
    if (info.deck.indexOf(queldelar[0]) >= 0 && info.deck.indexOf(queldelar[1]) >= 0) {
        //쿠엘델라 칼날, 손잡이 제거
        card_remove(queldelar[0]);
        card_remove(queldelar[1]);
        //쿠엘델라 추가
        card_input(queldelar[2]);
        //쿠엘델라 팝업
        swal({
            imageUrl:INVENURL + "47044.jpg",
            imageWidth:180,
            imageHeight:260,
            title:"쿠엘델라 완성!",
            confirmButtonText: '확인'
        }).then(function() {
            //스크롤 고정
            $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
        })
    }
}

//카드 제거하기
function card_remove(id) {
    let index = info.deck.indexOf(id);
    if (index >= 0)
        info.deck.splice(index,1);
}

//카드 번들에서 카드 3장 뽑기
function card_bundling(theme) {
    let arr = [], arr2 = [];//공용 배열
    //특정 테마는 별도로 처리
    switch (theme) {
        case "크툰의 교단":
            let cthun = indexArrKey(rewardList,"name","크툰").id;//크툰 ID
            //크툰이 없으면 [0번]은 반드시 크툰
            if (info.deck.indexOf(cthun) < 0) {
                arr[0] = cthun;
                arr[1] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
                arr[2] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
                /*
                //일단 번들에서 3장 추려냄
                arr = shuffle(deepCopy(bundle[selectedClass][theme]));
                //크툰을 [0번]으로 옮기기
                for (let i = 0;i < arr.length;i++) {
                    if (arr[i] === cthun) {
                        let temp = arr[i];
                        arr[i] = arr[0];
                        arr[0] = temp;
                        break;
                    }
                }
                //중복 확률 체크
                let same = DUPLICATE.str[rand(DUPLICATE.num)];
                switch (same) {
                    case "미중복"://그대로 시행
                        break;
                    case "2중복":
                        //0 두개, 1 한개 카드 생성
                        if (Math.random() <= (1/arr.length)) {
                            //case 1: 크툰 2장
                            arr[2] = arr[1];
                            arr[1] = arr[0];
                        } else {
                            //case 2: 다른 카드가 2장
                            arr[2] = arr[1];
                        }
                        break
                    case "3중복":
                        //0 세개 생성 = 크툰 3장
                        arr[1] = arr[2] = arr[0];
                        break
                }
                */
            //크툰이 없으면 3장 무작위 선택
            } else {
                arr[0] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
                arr[1] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
                arr[2] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
                /*
                arr = shuffle(deepCopy(bundle[selectedClass][theme]));
                //중복 확률 체크
                let same = DUPLICATE.str[rand(DUPLICATE.num)];
                switch (same) {
                    case "미중복":
                        break;
                    case "2중복":
                        //0 두개, 1 한개 카드 생성
                        arr[2] = arr[1];
                        arr[1] = arr[0];
                        break
                    case "3중복":
                        //0 세개 생성
                        arr[2] = arr[0];
                        arr[1] = arr[0];
                        break
                }
                */
            }

            break;
        //한 장 정도: 해당 직업 모든 카드를 긁어옴
        case "한 장 정도":
            //해당 직업 카드 수집
            let all = [];
            rewardList.forEach(function(reward) {
                if (reward.class.indexOf(selectedClass) >= 0) {
                    all.push(reward.id);
                }
            });
            //'한 장 정도' 카드가 있는지 확인
            let notused = [];
            bundle[selectedClass]["한 장 정도"].forEach(function(card) {
                if (info.deck.indexOf(card) < 0)
                    notused.push(card);
            })
            //하이랜더계 중 없는 카드가 있다면
            if (notused.length > 0) {
                //무작위 하이랜더 선택
                let highlander = shuffle(notused)[0];
                //하이랜더는 0번, 나머지는 1~2번
                arr[0] = highlander;
                arr[1] = shuffle(all)[0];
                arr[2] = shuffle(all)[0];
                /*
                //수집된 '모든' 카드 중 3장 무작위 선택
                arr = shuffle(all);
                //하이랜더 1장이 [0번]으로
                for (let i = 0;i < arr.length;i++) {
                    if (arr[i] === highlander) {
                        let temp = arr[i];
                        arr[i] = arr[0];
                        arr[0] = temp;
                        break;
                    }
                }
                //중복 확률 체크
                let same = DUPLICATE.str[rand(DUPLICATE.num)];
                switch (same) {
                    case "미중복"://그대로 시행
                        break;
                    case "2중복":
                        //0 두개, 1 한개 카드 생성
                        if (Math.random() <= (1/arr.length)) {
                            //case 1: 하이랜더 2장
                            arr[2] = arr[1];
                            arr[1] = arr[0];
                        } else {
                            //case 2: 다른 카드가 2장
                            arr[2] = arr[1];
                        }
                        break
                    case "3중복":
                        //0 세개 생성 = 하이랜더 3장
                        arr[1] = arr[2] = arr[0];
                        break
                }
                */
            //하애린더 구성원 모두가 있다면
            } else {
                //올 카드로 번들 생성
                let same = DUPLICATE.str[rand(DUPLICATE.num)];
                switch (same) {
                    case "미중복":
                        break;
                    case "2중복":
                        //0 두개, 1 한개 카드 생성
                        arr[2] = arr[1];
                        arr[1] = arr[0];
                        break
                    case "3중복":
                        //0 세개 생성
                        arr[2] = arr[0];
                        arr[1] = arr[0];
                        break
                }
            }

            break;
        //그 외 테마: 번들 내에서 카드 3장 무작위 선택
        default:
            arr[0] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
            arr[1] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
            arr[2] = shuffle(deepCopy(bundle[selectedClass][theme]))[0];
            /*
            arr = shuffle(deepCopy(bundle[selectedClass][theme]));
            //중복 확률 체크
            let same = DUPLICATE.str[rand(DUPLICATE.num)];
            switch (same) {
                case "미중복":
                    break;
                case "2중복":
                    //0 두개, 1 한개 카드 생성
                    arr[2] = arr[1];
                    arr[1] = arr[0];
                    break
                case "3중복":
                    //0 세개 생성
                    arr[2] = arr[0];
                    arr[1] = arr[0];
                    break
            }
            */

            break;
    }

    //완성된 arr 0~2번 정렬해서 반출
    return [arr[0], arr[1], arr[2]].sort();
}

//덱 출력
function deck_show() {
    //현제 좌표 기억
    let pos = $("#dungeon_deck").scrollTop;
    //덱 비우기
    $("#dungeon_deck").innerHTML = "";
    //덱 정렬
    info.deck.sort();
    //카드 구성 후 덱에 집어넣기
        //중복 방지용
        let onlyCard = [];
    info.deck.forEach(function(card,i,arr) {
        if (onlyCard.indexOf(card) < 0) {
            onlyCard.push(card);
            let num = 0;
            arr.forEach(function(x) {
                if (x === card) num += 1;
            });
            let elm = card_generate(card,num);
            $("#dungeon_deck").appendChild(elm);
        }
    })
    //보유카드 수량 표시
    $("#deck_quantity").innerHTML = "보유 카드 : " + info.deck.length + "장";

    //기존 좌표로 재이동
    $("#dungeon_deck").scrollTop = pos;
}
//덱 비우기
function deck_clear() {
    //덱 비우기
    $("#dungeon_deck").innerHTML = "";
    //보유카드 수량 지우기
    $("#deck_quantity").innerHTML = "";
}
//============================================================================================
//※ 던전 진행 관련
//============================================================================================
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
            //이전 직업 설정
            if (selectedClass !== "") {
                let options = $$(".swal2-select")[0].options;
                for (let  i = 0;i < options.length;i++) {
                    if (options[i].value === selectedClass) {
                        options.selectedIndex = i;
                        options[i].innerHTML += " (이전 영웅)";
                    }
                }
            }
        }
    }).then(function(choose) {
        //직업 결정
        selectedClass = choose;

        //클리어 한 상태라면 수동 리셋
        if (info.status !== undefined && info.status === "cleared") {
            dungeon_reset(true);
        }
        //직업 이미지 표시
        $("#status_hero").src = INVENURL + CLASSINFO[choose] + ".jpg";
        //진행상태 및 버튼 변경
            //info 준비
            info = deepCopy(INFO);
            //진행상태 변경
            info.status = "running";
            //버튼 변경
            $("#status_button").classList.remove("start");
            $("#status_button").classList.add("end");
            $("#status_button").innerHTML = "훈련 중단";
        //기본덱 구축
        card_input(selectedClass);
        //던전 개방
        dungeon_open(info.stage);
    });
}

//던전 이동
function dungeon_next() {
    //스테이지 증가
    info.stage += 1;
    //다음 던전이 있으면 진행
    if (STAGEINFO[info.stage] !== undefined) {
        dungeon_open(info.stage);
    //없으면 클리어 처리
    } else {
        dungeon_clear();
    }


}

//던전 관리
function dungeon_open(floor) {
    //우두머리 층 구분
    let stagestr = STAGEINFO[floor].split("$");
    //내부 치장하기
    switch(stagestr[0]) {
        case "우두머리":
            dungeon_create("우두머리",parseInt(stagestr[1]));
            break;
        case "지속효과":
            dungeon_create("지속효과");
            break;
        case "보물":
            dungeon_create("보물");
            break;
        case "전리품":
            dungeon_create("전리품");
            break;
    }
    //버튼 활성화
    //해당 위치로 스크롤
    TweenMax.to($("#main_select_frame"),0.5,{scrollTo:{
        y:$("#main_select_" + info.stage.toString()).offsetTop - 5,
        autoKill:false
    }});
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
    let arr = [], arr2 = [];
    //======================
    //★우두머리 출현
    //======================
    if (type === "우두머리") {
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
            "url(./images/dungeon/boss_cover.png),url(" + INVENURL + boss.cardid + ".jpg)";
        let elm_boss_desc = document.createElement("div.boss_desc");
            elm_boss_desc.innerHTML = boss.desc;
        let elm_boss_power = document.createElement("div.boss_power");
            elm_boss_power.innerHTML = boss.power;
        let elm_boss_clear = document.createElement("button.boss_clear.clickable");
            elm_boss_clear.innerHTML = "무찌르기";
        let elm_boss_hint = document.createElement("button.boss_hint.clickable");
            elm_boss_hint.innerHTML = "정보 공유";
        let elm_boss_name = document.createElement("div.boss_name");
            elm_boss_name.innerHTML = boss.name;
        let elm_boss_health = document.createElement("div.boss_health");
            elm_boss_health.innerHTML = boss.health;

        elm_boss.appendChild(elm_boss_img);
        elm_boss.appendChild(elm_boss_desc);
        elm_boss.appendChild(elm_boss_power);
        elm_boss.appendChild(elm_boss_clear);
        elm_boss.appendChild(elm_boss_hint);
        elm_boss.appendChild(elm_boss_name);
        elm_boss.appendChild(elm_boss_health);

        //버튼 설정
        elm_boss_clear.onclick = function() {
            //클릭 해제
            elm_boss_clear.onclick = "";
            //버튼 변경
            elm_boss_clear.innerHTML = "무찔렀음";
            //특수 보상 있으면 획득
            if (boss.reward !== undefined) {
                switch(boss.reward) {
                    //1. 옳챙이의 낚싯대
                    case "옳챙이의 낚싯대":
                        //낚싯대 획득
                        let card = indexArrKey(rewardList,"name","옳챙이의 낚싯대");
                        card_input(card.id);
                        //획득 팝업
                        swal({
                            imageUrl:INVENURL + card.cardid + ".jpg",
                            imageWidth:180,
                            imageHeight:260,
                            title:"옳챙이의 낚싯대 획득!",
                            confirmButtonText: '확인'
                        }).then(function() {
                            //스크롤 고정
                            $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
                        })
                        break;
                    //2. 보물창고
                    case "보물창고":
                        //무작위 보물 3장 획득
                        let arr = [];
                        for (let i = 0;i < 3;i++) {
                            arr[i] = indexArrKey(rewardList,"id",shuffle(deepCopy(bundle.보물))[0]);
                        }
                        swal({
                            imageUrl:INVENURL + arr[0].cardid + ".jpg",
                            imageWidth:180,
                            imageHeight:260,
                            title:arr[0].name + " 획득!",
                            confirmButtonText: '확인'
                        }).then(function() {
                            //스크롤 고정
                            $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
                            card_input(arr[0].id);
                            swal({
                                imageUrl:INVENURL + arr[1].cardid + ".jpg",
                                imageWidth:180,
                                imageHeight:260,
                                title:arr[1].name + " 획득!",
                                confirmButtonText: '확인'
                            }).then(function() {
                                //스크롤 고정
                                $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
                                card_input(arr[1].id);
                                swal({
                                    imageUrl:INVENURL + arr[2].cardid + ".jpg",
                                    imageWidth:180,
                                    imageHeight:260,
                                    title:arr[2].name + " 획득!",
                                    confirmButtonText: '확인'
                                }).then(function() {
                                    //스크롤 고정
                                    $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
                                    card_input(arr[2].id);
                                })
                            })
                        })
                        break;
                }
            }
            //던전 폐쇄
            stage.classList.remove("opened");
            stage.classList.add("finished");
            //다음 던전
            dungeon_next();
        }
        elm_boss_hint.onclick = function() {
            window.open("http://hs.inven.co.kr/dataninfo/card/detail.php?code=" + boss.cardid);
        }
        //치장 완료
        stage.appendChild(elm_boss);
    //======================
    //★지속효과 or 보물 출현
    //======================
    } else if (type === "지속효과" || type === "보물") {
        //지속효과 가져와서 셔플
        arr = shuffle(deepCopy(bundle[type]));
        //arr 0~2번 = 지쇽효과
        for (let i = 0;i < 3;i++) {
            //카드정보 불러오기
            let card = indexArrKey(rewardList,"id",arr[i]);
            //지속효과 요소 생성
            let stage = $("#main_select_" + info.stage.toString());

            let elm_treasure = document.createElement("div.select_treasure");
            let elm_treasure_img = document.createElement("img.treasure_img.selectable");
                elm_treasure_img.src = INVENURL + card.cardid + ".jpg";
                elm_treasure_img.art = card.name;
                elm_treasure_img.onmouseover = function() {
                    card_preview("show",card.cardid);
                }
                elm_treasure_img.onclick = function() {
                    card_preview("show",card.cardid);
                }
                elm_treasure_img.onmouseout = function() {
                    card_preview("hide");
                }
            let elm_treasure_take = document.createElement("button.select_take.clickable");
                elm_treasure_take.classList.add(".stage" + info.stage);
                elm_treasure_take.innerHTML = "선택하기";

            elm_treasure.appendChild(elm_treasure_img);
            elm_treasure.appendChild(elm_treasure_take);

            //토그 출현 해설(있으면)
            if (card.tog_before !== undefined) speak(card.tog_before);
            //버튼 설정
            elm_treasure_take.onclick = function() {
                //클릭 해제
                elm_treasure_take.onclick = "";
                //이 버튼만 남겨두기
                elm_treasure_take.classList.add("selected");
                elm_treasure_take.innerHTML = "선택했음";
                //보물 획득
                card_input(card.id);
                //토그 획득후 해설(있으면)
                if (card.tog_after !== undefined) speak(card.tog_after);
                //던전 폐쇄
                stage.classList.remove("opened");
                stage.classList.add("finished");
                //다음 던전
                dungeon_next();
            }
            //생성한 요소 집어넣기
            stage.appendChild(elm_treasure);
        }
    //======================
    //★전리품 출현
    //======================
    } else if (type === "전리품") {
        //번들 3개 선택(0~3)
        arr = deepCopy(Object.keys(bundle[selectedClass]));
            //기본 덱은 빼고
            let index = arr.indexOf("기본");
            if (index >= 0)
                arr.splice(index,1);
        arr = shuffle(arr);
        //번들에서 카드 3장 선택
        for (let i = 0;i < 3;i++) {
            let theme = arr[i];
            //카드 요소 넣을 배열
            let elmArr = [];
            let arrSort = card_bundling(theme);
            //0~3 하나씩 카드 생성
            elmArr[0] = card_generate(arrSort[0],1);
            elmArr[1] = card_generate(arrSort[1],1);
            elmArr[2] = card_generate(arrSort[2],1);

            //전리품 요소 생성
            let stage = $("#main_select_" + info.stage.toString());
            let elm_loot = document.createElement("div.select_loot");
                //전리품 카드
                elmArr.forEach(function(elm,i) {
                    //마우스 올리면 설명
                    elm.onmouseover = function() {
                        card_preview("show",indexArrKey(rewardList,"id",arrSort[i]).cardid);
                    }
                    elm.onclick = function() {
                        card_preview("show",indexArrKey(rewardList,"id",arrSort[i]).cardid);
                    }
                    elm.onmouseout = function() {
                        card_preview("hide");
                    }
                    //카드 집어넣기
                    elm_loot.appendChild(elm);
                })
            let elm_loot_name = document.createElement("div.loot_name");
                elm_loot_name.innerHTML = theme;
            let elm_loot_take = document.createElement("button.select_take.clickable");
                elm_loot_take.innerHTML = "선택하기"
                //버튼 설정
                elm_loot_take.onclick = function() {
                    //이 버튼만 남겨두기
                    elm_loot_take.classList.add("selected");
                    elm_loot_take.innerHTML = "선택했음";
                    //보물 획득
                    card_input([arrSort[0],arrSort[1],arrSort[2]]);
                    //던전 폐쇄
                    stage.classList.remove("opened");
                    stage.classList.add("finished");
                    //다음 던전
                    dungeon_next();
                }
            elm_loot.appendChild(elm_loot_name);
            elm_loot.appendChild(elm_loot_take);

            //생성한 요소 집어넣기
            stage.appendChild(elm_loot);
        }
    }
}

function dungeon_reset(cmd) {
    //모든 층 닫기
    $$(".main_select").forEach(function(target) {
        target.classList.remove("finished","end","opened");
        target.classList.add("closed");
    })
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

    //1층으로 복귀(초기화 한정)
    if (cmd === false)
        TweenMax.to($("#main_select_frame"),0.5,{scrollTo:{y:0,autoKill:false}});

    //변수 초기화
    info = {};
    //클래스 이미지 내리기
    $("#status_hero").src = "";
    //덱 비우기
    deck_clear();
    //버튼 초기화
    $("#status_button").classList.remove("end");
    $("#status_button").classList.add("start");
    $("#status_button").innerHTML = "모험 시작";

    //토그 반응(실패라면)
    if (cmd === false)
        speak("failure");
}

//미궁 완료
function dungeon_clear() {
    //모든 층 완료 표기
    $$(".main_select").forEach(function(elm) {
        elm.classList.remove("opened","finished");
        elm.classList.add("end");
    })

    //진행 상태 변경
    info.status = "cleared";

    //버튼 초기화
    $("#status_button").classList.remove("end");
    $("#status_button").classList.add("start");
    $("#status_button").innerHTML = "모험 시작";

    //소소한 업적
        let num = 0;
        //크툰 3마리
        let cthun = indexArrKey(rewardList,"name","크툰").id;//크툰 ID
        num = 0;
        info.deck.forEach(function(x) {
            if (x === cthun) num += 1;
        })
        if (num >= 3) {
            swal({
                imageUrl:INVENURL + "38857.jpg",
                imageWidth:180,
                imageHeight:260,
                title:"업적: 크툰께서 날 보셨어!",
                text:"크툰 3장 확보하기",
                confirmButtonText: '확인'
            }).then(function() {
                //스크롤 고정
                $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
            })
        }
        //아이야 6마리
        let aya = indexArrKey(rewardList,"name","아이야 블랙포우").id;//아이야 ID
        num = 0;
        info.deck.forEach(function(x) {
            if (x === aya) num += 1;
        })
        if (num >= 6) {
            swal({
                imageUrl:INVENURL + "40596.jpg",
                imageWidth:180,
                imageHeight:260,
                title:"업적: 아이야 패거리",
                text:"아이야 6장 확보하기",
                confirmButtonText: '확인'
            }).then(function() {
                //스크롤 고정
                $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
            })
        }
        //완전한 하이랜더
        let highlander = [];
        info.deck.forEach(function(x) {
            if (highlander.indexOf(x) < 0) highlander.push(x);
        })
        if (highlander.length === info.deck.length) {
            swal({
                imageUrl:INVENURL + "40408.jpg",
                imageWidth:180,
                imageHeight:260,
                title:"업적: 비밀 결사의 종복",
                text:"미궁 덱에 중복 카드 하나도 없이 훈련 완료하기",
                confirmButtonText: '확인'
            }).then(function() {
                //스크롤 고정
                $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
            })
        }
        //낚싯대 획득
        let pole = indexArrKey(rewardList,"name","옳챙이의 낚싯대").id;
        if (info.deck.indexOf(pole) >= 0) {
            swal({
                imageUrl:INVENURL + "46251.jpg",
                imageWidth:180,
                imageHeight:260,
                title:"업적: 흔치 않은 낚싯대",
                text:"옳챙이의 낚싯대 확보하기",
                confirmButtonText: '확인'
            }).then(function() {
                //스크롤 고정
                $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
            })
        }
        //쿠엘델라 획득
        let queldelar = indexArrKey(rewardList,"name","쿠엘델라").id;
        if (info.deck.indexOf(queldelar) >= 0) {
            swal({
                imageUrl:INVENURL + "47044.jpg",
                imageWidth:180,
                imageHeight:260,
                title:"업적: 전설의 검",
                text:"쿠엘델라 확보하기",
                confirmButtonText: '확인'
            }).then(function() {
                //스크롤 고정
                $("#main_select_frame").scrollTop = $("#main_select_" + info.stage.toString()).offsetTop - 5;
            })
        }
    //토그 축사
    speak("success");
}

//=============================================================================================
//
//
window.onload = function() {
    //IE 경고
    (function() {
        let agent = navigator.userAgent.toLowerCase();
        if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
            alert("※ 인터넷 익스플로러에서는 일부 기능이 제대로 작동하지 않습니다." +
            "\n크롬, 파이어폭스 등 다른 브라우저를 이용하길 추천합니다.");
        }
    })()

    //(사전) 카드 테마 구축
    card_arrange();

    //토그왜글 환영사
    $("#tog").style.transform = "scale(1)";
    speak("init");

    //안내 문구
    swal({
        imageUrl:"./images/dungeon/wallpaper.jpg",
        imageWidth:300,
        imageHeight:260,
        confirmButtonText: '예',
        title:"미궁 탐험 훈련소 안내문",
        html:"'미궁 탐험 훈련소'는 실제 미궁 탐험과 다를 수 있지 너무 신뢰하지 말고 재미로만 이용해주세요.<br><br>"+
            "내부에서 사용된 대부분의 이미지는 인벤 카드 이미지입니다. 해당 컨텐츠를 절대로 상업적으로 이용하지 않겠습니다."
    })

    //탐험 시작 버튼
    $("#status_button").onclick = function() {
        //현 상태 : 준비중 or 클리어 완료
        if (!info.status || info.status === "cleared") {
            //직업 선택
            select_class();
        //현 상태 : 진행 중
        } else {
            //경고창
            swal({
                type:"warning",
                title:"정말로 훈련을 중단하시겠습니까?",
                showCancelButton: true,
                confirmButtonText: '예',
                cancelButtonText: '아니오',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6'
            }).then(function(result) {
                if (result === true) {
                    dungeon_reset(false);
                }
            })
            //(승인 시)리셋 - 포기
        }
    }
}
