import { StorageSync } from "../../storage/sync"

const IsTranslationSubtitleDisplay = () => {
    const storage = StorageSync().setTarget<boolean>('isTranslationSubtitleDisplay')

    const set = async (value: boolean) => {
        try {
            await storage.set(value)
            console.log('isTransalationSubtitleDisplayをストレージに登録成功')
        } catch(error) {
            console.log('登録失敗: isTranslationSubtitleDisplay')
            console.log(error)
        }
    }

    const get =async () => {
        try {
            const result = await storage.get()
            return result
        } catch(error) {
            console.log('取得失敗: isTranslationSubtitleDisplay')
            console.log(error)
            return undefined
        }
    }

    return {get, set}
}

export default IsTranslationSubtitleDisplay