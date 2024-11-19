import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// Initialize the fileColors map with stored colors from workspace state
	const fileColors = new Map<string, string>(
		Object.entries(
			context.workspaceState.get<Record<string, string>>('fileColors', {})
		)
	);

	const decorationChangeEvent = new vscode.EventEmitter<
		vscode.Uri | vscode.Uri[] | undefined
	>();

	// Define the file decoration provider
	const fileDecorationProvider: vscode.FileDecorationProvider = {
		onDidChangeFileDecorations: decorationChangeEvent.event,
		provideFileDecoration(uri: vscode.Uri) {
			const color = fileColors.get(uri.fsPath);
			if (color) {
				return {
					badge: '⬤',
					tooltip: `File: ${color}`,
					color: new vscode.ThemeColor(color),
				};
			}
			return undefined;
		},
	};

	// Register the file decoration provider
	context.subscriptions.push(
		vscode.window.registerFileDecorationProvider(fileDecorationProvider)
	);

	// Define the list of available colors
	const colors = [
		{ label: '🔴 Red', color: 'charts.red' },
		{ label: '🟢 Green', color: 'charts.green' },
		{ label: '🔵 Blue', color: 'charts.blue' },
		{ label: '🟡 Yellow', color: 'charts.yellow' },
		{ label: '⚫ Black', color: 'editor.background' },
		{ label: '🟠 Orange', color: 'charts.orange' },
		{ label: '🟣 Purple', color: 'charts.purple' },
		{ label: '🟤 Brown', color: 'charts.brown' },
		{ label: '🔘 Gray', color: 'editorLineNumber.foreground' },
		{ label: '🌊 Cyan', color: 'charts.cyan' },
		{ label: '💚 Lime', color: 'charts.green' },
		{ label: '💙 Sky Blue', color: 'charts.blue' },
		{ label: '💜 Violet', color: 'charts.purple' },
		{ label: '🤎 Chocolate', color: 'charts.brown' },
	];

	// Register the command to pick a file color
	const disposable = vscode.commands.registerCommand(
		'extension.pickFileColor',
		async (uri: vscode.Uri) => {
			const pickedColorLabel = await vscode.window.showQuickPick(
				colors.map(c => c.label),
				{ placeHolder: 'Select file color' }
			);

			if (pickedColorLabel) {
				const selectedColor = colors.find(c => c.label === pickedColorLabel)!;
				fileColors.set(uri.fsPath, selectedColor.color);

				// Update the stored colors in workspace state
				await context.workspaceState.update(
					'fileColors',
					Object.fromEntries(fileColors)
				);

				// Notify that the file decorations have changed
				decorationChangeEvent.fire(uri);

				vscode.window.showInformationMessage(
					`File "${uri.fsPath}" has changed color to ${selectedColor.color}`
				);
			}
		}
	);
	context.subscriptions.push(disposable);
}

export function deactivate() {}
