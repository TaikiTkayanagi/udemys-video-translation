type Value = string | boolean

export const Sync = (key: string) => {
    const set = async(value: Value) => await chrome.storage.sync.set({[key]: value})
    const get =  async() => {
        const value = await chrome.storage.sync.get(key)
        return value[key]
    }
    const confirm = () => chrome.storage.sync.get(null, (items) => console.log(items))
    return {set, get, confirm}
}
