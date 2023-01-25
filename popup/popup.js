chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let data = [];
    chrome.runtime.getPackageDirectoryEntry(root => {
        root.getFile("data/en.json", {}, function (fileEntry) {
            fileEntry.file(function (file) {
                const reader = new FileReader();
                reader.onloadend = e => {
                    if (e) console.error(e);
                    else data = JSON.parse(this.result);
                }
                reader.readAsText(file);
            });
        });
    });
    chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: getText
    }).then(items => {
        process([...items[0].result.matchAll(/[a-zA-Z]+/g)].map(w => w[0]), data);
    }).catch(console.error);
});

getText = () => document.body.innerText;

process = (input, data) => {

    const words = input.reduce((arr, w) => !arr.includes(w) ? arr.concat([w]) : arr, []).filter(w => w.length > 2 && !data.includes(w.toLowerCase())).sort();

    const root = document.getElementById("root");

    const title = document.createElement("p");
    title.innerHTML = `Words found: ${words.length > 0 ? words.length : 0}`;
    root.append(title);

    if (words.length > 0) {

        const copyHint = document.createElement("p");
        copyHint.innerHTML = "Copy to clipboard";
        root.append(copyHint)

        const buttons = document.createElement("div");
        buttons.className = "row";
        root.append(buttons);

        const copyText = document.createElement("button");
        copyText.innerHTML = "TEXT";
        copyText.onclick = () => {
            navigator.clipboard.writeText(words.join("\n")).catch(console.error);
        };
        buttons.append(copyText);

        const copyCsv = document.createElement("button");
        copyCsv.innerHTML = "CSV";
        copyCsv.onclick = () => {
            navigator.clipboard.writeText(words.join(", ")).catch(console.error);
        };
        buttons.append(copyCsv);

        const ol = document.createElement("ol");
        ol.className = "list";
        words?.forEach(word => {
            const li = document.createElement("li");
            li.innerText = word;
            ol.appendChild(li);
        });
        root.append(ol);

        return words;
    }
    return null;
};
