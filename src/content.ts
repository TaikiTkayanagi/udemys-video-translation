type TranslateAPIResponse = {
    code: number,
    text: string
}

const mutationObserverExec = (callBack: MutationCallback) => (target: Node) => (options: MutationObserverInit | undefined) => {
    const observer = new MutationObserver(callBack)
    observer.observe(target, options)
    return observer
}
const bodyObserverExec = (log: string) => (callBack: MutationCallback) => (options: MutationObserverInit) => {
    const observer = new MutationObserver(callBack)
    console.log(log)
    observer.observe(document.body, options)
    return observer
}
const getFirstClassElement: (className: string) => Element | undefined = (className: string) => document.getElementsByClassName(className)[0]
const analyzeMutation = (logStart: string) => (mutation: MutationRecord) => (logEnd: string) => {
    console.log(logStart)
    console.log(mutation.target);  // 対象のノードを表示
    console.log(mutation.type);  // 変異のタイプを表示
    console.log(mutation.addedNodes);  // 追加されたノードを表示
    console.log(logEnd)
}
const fetchJson = async(url: string) => (await fetch(url)).json() as Promise<TranslateAPIResponse>;

let fetchCount = 0;
const observeSubTitlesCallBack = async (mutationList: MutationRecord[], observer: MutationObserver) => {
    //import文とexport文が使えないためいったんchromeのAPIで行う
    //TODO: sync関数をつかってやりたい
    const translateSubTitle = (await chrome.storage.sync.get('translateSubTitle'))['translateSubTitle'] as boolean
    if(!translateSubTitle){
        console.log("設定オフのため終了")
        return
    }
    for(var mutation of mutationList){
        analyzeMutation("解析開始")(mutation)("解析終了")
        const subTitles = getFirstClassElement("captions-display--captions-cue-text--ECkJu");
        if(!subTitles){
            console.log("subTitles無し")
            return
        }
        if(mutation.type !== "childList" && mutation.type !== "characterData"){
            console.log("childListまたはcharacterDataではない")
            return
        }
        if(Array.from(mutation.addedNodes).find(value => value instanceof Text)){
            console.log("Textではない")
            return
        }
        const url = "https://script.google.com/macros/s/AKfycbwtx6EK_1GJcXitEtJi1GrT5vavR4VnK8tLLKZdZ8Dt-PlHbcO5sP7NWq8lVOVY13BF/exec";
        try{
            console.log(`取得開始: ${fetchCount}`)
            fetchCount++
            const res = await fetchJson(`${url}?text=${mutation.target.textContent}&source=en&target=ja`)
            subTitles.textContent = res.text
            console.log("取得完了")
        } catch(Exception){
            subTitles.textContent = "取得に失敗しました!"
        }
    }
}

const observeVideoCallBack = (mutationList: MutationRecord[], observer: MutationObserver) => (subTitlesObserver: MutationObserver) => {
    console.log("字幕の監視終了")
    subTitlesObserver.disconnect()
    console.log("videoの監視終了")
    observer.disconnect()
    //Bodyの監視を新規で再開
    bodyObserverExec("Bodyの監視再開")(observeBodyCallBack)({subtree: true, childList: true, attributes: true})
}

const observeBodyCallBack = (mutationList: MutationRecord[], observer: MutationObserver) => {
    const subTitles = getFirstClassElement("captions-display--captions-container--1-aQJ")
    const video = getFirstClassElement("curriculum-item-view--content--3ABmp");
    if(!subTitles || !video) {
        console.log(subTitles)
        console.log(video)
        console.log("スキップ")
        return
    }
    //字幕の監視
    console.log("字幕の監視開始")
    const subTitlesObserver = mutationObserverExec(observeSubTitlesCallBack)(subTitles)({subtree: true, childList: true, characterData: true })
    //Videoの監視
    console.log("videoの監視開始")
    mutationObserverExec((mutationList, observer) => observeVideoCallBack(mutationList, observer)(subTitlesObserver))(video)({childList: true})
    //bodyの監視を終了
    console.log("bodyの監視終了")
    observer.disconnect()
}

//bodyの監視
bodyObserverExec("bodyの監視開始")(observeBodyCallBack)({subtree: true, childList: true})
