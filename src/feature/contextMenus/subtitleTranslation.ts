import { CreateCallback, CreateProperties } from "../../util/createContextMenu"

const SubtitleTranslation = (id: string, title: string, parentId: string) => {
    const properties = CreateProperties()
    const createCallback = CreateCallback()

    const Create = () => {
        const prop = properties.createChildProperties(id, title, parentId)
        const callback = createCallback.withErrorHandling(() => console.log('作成成功(字幕翻訳)'))
        chrome.contextMenus.create(prop, callback)
    }

    const CreateChild =(id: string, title: string, check: boolean) => {
        const prop = properties.createChildRadioProperties(id, title, GetId(), check)
        const callback = createCallback.withErrorHandling(() => console.log(`作成成功${id}`))
        chrome.contextMenus.create(prop, callback);
    }

    const GetId = () => id

    return {Create, CreateChild, GetId}
}

export default SubtitleTranslation
