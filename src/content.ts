import IsTranslationSubtitleDisplay from "./feature/storage/isTranslationSubtitleDisplay"
import TranslateLanguage from "./feature/storage/translateLanguage"

type TranslateAPIResponse = {
    code: number,
    text: string
}

const mutationObserverExec = (callBack: MutationCallback, target: Node, options: MutationObserverInit | undefined) => {
    const observer = new MutationObserver(callBack)
    observer.observe(target, options)
    return observer
}
const bodyObserverExec = (log: string, callBack: MutationCallback, options: MutationObserverInit) => {
    const observer = new MutationObserver(callBack)
    console.log(log)
    observer.observe(document.body, options)
    return observer
}
const getFirstClassElement = (className: string) => {
    const elements = document.getElementsByClassName(className)
    return elements.length ? elements[0] : undefined;
}
const analyzeMutation = (logStart: string, mutation: MutationRecord, logEnd: string) => {
    console.log(logStart)
    console.log(mutation.target);  // 対象のノードを表示
    console.log(mutation.type);  // 変異のタイプを表示
    console.log(mutation.addedNodes);  // 追加されたノードを表示
    console.log(logEnd)
}
const fetchJson = async(url: string) => (await fetch(url)).json() as Promise<TranslateAPIResponse>;
const isTranslationSubtitleDisplayStorage = IsTranslationSubtitleDisplay()
const translateLanguageStorage = TranslateLanguage()

let fetchCount = 0;
const observeSubTitlesCallBack = async (mutationList: MutationRecord[], observer: MutationObserver) => {
    const isTranslationSubtitleDisplay = await isTranslationSubtitleDisplayStorage.get()
    if(isTranslationSubtitleDisplay === undefined || !isTranslationSubtitleDisplay){
        console.log("設定オフのため終了")
        return
    }
    for(var mutation of mutationList){
        analyzeMutation("解析開始", mutation, "解析終了")
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
            const languages = await translateLanguageStorage.get()
            const source = languages?.source || "en"
            const target = languages?.target || "ja"
            console.log(`source: ${source} target: ${target}`)
            const res = await fetchJson(`${url}?text=${mutation.target.textContent}&source=${source}&target=${target}`)
            subTitles.textContent = res.text
            console.log("取得完了")
        } catch(Exception){
            subTitles.textContent = "取得に失敗しました!"
        }
    }
}

const observeVideoCallBack = (subTitlesObserver: MutationObserver) => (_: MutationRecord[], observer: MutationObserver) => {
    console.log("字幕の監視終了")
    subTitlesObserver.disconnect()
    console.log("videoの監視終了")
    observer.disconnect()
    //Bodyの監視を新規で再開
    bodyObserverExec("Bodyの監視再開", observeBodyCallBack, {subtree: true, childList: true})
}

const observeBodyCallBack = (_: MutationRecord[], observer: MutationObserver) => {
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
    const subTitlesObserver = mutationObserverExec(observeSubTitlesCallBack, subTitles, {subtree: true, childList: true, characterData: true })
    //動画の自動切り替えでsubTitlesが変更されてしまう。なので、videoノードを監視して自動切換えされたらbodyから監視を開始する
    console.log("videoの監視開始")
    mutationObserverExec(observeVideoCallBack(subTitlesObserver), video, {childList: true})
    //bodyの監視を終了
    console.log("bodyの監視終了")
    observer.disconnect()
}

//bodyの監視
bodyObserverExec("bodyの監視開始", observeBodyCallBack, {subtree: true, childList: true})
