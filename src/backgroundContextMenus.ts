type CreateProperties = chrome.contextMenus.CreateProperties
type BasicProperties = {
    id: CreateProperties["id"]
    title: CreateProperties["title"]
}

chrome.runtime.onInstalled.addListener(function () {
    function createBasicProperties(id: string, title: string):BasicProperties{
        return {"id": id, "title": title}
    }
    function createParentProperties(basicProperties: BasicProperties, context: chrome.contextMenus.ContextType[], urlPatterns: string[]): CreateProperties{
        return {...basicProperties, "contexts": context, "documentUrlPatterns": urlPatterns}
    }
    function createChildProperties(basicProperties: BasicProperties, parentId: string): CreateProperties{
        return {...basicProperties, "parentId": parentId}
    }
    function createChildRadioProperties(basicProperties: BasicProperties, parentId: string, checked: boolean): CreateProperties{
        const childProperties = createChildProperties(basicProperties, parentId)
        return {...childProperties, "type": "radio", "checked": checked}
    }
    const createCallBack = (errorCallBack: () => void) => (successCallBack: () => void) => () => chrome.runtime.lastError ? errorCallBack() : successCallBack()

    //親コンテキストメニューの作成
    const parentId = "udemyTranslate"
    const parentBasicProperties = createBasicProperties(parentId, 'udemy-translate')
    const parentProperties = createParentProperties(parentBasicProperties, ["page"], ["https://newdaysysjp.udemy.com/course/*/learn/*"])
    const createCallBackWith = createCallBack(() => console.log(`${chrome.runtime.lastError}`))
    chrome.contextMenus.create(parentProperties, createCallBackWith(() => console.log('作成成功(parent)')))

    //字幕コンテキストメニューの作成
    const subTitles = "subTitles"
    const subTitlesBasicProperties = createBasicProperties(subTitles, "字幕")
    const subtitlesProperties = createChildProperties(subTitlesBasicProperties, parentId)
    chrome.contextMenus.create(subtitlesProperties, createCallBackWith(() => console.log('作成成功(字幕)')));

    //字幕オンコンテキストメニューの作成
    const isSubTitlesOnBasicProperties = createBasicProperties("on", "オン")
    const isSubTitlesOnPropertiesWithRadio = createChildRadioProperties(isSubTitlesOnBasicProperties, subTitles, true)

    const isSubTitlesOnCallBack = createCallBackWith(async () => {
        try{
            console.log('作成成功(ON)')
            await chrome.storage.sync.set({'isSubtitleDisplay': true})
            console.log('ストレージに登録成功')
        } catch(error){
            console.log(`ストレージに登録失敗: ${error}`)
        }
    })
    chrome.contextMenus.create(isSubTitlesOnPropertiesWithRadio, isSubTitlesOnCallBack);

    //字幕オフコンテキストメニューの作成
    const isSubTitlesOffBasicProperties = createBasicProperties("off", "オフ")
    const isSubTitlesOffWithRadioProperties = createChildRadioProperties(isSubTitlesOffBasicProperties, subTitles, false)
    chrome.contextMenus.create(isSubTitlesOffWithRadioProperties, createCallBackWith(() => console.log('作成成功(Off)')));
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("contextMenuクリック")
    const onClickOn = async() => {
        const isSubtitleDisplay = (await chrome.storage.sync.get('isSubtitleDisplay'))['isSubtitleDisplay'] as boolean
        if(isSubtitleDisplay) return
        try{
            await chrome.storage.sync.set({'isSubtitleDisplay': true})
        } catch(error){
            console.log(`登録失敗: ${error}`)
        }
    }

    const onClickOff = async() => {
        console.log("オフクリック")
        const isSubtitleDisplay = (await chrome.storage.sync.get('isSubtitleDisplay'))['isSubtitleDisplay'] as boolean
        if(!isSubtitleDisplay) return
        try{
            await chrome.storage.sync.set({'isSubtitleDisplay': false})
        } catch(error){
            console.log(`登録失敗: ${error}`)
        }
        console.log("オフクリック完了")
    }


    switch(info.menuItemId){
        case "on":
            onClickOn()
            break
        case "off":
            console.log("オフ")
            onClickOff()
            break
    }
    console.log(chrome.storage.sync.get(null, (data) => console.log(data)))
})
