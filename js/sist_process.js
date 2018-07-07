
//===========================================================
//※ 변수 설정
//===========================================================
let process = {};//임시 정보
let session = {
    db:undefined,//카드 DB (sort 후 순서에 따라 ssi 부여, ssi로 카드 검색)
    master:undefined,//마스터 노드
    fragment:undefined//프래그먼트
};
const TILEURL = "https://art.hearthstonejson.com/v1/tiles/";
const IMAGEURL = "https://art.hearthstonejson.com/v1/256x/";
//클러스터
let clusterize = {};
//카드정보 열람 auto
let autoinfo;

//===========================================================
//※ 함수 - 창 설정
//===========================================================
//모든 창 & 명칭 닫기
function window_clear() {
    $$(".mainscreen").forEach(function(target) {
        target.classList.remove("show");
    })
    $$(".footer_desc").forEach(function(target) {
        target.style.display = "none";
    })
}

//개별 창 설정
function window_shift(keyword, keyword2) {
    switch(keyword) {
        //*메인 창
        case "titlescreen":
            //공용 함수
            function open() {
                //진행상태 기억
                process.state = "titlescreen";
                //창 전환
                window_clear();
                $("#main_titlescreen").classList.add("show");
                $("#header_bottom").classList.remove("show");
                $("#footer_bottom").classList.remove("show");
                //명칭 출력
                $("#footer_notice").style.display = "block";

                //시작 버튼
                $("#start_card").onclick = function() {
                    alert("향후 지원 예정입니다.");
                }
                $("#start_deck").onclick = function() {
                    window_shift("decksetting");
                }
            }

            //진행정보 초기화 의사 물어보기
            if (process.state && process.state !== "titlescreen") {
                swal({
                    type:"warning",
                    title:"첫 화면으로 돌아가시겠습니까?",
                    text:"진행된 정보는 모두 초기화됩니다.",
                    showCancelButton:true,
                    confirmButtonText: '확인',
                    cancelButtonText: '취소',
                    cancelButtonColor: '#d33'
                }).then(function(isConfirm){
                    if (isConfirm) {
                        //진행정보 초기화
                        process = {};
                        //화면 전환
                        open();
                    } else {
                        //취소
                        return;
                    }
                })
            } else {
                //화면 전환
                open();
            }

            break;

        //*덱 설정
        case "decksetting":
            //진행상태 기억
            process.state = "decksetting";
            //창 전환
            window_clear();
            $("#main_decksetting").classList.add("show");
            //기존 선택 초기화
            $$(".decksetting_button").forEach(function(x) {
                x.classList.remove("selected");
            })

            //창 기능
            $$(".decksetting_button").forEach(function(target) {
                target.onclick = function() {
                    if (target.dataset.class) {
                        //직업 세팅
                        if (!process.deck) process.deck = {};
                        process.deck.class = target.dataset.class;
                        //버튼 세팅
                        $$(".decksetting_button.class").forEach(function(x) {
                            x.classList.remove("selected");
                        })
                        target.classList.add("selected");
                    } else if (target.dataset.format) {
                        //대전 방식 세팅
                        if (!process.deck) process.deck = {};
                        process.deck.format = target.dataset.format;
                        //버튼 세팅
                        $$(".decksetting_button.format").forEach(function(x) {
                            x.classList.remove("selected");
                        })
                        target.classList.add("selected");
                    }
                }
            })
            $("#decksetting_done").onclick = function() {
                if (!process.deck.class) {
                    alert("직업을 설정해주세요.");
                } else if (!process.deck.format) {
                    alert("대전 방식을 설정해주세요.");
                } else {
                    window_shift("loading","deckbuilding");
                }
            }

            break;

        //카드정보 불러오기
        case "loading":
            //카드 정보가 없으면 불러올지 확인
            if (!session.db) {
                //의사 물어보기
                swal({
                    type:"warning",
                    title:"데이터 경고",
                    text:"카드정보를 불러오는 데 약 1MB의 데이터가 소모됩니다.",
                    showCancelButton:true,
                    confirmButtonText: '불러오기',
                    cancelButtonText: '취소',
                    cancelButtonColor: '#d33'
                }).then(function(isConfirm){
                    if (!isConfirm) {
                        //거부 시 불러오기 취소
                        return false;
                    } else {
                        loading_pre();
                    }
                })
            } else {
                loading_pre();
            }

            //불러오기 세팅
            function loading_pre() {
                //진행상태 기억
                process.state = "loading";
                //화면 전환
                window_clear();
                $("#main_loading").classList.add("show");

                setTimeout(function() {
                    if (!session.db) loading_DB();
                        else loading_fragment();
                },1);
            }
            //DB 세팅
            function loading_DB() {
            //카드정보 로딩 개시
                try {
                    fetch("./js/cards_collectible.json")
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(myJson) {
                        //카드정보 입력
                        session.db = myJson;
                        //카드정보 정렬
                        sort_arr(session.db);
                        //카드정보 정제
                        session.db.forEach(function(x, index) {
                            x.dbfid = x.dbfId.toString();//dbfId대문자 제거 및 문자열로 변환
                            x.ssi = index.toString();//index 정보 추가
                        })

                        //Master Node 작성
                        loading_master();
                    });
                } catch(e) {
                    swal({
                        type:"error",
                        title:"카드정보 불러오기 실패",
                        text:"첫 화면으로 돌아갑니다."
                    }).then(function() {
                        window_shift("titlescreen");
                    })
                }
            }
            //Master Node 작성
            function loading_master() {
                if (!session.master) session.master = card_generateMaster();

                loading_fragment();
            }
            //Fragment 작성 : 직업, 포맷에 따라 Fragment (없는 거) 생성
            function loading_fragment() {
                //fragment가 없으면 생성
                if (!session.fragment) session.fragment = [];
                //필요한 카드 정보 생성, Fragment에 부착
                session.db.forEach(function(info, index) {
                    if (!session.fragment[index]) {
                        if (keyword2 === "cardinfo" ||//카드 정보: 모든 카드 요소 생성
                        (info.cardClass === "NEUTRAL" || info.cardClass === process.deck.class) &&//직업 & 중립
                        (info.rarity !== "FREE" || info.type !== "HERO") &&//기본 영웅 제외
                        (info.rarity !== "HERO_SKIN" || info.type !== "HERO") &&//스킨 영웅 제외
                        (DATA.SET_FORMAT[info.set] === "정규" || DATA.SET_FORMAT[info.set] === process.deck.format)) {//포맷(정규는 무조건 포함)
                            //카드 정보 생성
                            session.fragment[index] = card_generateFragment(info);
                        }
                    }
                })

                //화면 전환
                window_shift("deckbuilding");
            }

            break;

        //*덱 제작
        case "deckbuilding":
            //상태 기억
            process.state = "deckbuilding";
            //==================
            //※ 화면 구성
            //==================
            //화면 출력
            window_clear();
            $("#main_collection").classList.add("show");
            $("#main_deck").classList.add("show");
            $("#footer_name_left").style.display = "block";
                $("#footer_name_left").innerHTML = "카드 목록";
            $("#footer_name_right").style.display = "block";
                $("#footer_name_right").innerHTML = "덱 구성";
            $("#header_bottom").classList.add("show");
            $("#footer_bottom").classList.add("show");

            //==================
            //※ 덱 & 필터 구성
            //==================
            //검색 초기치 설정, 필터 활성화
            card_setFilter("init");//필터 활성화

            //검색 초기치에 따라 검색결과 출력(최초 검색)
            card_search();

            //덱 초기화
            deck_refresh("init");

            //==================
            //※ 상호작용
            //==================
            //카드 추가 상호작용
            $("#collection_list_content").onclick = function(e) {
                e = e || event;
                let target = e.target || e.srcElement;
                if (target.classList.contains("card")) {
                    card_move("add " + target.dataset.ssi, true);
                }
            }
            //카드 제거 상호작용
            $("#deck_list_content").onclick = function(e) {
                e = e || event;
                let target = e.target || e.srcElement;
                if (target.classList.contains("card")) {
                    card_move("remove " + target.dataset.ssi, true);
                }
            }
            //덱코드 입력
            $("#bottom_input").onclick = function() {
                //팝업창 열기
                swal({
                    title: '덱코드를 입력해주세요',
                    input: 'text',
                    text: '덱코드를 분석하여 카드를 불러옵니다.',
                    inputPlaceholder: '입력란',
                    showCancelButton:true,
                    confirmButtonText: '적용',
                    cancelButtonText: '취소',
                    cancelButtonColor: '#d33',
                    inputValidator: function(deckcode) {
                        return new Promise(function(resolve, reject) {
                            try {
                                resolve(deckstrings.decode(deckcode));
                            } catch(e) {
                                reject("올바르지 않은 덱코드입니다.");
                            }
                        })
                    }
                }).then(function(result) {
                    if (result) {
                        //덱코드 해석
                        let obj = deckstrings.decode(deckcode);
                        console.log(obj);
                    }
                })
            }

            break;

        //*카드 검색
        case "cardinfo":
            break;
    }
}


//===========================================================
//※ 함수
//===========================================================
//카드 마스터 노드 생성
function card_generateMaster() {
    //요소 생성
    let elm_card = document.createElement("div.card.selectable");
        elm_card.classList.add("card_$index");//$index: 카드 인덱스 스트링
        elm_card.dataset.ssi = "$index";//$index
        elm_card.classList.add("flash_hidden");//flash 대상은 이 클래스 제거
        elm_card.style.backgroundImage = "url(" + TILEURL + "$id.jpg)";//$id: 카드 ID
    let elm_card_cost = document.createElement("div.card_cost");
        elm_card_cost.classList.add("rarity_$rarity");//$rarity: 카드 희귀도
        elm_card_cost.innerHTML = "$cost";//$cost: 카드 비용
    let elm_card_name = document.createElement("div.card_name");
        let elm_card_name_text = document.createElement("p");
            elm_card_name_text.innerHTML = "$name";//$name: 카드 이름
        elm_card_name.appendChild(elm_card_name_text);
    let elm_card_quantity = document.createElement("div.card_quantity");
        elm_card_quantity.innerHTML = "$quantity";//$quantity: 카드 수량
        elm_card_quantity.classList.add("quantity_hidden");//$hidden: 수량 표기여부
    //요소 합치기
    elm_card.appendChild(elm_card_cost);
    elm_card.appendChild(elm_card_name);
    elm_card.appendChild(elm_card_quantity);
    //출력
    return elm_card.outerHTML;
}
//카드 개별 정보 생성
function card_generateFragment(info) {
    //마스터 노드 복사
    let fragment = session.master;
    //필요한 정보 설정(수량 제외)
    fragment = fragment.replaceAll("$index",info.ssi);//인덱스 설정
    fragment = fragment.replace("$id",info.id);//ID 설정
    fragment = fragment.replace("$cost",info.cost);//비용 설정
    fragment = fragment.replace("$name",info.name);//이름 설정
    fragment = fragment.replace("$rarity",info.rarity);//등급 설정
    //반환
    return fragment;
}


//카드 수량 찾기(by index)
function card_getQuantity(index) {
    //덱에 카드 정보가 없으면 0 출력
    if (!process.deck || !process.deck.cards) return 0;
    else {
        //카드 정보를 찾으면 quantity 출력
        for (let i = 0;i < process.deck.cards.length;i++) {
            if (process.deck.cards[i].ssi === index)
                return process.deck.cards[i].quantity;
        }
        //못찾았으면 0 출력
        return 0;
    }
}

//카드 정렬 - 배열(비용, 이름 순)
function sort_arr(arr) {
    arr.sort(function(x,y) {
        if (x.cost > y.cost) {
            return 1;
        } else if (x.cost < y.cost) {
            return -1;
        } else {
            let order = [x.name,y.name];
            let order2 = [x.name,y.name];
            order.sort();
            if (order[0] === order2[0]) {
                return -1;
            } else {
                return 1;
            }
        };
    })

    return arr;
}

//키워드 검색 가능하도록 정리
function searchable(keyword) {
    let text = keyword;
    //분류 한글화
    Object.keys(DATA.TYPE_KR).forEach(function(x) {
        text = text.replaceAll(x,DATA.TYPE_KR[x]);
    })
    //종족명 한글화
    Object.keys(DATA.RACE_KR).forEach(function(x) {
        text = text.replaceAll(x,DATA.RACE_KR[x]);
    })
    //불필요 기호 제거
    //text = text.replace(/\s|<b>|<\/b>|\n|\[x\]|\$|#|<i>|<\/i>|@|\.|,|(|)|:/g,"");
    let unseable = [" ", "<b>", "</b>", "\n", "[x]", "$", "#", "<i>", "</i>", "@", ".", ",", "/", "(", ")", ":"];
    unseable.forEach(function(x) {
        text = text.replaceAll(x,"");
    })
    //반환
    return text;
}

//카드 마나 맞춰보기
function card_matchMana(target, mana) {
    switch (mana) {
        case "all"://전체: 무조건 통과
            return true;
            break;
            case "0"://마나 = 0
            case "1"://마나 = 1
            case "2"://마나 = 2
            case "3"://마나 = 3
            case "4"://마나 = 4
            case "5"://마나 = 5
            case "6"://마나 = 6
            if (target.cost === parseInt(mana)) return true;
            break;
        case "7"://마나 = 7 이상
            if (target.cost > 7) return true;
            break;
        case "odd"://홀수
            if (target.cost % 2 === 1) return true;
            break;
        case "even"://짝수
            if (target.cost % 2 === 0) return true;
            break;
        default://오류 방지 - 통과
            return true;
            break;
    }

    //통과 못하면 제외
    return false;
}

//카드 키워드 맞춰보기
function card_matchKeyword(target, keyword) {
    //필터가 비었으면 통과
    if (!keyword || keyword === "") return true;
    //필터 분류(공백)
    let list = ["name","text","race","type"];
    for (let i = 0;i<list.length;i++) {
        if (target[list[i]] !== undefined) {
            let temptext = searchable(target[list[i]]);
                keyword = searchable(keyword);
            if (temptext.indexOf(keyword) >= 0) {
                return true;
            }
        }
    }
    //true가 나오지 않으면 false
    return false;
}

//카드 필터 구성
function card_setFilter(cmd) {
    //초기 작업: 검색치 초기화
    if (cmd === "init") {
        //검색 초기치 설정, 필터 활성화
        if (!process.search) process.search = {};
        process.search.class = process.deck.class;//직업
        process.search.mana = "all";//마나
        process.search.rarity = "all";//등급
        process.search.set = "all";//세트
        process.search.keyword = "";//키워드
    }

    //직업
    function filter_class(text) {
        //초기"글자" 설정
        if (text === "init") {
            //검색버튼 키워드 변경
            $("#search_class").innerHTML = DATA.CLASS_KR[process.search.class];
        //버튼 클릭
        } else {
            //카드 정보
            if (process.state === "cardinfo") {
                /*향후 추가 - 선택지*/
            //덱 만들기
            } else if (process.state === "deckbuilding") {
                //검색 직업 변경
                process.search.class = (process.search.class === "NEUTRAL" ? process.deck.class : "NEUTRAL")
                //검색버튼 키워드 변경
                $("#search_class").innerHTML = DATA.CLASS_KR[process.search.class];
                //재검색
                card_search();
            }

        }
    }
        //직업 필터 작동
        filter_class("init");
        //직업 필터 상호작용
        $("#search_class").onclick = function() {
            filter_class();
        }

    //마나
    function filter_mana(text) {
        //초기"글자" 설정
        if (text === "init") {
            //"전체" 키워드
            let text = "마나 : 전체";
            $("#search_mana").innerHTML = text;
            $("#mobilefilter_mana").innerHTML = text;
        } else {
            //팝업창 열기
            swal({
                title: '카드 마나 검색',
                html:
                  '<button id="popup_mana_all" class="popup_button full" data-mana="전체">전체</button>' +
                  '<button id="popup_mana_0" class="popup_button" data-mana="0"><span style="color:blue;font-size:20px;">&#11042;</span> 0</button>' +
                  '<button id="popup_mana_1" class="popup_button" data-mana="1"><span style="color:blue;font-size:20px;">&#11042;</span> 1</button>' +
                  '<button id="popup_mana_2" class="popup_button" data-mana="2"><span style="color:blue;font-size:20px;">&#11042;</span> 2</button>' +
                  '<button id="popup_mana_3" class="popup_button" data-mana="3"><span style="color:blue;font-size:20px;">&#11042;</span> 3</button>' +
                  '<button id="popup_mana_4" class="popup_button" data-mana="4"><span style="color:blue;font-size:20px;">&#11042;</span> 4</button>' +
                  '<button id="popup_mana_5" class="popup_button" data-mana="5"><span style="color:blue;font-size:20px;">&#11042;</span> 5</button>' +
                  '<button id="popup_mana_6" class="popup_button" data-mana="6"><span style="color:blue;font-size:20px;">&#11042;</span> 6</button>' +
                  '<button id="popup_mana_7" class="popup_button" data-mana="7"><span style="color:blue;font-size:20px;">&#11042;</span> 7+</button>' +
                  '<button id="popup_mana_odd" class="popup_button" data-mana="홀수">홀수</button>' +
                  '<button id="popup_mana_even" class="popup_button" data-mana="짝수">짝수</button>',
                onOpen:function() {
                    //현재 마나 검색필터 보여주기
                    $("#popup_mana_" + process.search.mana).classList.add("selected");
                    //버튼 상호작용
                    $$(".popup_button").forEach(function(x) {
                        x.onclick = function() {
                            //마나 필터 변경
                            process.search.mana = x.id.replace("popup_mana_","");
                            //키워드 변경
                            let text = "마나 : " + x.dataset.mana;
                            $("#search_mana").innerHTML = text;
                            $("#mobilefilter_mana").innerHTML = text;
                            //창 닫기
                            swal.close();
                            //검색 개시
                            card_search();
                        }
                    })
                },
                showConfirmButton:false,
                showCancelButton:true,
                cancelButtonText: '취소',
                cancelButtonColor: '#d33'
            })
        }
    }
        //직업 필터 작동
        filter_mana("init");
        //직업 필터 상호작용
        $("#search_mana").onclick = filter_mana;
        $("#mobilefilter_mana").onclick = filter_mana;

    //등급
    function filter_rarity(text) {
        //초기"글자" 설정
        if (text === "init") {
            //"전체" 키워드
            let text = "등급 : 전체";
            $("#search_rarity").innerHTML = text;
            $("#mobilefilter_rarity").innerHTML = text;
        } else {
            //팝업창 열기
            swal({
                title: '카드 등급 검색',
                html:
                  '<button id="popup_rarity_all" class="popup_button full" data-rarity="전체">전체</button>' +
                  '<button id="popup_rarity_FREE" class="popup_button full" data-rarity="기본"><span class="COMMON">&#11042;</span> 기본 카드</button>' +
                  '<button id="popup_rarity_COMMON" class="popup_button full" data-rarity="일반"><span class="FREE">&#11042;</span> 일반 카드</button>' +
                  '<button id="popup_rarity_RARE" class="popup_button full" data-rarity="희귀"><span class="RARE">&#11042;</span> 희귀 카드</button>' +
                  '<button id="popup_rarity_EPIC" class="popup_button full" data-rarity="영웅"><span class="EPIC">&#11042;</span> 영웅 카드</button>' +
                  '<button id="popup_rarity_LEGENDARY" class="popup_button full" data-rarity="전설"><span class="LEGENDARY">&#11042;</span> 전설 카드</button>',
                onOpen:function() {
                    //현재 등급 검색필터 보여주기
                    $("#popup_rarity_" + process.search.rarity).classList.add("selected");
                    //버튼 상호작용
                    $$(".popup_button").forEach(function(x) {
                        x.onclick = function() {
                            //등급 필터 변경
                            process.search.rarity = x.id.replace("popup_rarity_","");
                            //키워드 변경
                            let text = "등급 : " + x.dataset.rarity;
                            $("#search_rarity").innerHTML = text;
                            $("#mobilefilter_rarity").innerHTML = text;
                            //창 닫기
                            swal.close();
                            //검색 개시
                            card_search();
                        }
                    })
                },
                showConfirmButton:false,
                showCancelButton:true,
                cancelButtonText: '취소',
                cancelButtonColor: '#d33'
            })
        }
    }
        //직업 필터 작동
        filter_rarity("init");
        //직업 필터 상호작용
        $("#search_rarity").onclick = filter_rarity;
        $("#mobilefilter_rarity").onclick = filter_rarity;

    //세트
    function filter_set(text) {
        //초기"글자" 설정
        if (text === "init") {
            //"전체" 키워드
            let text = "세트 : 전체";
            $("#search_set").innerHTML = text;
            $("#mobilefilter_set").innerHTML = text;
        } else {
            //정규전: button형, 야생전: select형
            switch (process.deck.format) {
                case "정규":
                    //세트 버튼 구성
                    let text = "";
                    let setarr = Object.keys(DATA.SET_KR);
                    setarr.unshift("all");
                    setarr.forEach(function(x,i) {
                        if (x === "all" ||
                        DATA.SET_FORMAT[x] === "정규" ||
                        process.deck.format === DATA.SET_FORMAT[x]) {
                            let btn = document.createElement("button");
                                btn.id = "popup_set_" + x;
                                btn.classList.add("popup_button","small");
                                btn.dataset.set = (DATA.SET_KR[x]) ? DATA.SET_KR[x] : "전체";
                                btn.innerHTML = (DATA.SET_KR[x]) ? DATA.SET_KR[x] : "전체";
                            text += btn.outerHTML;
                        }
                    });
                    //팝업창 열기
                    swal({
                        title: '카드 세트 검색',
                        html:text,
                        onOpen:function() {
                            //현재 세트 검색필터 보여주기
                            $("#popup_set_" + process.search.set).classList.add("selected");
                            //버튼 상호작용
                            $$(".popup_button").forEach(function(x) {
                                x.onclick = function() {
                                    //세트 필터 변경
                                    process.search.set = x.id.replace("popup_set_","");
                                    //키워드 변경
                                    let text = x.dataset.set;
                                    $("#search_set").innerHTML = text;
                                    $("#mobilefilter_set").innerHTML = text;
                                    //창 닫기
                                    swal.close();
                                    //검색 개시
                                    card_search();
                                }
                            })
                        },
                        showConfirmButton:false,
                        showCancelButton:true,
                        cancelButtonText: '취소',
                        cancelButtonColor: '#d33'
                    })

                    break;

                case "야생":
                //팝업창 열기
                swal({
                    title: '카드 세트 검색',
                    input: 'select',
                    inputOptions: {},
                    onOpen:function() {
                        //선택창 구성
                        let select = $$(".swal2-select")[0];
                        //"모두" 추가
                        select.options[0] = new Option("전체","all");
                        Object.keys(DATA.SET_KR).forEach(function(x,i) {
                            if (DATA.SET_FORMAT[x] === "정규" || process.deck.format === DATA.SET_FORMAT[x])
                                select.options[select.options.length] = new Option(DATA.SET_KR[x],x);
                            //현재 검색필터 세트이면 강조
                            if (x === process.search.set) {
                                select.options[select.options.length-1].selected = true;
                            }
                        });
                        //버튼 상호작용
                        select.onchange = function() {
                            //마나 필터 변경
                            process.search.set = select.value;
                            //키워드 변경
                            let text = select.options[select.selectedIndex].text;
                            $("#search_set").innerHTML = text;
                            $("#mobilefilter_set").innerHTML = text;
                            //창 닫기
                            swal.close();
                            //검색 개시
                            card_search();
                        }
                    },
                    showConfirmButton:false,
                    showCancelButton:true,
                    cancelButtonText: '취소',
                    cancelButtonColor: '#d33'
                })
                    break;
                default:
                    break;
            }
        }
    }
        //직업 필터 작동
        filter_set("init");
        //직업 필터 상호작용
        $("#search_set").onclick = filter_set;
        $("#mobilefilter_set").onclick = filter_set;

    //검색어
    function filter_keyword(text) {
        //초기"글자" 설정
        if (text === "init") {
            //키워드 초기화
            process.search.keyword = "";
            //형광색 초기화
            $("#search_keyword").classList.remove("activate");
            $("#mobilefilter_keyword").classList.remove("activate");
            //"전체" 키워드
            let text = "검색";
            $("#keyword_text").innerHTML = text;
            $("#keyword_text2").innerHTML = text;
        } else {
            //팝업창 열기
            swal({
                title: '검색어 설정',
                input: 'text',
                text: '카드의 이름, 텍스트, 종족, 종류를 검색합니다',
                inputPlaceholder: '검색어를 입력하세요',
                showCancelButton:true,
                confirmButtonText: '적용',
                cancelButtonText: '취소',
                cancelButtonColor: '#d33'
            }).then(function(result) {
                if (result) {
                    //검색 필터 변경
                    process.search.keyword = result;
                    //형광색 표시
                    $("#search_keyword").classList.add("activate");
                    $("#mobilefilter_keyword").classList.add("activate");
                    //키워드 변경
                    let text = result;
                    $("#keyword_text").innerHTML = text;
                    $("#keyword_text2").innerHTML = text;
                    //검색 개시
                    card_search();
                }
            })
        }
    }
        //직업 필터 작동
        filter_keyword("init");
        //직업 필터 상호작용
        function searchclick() {
            if (process.search.keyword === "") {
                filter_keyword();
            } else {
                filter_keyword("init");
                card_search();
            }
        }
        $("#search_keyword").onclick = searchclick;
        $("#mobilefilter_keyword").onclick = searchclick;

    //필터 리셋
    function filter_reset() {
        //검색 초기치 설정, 필터 활성화
        if (!process.search) process.search = {};
        //process.search.class = process.deck.class; //직업은 초기화하지 않음
        process.search.mana = "all";//마나
        process.search.rarity = "all";//등급
        process.search.set = "all";//세트
        process.search.keyword = "";//키워드
        card_setFilter();//필터 다시 활성화

        //검색 초기치에 따라 검색결과 출력(최초 검색)
        card_search();
    }
    $("#search_reset").onclick = filter_reset;
    $("#mobilefilter_reset").onclick = filter_reset;

    //모바일 필터 열기
    $("#search_mobilefilter").onclick = function() {
        $("#frame_mobilefilter").classList.add("show");
        $("#frame_mobilefilter_reset").classList.add("show");
    }
        //모바일 필터 닫기
        $$(".mobilefilter_close").forEach(function(x) {
            x.onclick = function() {
                $("#frame_mobilefilter").classList.remove("show");
                $("#frame_mobilefilter_reset").classList.remove("show");
            }
        })
}

//카드 검색 및 출력
function card_search() {
    //로딩 이미지 출력
    $("#collection_loading").style.display = "block";

    setTimeout(function() {
        //0) 로딩 이미지 닫기
        $("#collection_loading").style.display = "none";

        //1) 출력할 카드 목록 정리
        let arr = [];
        session.db.forEach(function(x) {
            if (x.cardClass === process.search.class &&//직업
            (x.rarity !== "FREE" || x.type !== "HERO") &&//기본 영웅 제외
            (x.rarity !== "HERO_SKIN" || x.type !== "HERO") &&//스킨 영웅 제외
            (DATA.SET_FORMAT[x.set] === "정규" || DATA.SET_FORMAT[x.set] === process.deck.format) &&//포맷(정규는 무조건 포함)
            (process.search.mana === "all" || card_matchMana(x, process.search.mana) === true) &&//마나
            (process.search.rarity === "all" || x.rarity === process.search.rarity) &&//등급
            (process.search.set === "all" || x.set === process.search.set) &&//세트
            card_matchKeyword(x, process.search.keyword) === true) {
                arr.push(x.ssi);
            }
        })
            //카드 목록 저장
            process.search.result = arr;

        //2) 카드 목록에 따라 노드 불러오기
        cluster_update("collection",false);

        //검색된 카드 수량 표시
        $("#footer_name_left").innerHTML = "카드 목록(" + arr.length + ")";
    },10);
}


//카드 추가 & 제거 & 적용
function card_move(cmd, log) {
    //커맨드 쪼개기
    let cmdarr = cmd.split(" ");
    let movement = cmdarr[0];
    let deckarr = [];
    //명령 구분
    switch (movement) {
        //카드 추가
        case "add":
            //카드 분류
            for (let i = 1;i < cmdarr.length;i++) {
                deckarr.push(cmdarr[i]);
            }
            //카드 추가
            deckarr.forEach(function(index) {
                let quantity = card_getQuantity(index);
                //덱이 30장 미만이고, 카드 없거나 카드가 1장일 때 전설이 아니면 카드 추가
                if (process.deck.quantity < DATA.DECK_LIMIT &&
                    (quantity <= 0 || (quantity === 1 && session.db[index].rarity !== "LEGENDARY"))) {
                    //로그 기록
                    if (log === true) log_record(cmd);
                    //수량이 0이면
                    if (quantity === 0) {
                        //카드정보 추가
                        let obj = {
                            "ssi":index,
                            "quantity":1
                        }
                        process.deck.cards.push(obj);
                        //카드정보 정렬
                        process.deck.cards.sort(function(a,b) {
                            return (parseInt(a.ssi) < parseInt(b.ssi)) ? -1 : 1;
                        })
                    //수량이 1이면 카드정보 찾아서 수량 추가
                    } else {
                        //1) 카드정보 변경
                        for (let i = 0;i < process.deck.cards.length;i++) {
                            let card = process.deck.cards[i];
                            if (card.ssi === index) {
                                card.quantity += 1;
                                break;
                            }
                        }
                    }
                }
            })
            //카드 목록에 따라 노드 불러오기
            cluster_update("deck",deckarr);

            break;
        //카드 제거
        case "remove":
            //로그 기록(제거는 예외사항 없으니 바로 실시)
            if (log === true) log_record(cmd);
            //카드 분류
            for (let i = 1;i < cmdarr.length;i++) {
                deckarr.push(cmdarr[i]);
            }
            //카드 제거
            deckarr.forEach(function(index) {
                let quantity = card_getQuantity(index);
                for (let i = 0;i < process.deck.cards.length;i++) {
                    let card = process.deck.cards[i];
                    if (card.ssi === index) {
                        //수량이 2 이상이면 수량 감소
                        if (card.quantity >= 2) {
                            //수량 감소
                            card.quantity -= 1;
                        //아니라면 카드 정보 제거
                        } else {
                            process.deck.cards.splice(i,1);
                        }

                        break;
                    }
                }
            })
            //카드 목록에 따라 노드 불러오기
            cluster_update("deck",deckarr);

            break;
        //카드 적용
        case "set":
            //로그 기록
            if (log === true) log_record(cmd);
            //카드 분류
            for (let i = 1;i < cmdarr.length;i++) {
                if (i % 2 === 0) {
                    let obj = {
                        deckarr:parseInt(cmdarr[i])
                    }
                    deckobj.push(obj);
                } else if (i % 2 === 1) {
                    deckarr[Math.ceil((i + 1) % 2)].quantity = parseInt(cmdarr[i]);
                }
                deckarr.push(cmdarr[i]);
            }
            //기존 카드목록 기억, 비우기
            let lastdeck = deepCopy(process.deck.cards.length);
            process.deck.cards = [];
            //카드 적용
            deckarr.forEach(function(x) {
                process.deck.cards.push(x);
            })
            //카드 목록에 따라 노드 불러오기
            cluster_update("deck",deckarr);

            break;
        //공통
        default:
            break;
    }
}

//카드 최종 정보 생성
function card_addFragment(index, quantity, show1, flasharr) {
    //요소 불러오기
    let fragment = session.fragment[index];

    //플래시 정보 입력
    if (flasharr !== false && flasharr.indexOf(index) >= 0) {
        fragment = fragment.replace(" flash_hidden","");
    }
    //수량 정보 입력
    let numtext = "";
        //수량이 1 이상
        if (quantity >= 1) {
            //전설이면 "별" 표기
            if (session.db[index].rarity === "LEGENDARY") {
                numtext = "★";
                fragment = fragment.replace(" quantity_hidden","");
            //전설이 아니면 수량 표기
            } else if (show1 === true || (show1 === false && quantity >= 2)) {
                numtext = quantity.toString();
                fragment = fragment.replace(" quantity_hidden","");
            }
        }//카드 수령이 0이면: 숨기기
    fragment = fragment.replace("$quantity",numtext);

    //요소 출력
    return fragment;
}
//클러스터 업데이트
function cluster_update(position, latest) {
    let arr = [];
    let nodearr = [];
    switch (position) {
        case "collection":
            arr = process.search.result;
            //클러스터 입력정보 준비
            arr.forEach(function(x) {
                nodearr.push(card_addFragment(x,card_getQuantity(x),true,latest));
            })
            //클러스터 업데이트
            clusterize.collection.update(nodearr);

            break;
        case "deck":
            arr = process.deck.cards;
            //클러스터 입력정보 준비
            arr.forEach(function(x) {
                nodearr.push(card_addFragment(x.ssi,x.quantity,false,latest));
            })
            //클러스터 업데이트
            clusterize.deck.update(nodearr);

            //카드 추가 스크롤 이동
            let firstcard = $$("#deck_list_content .card_" + latest[0])[0];
            if (firstcard !== undefined)
                $("#deck_list").scrollTop = firstcard.offsetTop;

            //덱 상태 최신화
            deck_refresh();

            //카드목록 (해당되면) 클러스터 업데이트
            cluster_update("collection", latest);

            break;
    }
}

//로그 생성
function log_record(cmd) {
    //로그 공간 생성 및 입력, 표시
    if (!process.log) process.log = [];//로그 공간 생성
    process.log.push(cmd);//로그 입력
    $("#undo_num").innerHTML = thousand(process.log.length);//로그 횟수 표기
    //취소버튼 활성화
    $("#bottom_undo").onclick = log_undo;
    $("#bottom_undo").classList.remove("disabled");
    //복구 로그 비우기
    process.redo = [];
    $("#redo_num").innerHTML = thousand(process.redo.length);
    //복구버튼 비활성화
    $("#bottom_redo").onclick = "";
    $("#bottom_redo").classList.add("disabled");
}
//실행 취소
function log_undo() {
    //마지막 로그 분석
    let log = process.log[process.log.length-1];
        process.log.pop();//마지막 로그 지우기
        $("#undo_num").innerHTML = thousand(process.log.length);//로그 횟수 표기
    let movement = log.split(" ")[0];
    switch (movement) {
        case "add":
            log = log.replace("add","remove");
            break;
        case "remove":
            log = log.replace("remove","add")
            break;
        case "set":
            break;
    }
    //취소 실행
    card_move(log,false);
    //복구 로그에 취소사항 기록
    if (!process.redo) process.redo = [];
    process.redo.push(log);
    $("#redo_num").innerHTML = thousand(process.redo.length);
    //이제 로그가 없으면 취소버튼 비활성화
    if (process.log.length <= 0) {
        $("#bottom_undo").onclick = "";
        $("#bottom_undo").classList.add("disabled");
    }
    //복구 버튼 활성화
    $("#bottom_redo").onclick = log_redo;
    $("#bottom_redo").classList.remove("disabled");
}
//취소 복구
function log_redo() {
    //마지막 복구로그 분석
    let redo = process.redo[process.redo.length-1];
        process.redo.pop();//마지막 로그 지우기
        $("#redo_num").innerHTML = thousand(process.redo.length);//로그 횟수 표기
    let movement = redo.split(" ")[0];
    switch (movement) {
        case "add":
            redo = redo.replace("add","remove");
            break;
        case "remove":
            redo = redo.replace("remove","add")
            break;
        case "set":
            break;
    }
    //복구 실행
    card_move(redo,false);
    //취소 로그에 복구사항 기록
    process.log.push(redo);
    $("#undo_num").innerHTML = thousand(process.log.length);
    //이제 로그가 없으면 취소버튼 비활성화
    if (process.redo.length <= 0) {
        $("#bottom_redo").onclick = "";
        $("#bottom_redo").classList.add("disabled");
    }
    //복구 버튼 활성화
    $("#bottom_undo").onclick = log_undo;
    $("#bottom_undo").classList.remove("disabled");
}

//덱 리프레시
function deck_refresh(cmd) {
    //최초 시동
    if (cmd === "init") {
        //덱에 예전 카드 있으면 비우기
        clusterize.deck.clear();
        //덱 공간 추가
        if (!process.deck) process.deck = {};
        //덱 카드 공간 추가
        if (!process.deck.cards) {
            process.deck.cards = [];
            process.deck.quantity = 0;
            process.deck.dust = 0;
        }
        //영웅 이미지 출력
        $("#deck_hero").style.backgroundImage = "url(" + TILEURL + DATA.CLASS_ID[process.deck.class] + ".jpg)";
        //덱 이름 출력
        if (process.deck.name) {
            $("#deck_name").innerHTML = process.deck.name
        } else {
            $("#deck_name").innerHTML = "나만의 " + DATA.CLASS_KR[process.deck.class] + " 덱";
        }
    }
    //덱 가루, 수량 확인 및 출력
    let quantity = 0;
    let dust = 0;
    process.deck.cards.forEach(function(x) {
        quantity += x.quantity;
        dust += DATA.RARITY_DUST[session.db[x.ssi].rarity] * x.quantity;
    })
        //덱 수량 저장, 출력
        process.deck.quantity = quantity;
        $("#deck_bottom").innerHTML = "카드 " + quantity + " / 30";
        //덱 가루 저장, 출력
        process.deck.dust = dust;
        $("#dust_quantity").innerHTML = thousand(dust);
    //덱이 완성되었으면 배경 변경
    if (process.deck.quantity >= DATA.DECK_LIMIT) {
        $("#deck_list_cover_overlay").classList.add("complete");
    } else {
        $("#deck_list_cover_overlay").classList.remove("complete");
    }
}

//===========================================================
//※ 실행
//===========================================================
document.addEventListener("DOMContentLoaded", function(e) {
    //첫 화면 상호작용
        //첫 화면 공개
        window_shift("titlescreen");

        //홈 버튼
        $("#header_home").onclick = function() {
            window_shift("titlescreen");
        }
        //인포 버튼
        $("#header_info").onclick = function() {
            swal({
                title:"INFORMATION",
                type:"info"
            })
        }

        //카드 클러스터 생성해두기
        clusterize.collection = new Clusterize({
            tag: 'div',
            scrollId: 'collection_list',
            contentId: 'collection_list_content',
            rows_in_block:10,
            no_data_text: '결과 없음',
            no_data_class: 'clusterize-no-data'
        });
        //덱 클러스터 생성해두기
        clusterize.deck = new Clusterize({
            tag: 'div',
            scrollId: 'deck_list',
            contentId: 'deck_list_content',
            rows_in_block:10,
            no_data_text: ''
        });

        //종료 경고 메시지
        window.onbeforeunload = function() {
           return "사이트에서 나가시겠습니까?";
        };
});
//오류 취급 (출처 : http://stackoverflow.com/questions/951791/javascript-global-error-handling)
/*
window.onerror = function(msg, url, line, col, error) {
    var extra = !col ? '' : ', Column : ' + col;
    extra += !error ? '' : '\n * 에러 : ' + error;
    var notice = " * 내용 : " + msg + "\n * Line : " + line + extra;
    if (swal) {
        swal({
            title:"오류 발생",
            type:"error",
            html:"아래의 내용을 제보해주시면 감사하겠습니다.<br>" +
            "(<a href='http://blog.naver.com/ansewo/220924971980' target='_blank'>클릭하면 블로그로 이동합니다</a>)<br/>" +
            notice.replaceAll("\n","<br>")
        });
    } else alert("아래의 내용을 제보해주시면 감사하겠습니다.(http://blog.naver.com/ansewo/220924971980)\n" + notice);
    var suppressErrorAlert = true;
    return suppressErrorAlert;
};
*/
