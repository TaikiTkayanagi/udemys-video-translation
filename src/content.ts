type TranslateAPIResponse = {
    code: number,
    text: string
}

const mutationObserverExec = (callBack: MutationCallback) => (target: Node) => (options: MutationObserverInit | undefined) => {
    new MutationObserver(callBack).observe(target, options)
}
const getSubTitles: (className: string) => Element | undefined = (className: string) => document.getElementsByClassName(className)[0]
const fetchJson = async(url: string) => (await fetch(url)).json() as Promise<TranslateAPIResponse>; 

const observeSubTitlescallBack = async (mutationList: MutationRecord[], observer: MutationObserver) => {
    const mutation = mutationList[0]
    if(mutation.removedNodes.length !== 0){
        return;
    }
    const target = mutation.addedNodes[0]
    if(target instanceof Text){
        return
    }

    const targetElement = target as Element
    if(targetElement.getAttribute("isTranslation")){
        return;
    }
    const url = "https://script.google.com/macros/s/AKfycbwtx6EK_1GJcXitEtJi1GrT5vavR4VnK8tLLKZdZ8Dt-PlHbcO5sP7NWq8lVOVY13BF/exec";
    const res = await fetchJson(`${url}?text=${mutation.target.textContent}&source=en&target=ja`)
    targetElement.setAttribute("data-isTranslation", "true");
    targetElement.textContent = res.text
}

const observeBodyCallBack = (mutationList: MutationRecord[], observer: MutationObserver) => {
    const subTitles = getSubTitles("captions-display--captions-container--1-aQJ");
    if(!subTitles) return;
    //字幕の監視
    mutationObserverExec(observeSubTitlescallBack)(subTitles)({subtree: true, childList: true, characterData: true});
    //bodyの監視を終了
    observer.disconnect()
}

//bodyの監視
mutationObserverExec(observeBodyCallBack)(document.body)({subtree: true, childList: true});
