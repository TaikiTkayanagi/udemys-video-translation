import { CreateCallback, CreateProperties } from "../../util/createContextMenu"

const Parent = (id: string, text: string, context: chrome.contextMenus.ContextType[], url: string[]) => {
    const properties = CreateProperties()
    const createCallback = CreateCallback()

    const Create = () => {
        const parentProperties = properties.createParentProperties(id, text, context, url)
        const parentCallback = createCallback.withErrorHandling(() => console.log('作成成功(parent)'))
        chrome.contextMenus.create(parentProperties, parentCallback)
    }

    const GetId = () => id

    return {Create, GetId}
}

export default Parent
