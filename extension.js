const vscode = require('vscode');
const { Agent } = require('alith');
require('dotenv').config();

function activate(context) {
    console.log('✅ LazAI Autocomplete is now active!');

    // --------------------------
    // 1️⃣ Completion Provider
    // --------------------------
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'javascript',
        {
            provideCompletionItems(document, position) {
                const completions = [];

                // LazAI Classes
                completions.push(new vscode.CompletionItem('Agent', vscode.CompletionItemKind.Class));
                completions.push(new vscode.CompletionItem('Tool', vscode.CompletionItemKind.Class));

                // LazAI Methods
                const addToolCompletion = new vscode.CompletionItem('addTool', vscode.CompletionItemKind.Method);
                addToolCompletion.insertText = new vscode.SnippetString(
                    'addTool({ name: "$1", execute: ($2) => {\n\t$3\n}})'
                );
                addToolCompletion.documentation = 'Adds a new tool to the agent';

                const runCompletion = new vscode.CompletionItem('run', vscode.CompletionItemKind.Method);
                runCompletion.insertText = new vscode.SnippetString('run()');
                runCompletion.documentation = 'Executes the agent with all its tools';

                completions.push(addToolCompletion, runCompletion);

                // Other methods
                completions.push(new vscode.CompletionItem('setName()', vscode.CompletionItemKind.Method));
                completions.push(new vscode.CompletionItem('getTools()', vscode.CompletionItemKind.Method));

                return completions;
            }
        },
        '.' // trigger on dot
    );

    // --------------------------
    // 2️⃣ Hover Provider
    // --------------------------
    const hoverProvider = vscode.languages.registerHoverProvider('javascript', {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

            const docs = {
                'Agent': '**Agent**: Main class to create a LazAI agent.\n\nExample:\n```js\nconst agent = new Agent({ model: "gpt-4" })\n```\n[Learn more](https://lazai-docs.example.com/agent)',
                'Tool': '**Tool**: Defines a skill or function for the agent.\n\nExample:\n```js\nagent.addTool({ name: "jokes", execute: () => "funny" })\n```\n[Learn more](https://lazai-docs.example.com/tool)',
                'run': '**run()**: Executes the agent with all its tools.\n\nExample:\n```js\nagent.run()\n```\n[Learn more](https://lazai-docs.example.com/run)',
                'addTool': '**addTool()**: Adds a new tool to the agent.\n\nExample:\n```js\nagent.addTool({ name: "calculator", execute: () => {} })\n```\n[Learn more](https://lazai-docs.example.com/addTool)',
                'setName': '**setName()**: Sets a custom name for the agent.\n\nExample:\n```js\nagent.setName("ComedianBot")\n```\n[Learn more](https://lazai-docs.example.com/setName)',
                'getTools': '**getTools()**: Returns a list of tools added to the agent.\n\nExample:\n```js\nagent.getTools()\n```\n[Learn more](https://lazai-docs.example.com/getTools)'
            };

            if (docs[word]) {
                return new vscode.Hover(new vscode.MarkdownString(docs[word]));
            }
        }
    });

    // --------------------------
    // 3️⃣ Docs Panel Command
    // --------------------------
    const docPanelCommand = vscode.commands.registerCommand('lazai-autocomplete.showDocs', () => {
        const panel = vscode.window.createWebviewPanel(
            'lazaiDocs',
            'LazAI SDK Docs',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );
        panel.webview.html = getWebviewContent();
    });

    // --------------------------
    // 4️⃣ AI Suggestion Command
    // --------------------------
    const aiSuggestCommand = vscode.commands.registerCommand('lazai-autocomplete.suggestAI', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const pos = editor.selection.active;
        const textBefore = doc.getText(new vscode.Range(new vscode.Position(0, 0), pos));

        const agent = new Agent({
            model: "gpt-4", // adjust to your available model
            apiKey: process.env.GROQ_API_KEY
        });

        vscode.window.showInformationMessage('🤖 LazAI is generating suggestions...');

        try {
            // Using .prompt() for AI completions
            const suggestion = await agent.prompt(`Suggest the next few lines of code:\n\n${textBefore}`);

            if (suggestion && typeof suggestion === 'string') {
                editor.insertSnippet(new vscode.SnippetString(suggestion), pos);
            } else {
                vscode.window.showWarningMessage('No AI suggestion available.');
            }
        } catch (err) {
            vscode.window.showErrorMessage('AI suggestion failed: ' + err.message);
        }
    });

    // --------------------------
    // Register Everything
    // --------------------------
    context.subscriptions.push(
        completionProvider,
        hoverProvider,
        docPanelCommand,
        aiSuggestCommand
    );
}

function deactivate() {}

module.exports = { activate, deactivate };

// --------------------------
// HTML content for Docs Panel
// --------------------------
function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>LazAI SDK Docs</title>
        <style>
            body { font-family: sans-serif; padding: 10px; }
            h2 { color: #007acc; }
            a { text-decoration: none; color: #0066cc; }
            a:hover { text-decoration: underline; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>LazAI SDK Documentation</h1>
        <h2>Agent</h2>
        <p>Main class to create a LazAI agent.</p>
        <pre>const agent = new Agent({ model: "gpt-4" })</pre>
        <a href="https://lazai-docs.example.com/agent">Learn more</a>

        <h2>Tool</h2>
        <p>Defines a skill or function for the agent.</p>
        <pre>agent.addTool({ name: "jokes", execute: () => "funny" })</pre>
        <a href="https://lazai-docs.example.com/tool">Learn more</a>

        <h2>run()</h2>
        <p>Executes the agent with all its tools.</p>
        <pre>agent.run()</pre>
        <a href="https://lazai-docs.example.com/run">Learn more</a>

        <h2>addTool()</h2>
        <p>Adds a new tool to the agent.</p>
        <pre>agent.addTool({ name: "calculator", execute: () => {} })</pre>
        <a href="https://lazai-docs.example.com/addTool">Learn more</a>

        <h2>setName()</h2>
        <p>Sets a custom name for the agent.</p>
        <pre>agent.setName("ComedianBot")</pre>
        <a href="https://lazai-docs.example.com/setName">Learn more</a>

        <h2>getTools()</h2>
        <p>Returns a list of tools added to the agent.</p>
        <pre>agent.getTools()</pre>
        <a href="https://lazai-docs.example.com/getTools">Learn more</a>
    </body>
    </html>
    `;
}
