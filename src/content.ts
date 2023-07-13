type TranslateAPIResponse = {
    code: number,
    text: string
}

const mutationObserverExec = (callBack: MutationCallback) => (target: Node) => (options: MutationObserverInit | undefined) => {
    new MutationObserver(callBack).observe(target, options)
}
let fetchCount = 0;
const getFirstClassElement: (className: string) => Element | undefined = (className: string) => document.getElementsByClassName(className)[0]
const fetchJson = async(url: string) => (await fetch(url)).json() as Promise<TranslateAPIResponse>;

const observeSubTitlesCallBack = async (mutationList: MutationRecord[], observer: MutationObserver) => {
    for(var mutation of mutationList){
        console.log("解析開始")
        console.log(mutation.target);  // 対象のノードを表示
        console.log(mutation.type);  // 変異のタイプを表示
        console.log(mutation.addedNodes);  // 追加されたノードを表示
        console.log("解析終了")

        const subTitles = getFirstClassElement("captions-display--captions-cue-text--ECkJu");
        if(!subTitles){
            console.log("subTitles無し")
            return;
        }
        if(mutation.type !== "childList" && mutation.type !== "characterData"){
            console.log("childListまたはcharacterDataではない")
            return;
        }
        if(Array.from(mutation.addedNodes).find(value => value instanceof Text)){
            console.log("Textではない")
            return;
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

const observeBodyCallBack = (mutationList: MutationRecord[], observer: MutationObserver) => {
    const subTitles = getFirstClassElement("captions-display--captions-container--1-aQJ");
    if(!subTitles) return;
    //字幕の監視
    console.log("字幕の監視開始")
    mutationObserverExec(observeSubTitlesCallBack)(subTitles)({subtree: true, childList: true, characterData: true });
    //bodyの監視を終了
    observer.disconnect()
}

//bodyの監視
console.log("bodyの監視開始")
mutationObserverExec(observeBodyCallBack)(document.body)({subtree: true, childList: true});
