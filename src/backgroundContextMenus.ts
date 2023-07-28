chrome.runtime.onInstalled.addListener(function () {
    console.log("インストールされたよ")
    chrome.contextMenus.create({
        "id": "sampleContextMenu",
        "title": "Sample Context Menu",
        "contexts": ["selection"]
    });
});