import Parent from "./feature/contextMenus/parent"
import SelectLanguage from "./feature/contextMenus/selectLanguage"
import SubtitleTranslation from "./feature/contextMenus/subtitleTranslation"
import { StorageSync } from "./storage/sync"

export type TranslateLanguage = {
    source: string
    target: string
}
const storage = StorageSync()
const isTranslationSubtitleDisplay = storage.setTarget<boolean>('isTranslationSubtitleDisplay')
const translateLanguageStorage = storage.setTarget<TranslateLanguage>('translateLanguage')
chrome.runtime.onInstalled.addListener(function() {
    //親コンテキストメニューの作成
    const parent = Parent("udemyTranslate", 'udemy-translate', ['page'], ["https://newdaysysjp.udemy.com/course/*/learn/*"])
    parent.Create()

    //字幕コンテキストメニューの作成
    const subtitleTranslation = SubtitleTranslation("subtitleTranslation", "字幕翻訳", parent.GetId())
    subtitleTranslation.Create()
    subtitleTranslation.CreateChild("on", "オン", true)
    subtitleTranslation.CreateChild("off", "オフ", false)

    //言語選択コンテキストメニューの作成
    const selectLanguage = SelectLanguage("selectLanguage", "言語選択", parent.GetId())
    selectLanguage.Create()
    const source = selectLanguage.CreateChild("source", "翻訳元(source)")
    const target = selectLanguage.CreateChild("target", "翻訳先(target)")

    //言語コンテキストメニューの作成
    const jaCode = 'ja'
    const enCode = 'en'
    const languages = [{ code: jaCode, name: '日本語' }, { code: enCode, name: '英語' }, { code: 'it', name: 'イタリア語' }, { code: 'id', name: 'インドネシア語' }, { code: 'es', name: 'スペイン語' }, { code: 'de', name: 'ドイツ語' }, { code: 'fr', name: 'フランス語' }, { code: 'pt', name: 'ポルトガル語' }]

    //言語(en,jaなど)のコンテキストメニューの作成
    languages.map((value) => {
        const sourceLanguage = source.Languages(value)
        sourceLanguage.Create(sourceLanguage.isEqual(enCode))
        if(sourceLanguage.isEqual(jaCode) || sourceLanguage.isEqual(enCode)){
            const targetLanguage = target.Languages(value)
            targetLanguage.Create(targetLanguage.isEqual(jaCode))
        }
    });

    //storageに登録
    (async () => {
        try{
            await isTranslationSubtitleDisplay.set(true)
            console.log('isTranslationSubtitleDisplayをストレージに登録成功')
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
        const isSubtitleDisplay = await isTranslationSubtitleDisplay.get()
        if (isSubtitleDisplay) return
        try {
            await isTranslationSubtitleDisplay.set(true)
            await storage.confirm()
        } catch (error) {
            console.log(`登録失敗: ${error}`)
        }
        console.log("click ON完了")
    }

    const onClickOff = async () => {
        console.log("click OFF")
        const isSubtitleDisplay = await isTranslationSubtitleDisplay.get()
        if (!isSubtitleDisplay) return
        try {
            await isTranslationSubtitleDisplay.set(false)
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

chrome.management.onEnabled.addListener(() => {
    console.log('disable データクリア')
    storage.clear()
})
