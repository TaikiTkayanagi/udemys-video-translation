type AliasCreateProperties = chrome.contextMenus.CreateProperties
type AliasContextType = chrome.contextMenus.ContextType

export const CreateProperties = () => {
    const createBasicProperties = function(id: string, title: string): AliasCreateProperties{
        return {"id": id, "title": title}
    }

    const createParentProperties = function(id: string, title: string, context: AliasContextType[], urlPatterns: string[]): AliasCreateProperties{
        const basic = createBasicProperties(id, title)
        return {...basic, "contexts": context, documentUrlPatterns: urlPatterns}
    }

    const createChildProperties = function(id: string, title: string, parentId: string): AliasCreateProperties{
        const basic = createBasicProperties(id, title)
        return {...basic, "parentId": parentId}
    }

    const createChildRadioProperties = function(id: string, title: string, parentId: string, checked: boolean): AliasCreateProperties{
        const basic = createChildProperties(id, title, parentId)
        return {...basic, "type": "radio", "checked": checked}
    }

    return {createBasicProperties, createParentProperties, createChildProperties, createChildRadioProperties}
}

export const CreateCallback = () => {
    const callback = (error: () => void) => (success: () => void) => () => {
        chrome.runtime.lastError ? error() : success();
    }

    const errorHandling = () => {
        console.log("エラー発生")
        console.log(chrome.runtime.lastError)
    }
    const withErrorHandling = callback(errorHandling)

    return {withErrorHandling}
}
