import { Sync } from "./storage/sync.js"
import { CreateCallback, CreateProperties } from "./util/createContextMenu.js"

const translateSubTitleStorage = Sync('translateSubTitle')
const properties = CreateProperties()
const createCallback = CreateCallback()
chrome.runtime.onInstalled.addListener(function () {
    //親コンテキストメニューの作成
    const id = "udemyTranslate"
    const url = ["https://newdaysysjp.udemy.com/course/*/learn/*"]
    const parent = properties.createParentProperties(id, 'udemy-translate', ["page"], url)
    const parentCallback = createCallback.withErrorHandling(() => console.log('作成成功(parent)'))
    chrome.contextMenus.create(parent, parentCallback)

    //字幕コンテキストメニューの作成
    const subtitleTranslation = "subtitleTranslation"
    const subtitleProperties = properties.createChildProperties(subtitleTranslation, "字幕翻訳", id)
    const subtitleTranslationCallback = createCallback.withErrorHandling(() => console.log('作成成功(字幕翻訳)'))
    chrome.contextMenus.create(subtitleProperties, subtitleTranslationCallback);

    //字幕オンコンテキストメニューの作成
    const isSubtitleTranslationOnProperties = properties.createChildRadioProperties("on", "オン", subtitleTranslation, true)
    const isSubtitlesOnCallback = createCallback.withErrorHandling(async () => {
        try{
            console.log('作成成功(ON)')
            await translateSubTitleStorage.set(true)
            console.log('ストレージに登録成功')
        } catch(error){
            console.log(`ストレージに登録失敗: ${error}`)
        }
    })
    chrome.contextMenus.create(isSubtitleTranslationOnProperties, isSubtitlesOnCallback);

    //字幕オフコンテキストメニューの作成
    const isSubtitleTranslationOffProperties = properties.createChildRadioProperties("off", "オフ", subtitleTranslation, false)
    const isSubtitlesOffCallback = createCallback.withErrorHandling(() => console.log('作成成功(Off)'))
    chrome.contextMenus.create(isSubtitleTranslationOffProperties, isSubtitlesOffCallback);
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("contextMenuクリック")
    const onClickOn = async() => {
        console.log("click ON")
        const isSubtitleDisplay = await translateSubTitleStorage.get() as Boolean
        if(isSubtitleDisplay) return
        try{
            await translateSubTitleStorage.set(true)
            translateSubTitleStorage.confirm()
        } catch(error){
            console.log(`登録失敗: ${error}`)
        }
        console.log("click ON完了")
    }

    const onClickOff = async() => {
        console.log("click OFF")
        const isSubtitleDisplay = await translateSubTitleStorage.get() as boolean
        if(!isSubtitleDisplay) return
        try{
            await translateSubTitleStorage.set(false)
            translateSubTitleStorage.confirm()
        } catch(error){
            console.log(`登録失敗: ${error}`)
        }
        console.log("click OFF完了")
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
})
