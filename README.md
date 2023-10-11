# 翻訳サーバー
* 詳細: https://script.google.com/home/projects/1JZqJu5p4iEtNVPbWu9ximMJts5NCrJZfy9-Pto6gKCqMVKmdkL-hwRM7
* API: https://script.google.com/macros/s/AKfycbwtx6EK_1GJcXitEtJi1GrT5vavR4VnK8tLLKZdZ8Dt-PlHbcO5sP7NWq8lVOVY13BF/exec

# 翻訳サーバのコード
```js
function doGet(e) {
    // リクエストパラメータを取得する
    var p = e.parameter;
    //  LanguageAppクラスを用いて翻訳を実行
    var translatedText = LanguageApp.translate(p.text, p.source, p.target);
    // レスポンスボディの作成
    var body;
    if (translatedText) {
        body = {
          code: 200,
          text: translatedText
        };
    } else {
        body = {
          code: 400,
          text: "Bad Request"
        };
    }
    // レスポンスの作成
    var response = ContentService.createTextOutput();
    // Mime TypeをJSONに設定
    response.setMimeType(ContentService.MimeType.JSON);
    // JSONテキストをセットする
    response.setContent(JSON.stringify(body));

    return response;
}
```

# chromne.sotrage.syncに入れる値
key: isTranslationSubtitleDisplay value: boolean
key: translateLanguage value: {from: string, to: string} ※from && to: "en", "ja"
key: isReading value: boolean
