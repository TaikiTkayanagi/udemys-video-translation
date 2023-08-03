import Parent from "./feature/contextMenus/parent"
import SelectLanguage from "./feature/contextMenus/selectLanguage"
import SubtitleTranslation from "./feature/contextMenus/subtitleTranslation"
import IsTranslationSubtitleDisplay from "./feature/storage/isTranslationSubtitleDisplay"
import TranslateLanguage, { TranslateLanguageType } from "./feature/storage/translateLanguage"
import { StorageSync } from "./storage/sync"

const storage = StorageSync()
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
    (async () => await IsTranslationSubtitleDisplay().set(true))();
    (async() => await TranslateLanguage().set({source: enCode, target: jaCode}))();
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const isTranslationSubtitleDisplayStorage = IsTranslationSubtitleDisplay()
    const translateLanguageStorage = TranslateLanguage()
    console.log("contextMenuクリック")

    const onClickOn = async () => {
        console.log("click ON")
        const isSubtitleDisplay = await isTranslationSubtitleDisplayStorage.get()
        //ON(True)の場合setはしない
        if (isSubtitleDisplay === undefined || isSubtitleDisplay) return
        await isTranslationSubtitleDisplayStorage.set(true)
    }

    const onClickOff = async () => {
        console.log("click OFF")
        const isSubtitleDisplay = await isTranslationSubtitleDisplayStorage.get()
        if (isSubtitleDisplay === undefined || !isSubtitleDisplay) return
        await isTranslationSubtitleDisplayStorage.set(false)
    }

    const onClickSource = async(source: string) => {
        const languageIndex = 1
        const existValue = await translateLanguageStorage.get()
        if(!existValue) return
        const value: TranslateLanguageType = {
            source: source.split('source-')[languageIndex], 
            target: existValue.target
        }  
        console.log(`source: ${value.source} target: ${value.target}`)
        await translateLanguageStorage.set(value)
    }

    const onClickTarget = async(target: string) => {
        const languageIndex = 1
        const existValue = await translateLanguageStorage.get()
        if(!existValue) return
        const value: TranslateLanguageType = {
            source: existValue.source, 
            target: target.split('target-')[languageIndex]
        }
        console.log(`source: ${value.source} target: ${value.target}`)
        await translateLanguageStorage.set(value)
    }

    if(info.menuItemId === 'on') onClickOn()
    else if (info.menuItemId === 'off') onClickOff()
    else if(info.menuItemId.toString().includes('source')) onClickSource(info.menuItemId.toString())
    else if(info.menuItemId.toString().includes('target')) onClickTarget(info.menuItemId.toString())
    storage.confirm()
})

chrome.management.onEnabled.addListener(() => {
    console.log('disable データクリア')
    storage.clear()
})
