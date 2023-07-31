import { StorageSync } from "./storage/sync.js"
import { CreateCallback, CreateProperties } from "./util/createContextMenu.js"

type TranslateLanguage = {
    from: string
    to: string
}
const storage = StorageSync()
const translateSubtitleStorage = storage.setTarget<boolean>('translateSubtitle')
const translateLanguageStorage = storage.setTarget<TranslateLanguage>('translateLanguage')
const properties = CreateProperties()
const createCallback = CreateCallback()
chrome.runtime.onInstalled.addListener(function() {
    //親コンテキストメニューの作成
    const id = "udemyTranslate"
    const url = ["https://newdaysysjp.udemy.com/course/*/learn/*"]
    const parentProperties = properties.createParentProperties(id, 'udemy-translate', ["page"], url)
    const parentCallback = createCallback.withErrorHandling(() => console.log('作成成功(parent)'))
    chrome.contextMenus.create(parentProperties, parentCallback)

    //字幕コンテキストメニューの作成
    const subtitleTranslation = "subtitleTranslation"
    const subtitleTranslationProperties = properties.createChildProperties(subtitleTranslation, "字幕翻訳", id)
    const subtitleTranslationCallback = createCallback.withErrorHandling(() => console.log('作成成功(字幕翻訳)'))
    chrome.contextMenus.create(subtitleTranslationProperties, subtitleTranslationCallback);

    //字幕オンコンテキストメニューの作成
    const isSubtitleTranslationOnProperties = properties.createChildRadioProperties("on", "オン", subtitleTranslation, true)
    const isSubtitlesOnCallback = createCallback.withErrorHandling(() => console.log('作成成功(ON)'))
    chrome.contextMenus.create(isSubtitleTranslationOnProperties, isSubtitlesOnCallback);

    //字幕オフコンテキストメニューの作成
    const isSubtitleTranslationOffProperties = properties.createChildRadioProperties("off", "オフ", subtitleTranslation, false)
    const isSubtitlesOffCallback = createCallback.withErrorHandling(() => console.log('作成成功(Off)'))
    chrome.contextMenus.create(isSubtitleTranslationOffProperties, isSubtitlesOffCallback);

    //言語選択コンテキストメニューの作成
    const selectLanguageId = "selectLanguage"
    const selectLanguageProperties = properties.createChildProperties(selectLanguageId, "言語選択", id)
    const selectLanguageCallback = createCallback.withErrorHandling(() => console.log('作成成功(select language)'))
    chrome.contextMenus.create(selectLanguageProperties, selectLanguageCallback)

    //言語選択変換元コンテキストメニューの作成
    const sourceLanguageId = "sourceLanguage"
    const sourceLanguageProperties = properties.createChildProperties(sourceLanguageId, "翻訳元(from)", selectLanguageId)
    const sourceLanguageCallback = createCallback.withErrorHandling(() => console.log('作成成功(source language)'))
    chrome.contextMenus.create(sourceLanguageProperties, sourceLanguageCallback)

    //言語選択変換先コンテキストメニューの作成
    const targetLanguageId = "targetLanguage"
    const targetLanguageProperties = properties.createChildProperties(targetLanguageId, "翻訳先(to)", selectLanguageId)
    const targetLanguageCallback = createCallback.withErrorHandling(() => console.log('作成成功(target language)'))
    chrome.contextMenus.create(targetLanguageProperties, targetLanguageCallback)

    //言語コンテキストメニューの作成
    const jaCode = 'ja'
    const enCode = 'en'
    const languages = [{ code: jaCode, name: '日本語' }, { code: enCode, name: '英語' }, { code: 'it', name: 'イタリア語' }, { code: 'id', name: 'インドネシア語' }, { code: 'es', name: 'スペイン語' }, { code: 'de', name: 'ドイツ語' }, { code: 'fr', name: 'フランス語' }, { code: 'pt', name: 'ポルトガル語' }]

    //言語(en,jaなど)のコンテキストメニューの作成
    languages.map((value) => {
        const isChecked = (targetLanguageCode: string) => value.code === targetLanguageCode
        const defaultCallback = createCallback.withErrorHandling(() => console.log(`作成成功${value.code}`))
        const sourceChecked = isChecked('ja')
        const sourceLanguageProperties = properties.createChildRadioProperties(`source${value.code}`, value.name, sourceLanguageId, sourceChecked)
        const sourceLanguageCallback = defaultCallback
        chrome.contextMenus.create(sourceLanguageProperties, sourceLanguageCallback)

        const targetChecked = isChecked('en')
        const targetLanguageProperties = properties.createChildRadioProperties(`target${value.code}`, value.name, targetLanguageId, targetChecked)
        const targetLanguageCallback = defaultCallback
        chrome.contextMenus.create(targetLanguageProperties, targetLanguageCallback)
    });

    //storageに登録
    //TODO: subtitleTranslateもここで設定するようにする
    (async () => {
        try{
            await translateSubtitleStorage.set(true)
            console.log('translateSubtitleをストレージに登録成功')
        } catch(error){
            console.log('登録失敗')
            console.log(error)
        }
    })();
    (async() => {
        try{
            await translateLanguageStorage.set({from: jaCode, to: enCode})
            console.log('translateLanguageをストレージに登録成功')
            storage.confirm()
        } catch(error) {
            console.log('登録失敗')
            console.log(error)
        }
    })();
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("contextMenuクリック")
    const onClickOn = async () => {
        console.log("click ON")
        const isSubtitleDisplay = await translateSubtitleStorage.get() as Boolean
        if (isSubtitleDisplay) return
        try {
            await translateSubtitleStorage.set(true)
            await storage.confirm()
        } catch (error) {
            console.log(`登録失敗: ${error}`)
        }
        console.log("click ON完了")
    }

    const onClickOff = async () => {
        console.log("click OFF")
        const isSubtitleDisplay = await translateSubtitleStorage.get() as boolean
        if (!isSubtitleDisplay) return
        try {
            await translateSubtitleStorage.set(false)
            await storage.confirm()
        } catch (error) {
            console.log(`登録失敗: ${error}`)
        }
        console.log("click OFF完了")
    }

    switch (info.menuItemId) {
        case "on":
            onClickOn()
            break
        case "off":
            console.log("オフ")
            onClickOff()
            break
        default:
            console.log(info)
    }
})
