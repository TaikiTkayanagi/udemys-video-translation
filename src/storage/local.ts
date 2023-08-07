export const StorageLocal = () => {
    const clear = async() => await chrome.storage.local.clear()
    const confirm = () => chrome.storage.local.get(null, (items) => console.log(items))

    const setTarget = <T,>(key: string) => {
        const set = async (value: T) => await chrome.storage.local.set({ [key]: value })
        const get = async () => {
            const value = await chrome.storage.local.get(key)
            return value[key] as T
        }
        return { set, get }
    }

    return {clear, confirm, setTarget}
}
