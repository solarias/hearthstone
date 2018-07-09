
//===============================================================
//※ 덱코드 관련 함수
//===============================================================

function deckcode_decode(deckcode) {
    //(검증된) 덱코드 해석
    let input = deckstrings.decode(deckcode);
    let output = {};
    //카드
    output.cards = [];
    let dbfidArr = [];
    let quantityArr = [];
    input.cards.forEach(function(arr) {
        dbfidArr.push(arr[0]);
        quantityArr.push(arr[1]);
    })
    for (let i = 0;i < session.db.length;i++) {
        let card = session.db[i];
        let cardobj = {};
        let index = dbfidArr.indexOf(card.dbfid);
        if (index >= 0) {
            cardobj.ssi = card.ssi;
            cardobj.quantity = quantityArr[index];
                output.cards.push(cardobj);
            //검색된 요소 제거
            dbfidArr.splice(index,1);
            quantityArr.splice(index,1);
            //다 끝났으면 종료
            if (dbfidArr.length <= 0 && quantityArr.length <= 0) {
                break;
            }
        }
    }
    //직업
    for (let i = 0;i < session.db.length;i++) {
        if (session.db[i].dbfid === input.heroes[0].toString()) {
            output.class = session.db[i].cardClass;
            break;
        }
    }
    //포맷
        //카드 구성으로 포맷을 자체적으로 구할 것
        output.format = DATA.FORMAT_DECODE[input.format.toString()];
    //출력
    return output;
    console.log(output);
}
