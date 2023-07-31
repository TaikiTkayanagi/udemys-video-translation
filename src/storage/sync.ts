export type TranslateLanguage = {
    from: string
    to: string 
}

type Value = string | boolean | TranslateLanguage 


export const StorageSync = () => {
    const clear = async() => await chrome.storage.sync.clear()
    const confirm = () => chrome.storage.sync.get(null, (items) => console.log(items))

    const setTarget = (key: string) => {
        const set = async (value: Value) => await chrome.storage.sync.set({ [key]: value })
        const get = async () => {
            const value = await chrome.storage.sync.get(key)
            return value[key]
        }
        return { set, get }
    }

    return {clear, confirm, setTarget}
}