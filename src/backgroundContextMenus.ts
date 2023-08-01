import { StorageSync } from "./storage/sync"
import { CreateCallback, CreateProperties } from "./util/createContextMenu"

type TranslateLanguage = {
    source: string
    target: string
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
    const sourceLanguageProperties = properties.createChildProperties(sourceLanguageId, "翻訳元(source)", selectLanguageId)
    const sourceLanguageCallback = createCallback.withErrorHandling(() => console.log('作成成功(source language)'))
    chrome.contextMenus.create(sourceLanguageProperties, sourceLanguageCallback)

    //言語選択変換先コンテキストメニューの作成
    const targetLanguageId = "targetLanguage"
    const targetLanguageProperties = properties.createChildProperties(targetLanguageId, "翻訳先(target)", selectLanguageId)
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

        const sourceLanguageProperties = properties.createChildRadioProperties(`source-${value.code}`, value.name, sourceLanguageId, isChecked(enCode))
        chrome.contextMenus.create(sourceLanguageProperties, defaultCallback)

        //targetは英語と日本語のみ作成
        if(isChecked(enCode) || isChecked(jaCode)){
            const targetChecked = isChecked(jaCode)
            const targetLanguageProperties = properties.createChildRadioProperties(`target-${value.code}`, value.name, targetLanguageId, targetChecked)
            chrome.contextMenus.create(targetLanguageProperties, defaultCallback)
        }
    });

    //storageに登録
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
            await translateLanguageStorage.set({source: enCode, target: jaCode})
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
        const isSubtitleDisplay = await translateSubtitleStorage.get()
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
        const isSubtitleDisplay = await translateSubtitleStorage.get()
        if (!isSubtitleDisplay) return
        try {
            await translateSubtitleStorage.set(false)
        } catch (error) {
            console.log(`登録失敗: ${error}`)
        }
        console.log("click OFF完了")
    }

    const onClickSourceLanguage = async(source: string) => {
        const languageIndex = 1
        try{
            const translateLanguage = await translateLanguageStorage.get()
            console.log(source.split('source-'))
            const value: TranslateLanguage = {source: source.split('source-')[languageIndex], target: translateLanguage.target}
            console.log(`source: ${value.source} target: ${value.target}`)
            await translateLanguageStorage.set(value)
            storage.confirm()
        } catch(error) {
            console.log('エラー')
            console.log(error)
        }
    }

    const onClickTargetLanguage = async(target: string) => {
        const languageIndex = 1
        try{
            const translateLanguage = await translateLanguageStorage.get()
            const value: TranslateLanguage = {source: translateLanguage.source, target: target.split('target-')[languageIndex]}
            console.log(`source: ${value.source} target: ${value.target}`)
            await translateLanguageStorage.set(value)
            storage.confirm()
        } catch(error) {
            console.log('エラー')
            console.log(error)
        }
    }

    if(info.menuItemId === 'on'){
        onClickOn()
    } else if (info.menuItemId === 'off'){
        onClickOff()
    } else if(info.menuItemId.toString().includes('source')){
        onClickSourceLanguage(info.menuItemId.toString())
    } else if(info.menuItemId.toString().includes('target')){
        onClickTargetLanguage(info.menuItemId.toString())
    }
})
