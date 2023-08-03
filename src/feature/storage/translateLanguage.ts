import { StorageSync } from "../../storage/sync"

export type TranslateLanguageType = {
    source: string
    target: string
}

const TranslateLanguage = () => {
    const storage = StorageSync().setTarget<TranslateLanguageType>('translateLanguage')

    const set = async (value: TranslateLanguageType) => {
        try {
            await storage.set(value)
            console.log('translateLanguageをストレージに登録成功')
        } catch(error) {
            console.log('登録失敗: translateLanguage')
            console.log(error)
        }
    }

    const get =async () => {
        try {
            const result = await storage.get()
            return result
        } catch(error) {
            console.log('取得失敗: translateLanguage')
            console.log(error)
            return undefined
        }
    }

    return {get, set}
}

export default TranslateLanguage