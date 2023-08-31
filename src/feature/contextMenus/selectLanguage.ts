import { CreateCallback, CreateProperties } from "../../util/createContextMenu"

const SelectLanguage = (id: string, title: string, parentId: string) => {
    const properties = CreateProperties()
    const createCallback = CreateCallback()

    const Create = () => {
        const prop = properties.createChildProperties(id, title, parentId)
        const callback = createCallback.withErrorHandling(() => console.log('作成成功(select language)'))
        chrome.contextMenus.create(prop, callback)
    }

    const CreateChild = (id: string, title: string) => {
        const prop = properties.createChildProperties(id, title, GetId())
        const callback = createCallback.withErrorHandling(() => console.log(`作成成功${id}`))
        chrome.contextMenus.create(prop, callback)

        const Languages = (language: {code: string, name: string}) => {
            const Create = (isChecked: boolean) => {
                const prop = properties.createChildRadioProperties(`${id}-${language.code}`, language.name, id, isChecked)
                const callback = createCallback.withErrorHandling(() => console.log(`作成成功${language.code}`))

                chrome.contextMenus.create(prop, callback)
            }

            const isEqual = (compare: string) => language.code === compare
            return {Create, isEqual}
        }
        return {Languages}
    }

    const GetId = () => id


    return {Create, CreateChild }
}

export default SelectLanguage
