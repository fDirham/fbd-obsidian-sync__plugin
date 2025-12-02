import axios from "axios";
import JSZip from "jszip";
import { App, normalizePath } from "obsidian";

export async function uploadVaultZip(
	app: App,
	uploadUrl: string,
	cb?: (percent: number) => void
) {
	const zip = new JSZip();

	// 1. Get all files in vault
	console.group("Upload vault zip");
	console.group("Zipping vault files for upload");

	const files = app.vault.getFiles();
	console.info(`Found ${files.length} files in vault`);

	let filesAdded = 0;
	for (const file of files) {
		try {
			// Read file as binary ArrayBuffer
			const data = await app.vault.readBinary(file);

			// Add to zip using the vault-relative path
			zip.file(file.path, data);
			filesAdded++;
		} catch (e) {
			throw new Error(`Could not add file ${file.path} to zip: ${e}`);
		}
	}
	console.info(`Added ${filesAdded} files to zip`);

	// 2. Generate zip file as a Blob or Uint8Array
	const zippedContent = await zip.generateAsync({
		type: "uint8array",
		compression: "DEFLATE",
		compressionOptions: { level: 6 },
	});
	console.info(`Generated zip file, size: ${zippedContent.length} bytes`);

	console.groupEnd();

	console.group("Uploading vault zip");
	await axios.put(uploadUrl, zippedContent, {
		headers: {
			"Content-Type": "application/octet-stream",
		},
		maxBodyLength: Infinity,
		onUploadProgress: (progress) => {
			const percent = Math.round(
				(progress.loaded / zippedContent.length) * 100
			);
			if (cb) {
				cb(percent);
			}
			console.info(`Upload progress: ${percent}%`);
		},
	});
	console.groupEnd();
	console.groupEnd();
}

export async function downloadVaultZip(
	app: App,
	downloadUrl: string,
	filePath: string,
	cb?: (percent: number) => void
): Promise<void> {
	console.group("Download vault zip");
	const response = await axios.get(downloadUrl, {
		responseType: "arraybuffer",
		onDownloadProgress: (progress) => {
			if (progress.total) {
				const percent = Math.round(
					(progress.loaded / progress.total) * 100
				);
				if (cb) {
					cb(percent);
				}
				console.info(`Download progress: ${percent}%`);
			}
		},
	});

	await app.vault.adapter.writeBinary(filePath, response.data);
	console.info("Wrote downloaded zip to:", filePath);
	console.groupEnd();
}

export async function extractZipToVault(
	app: App,
	zipFilePath: string,
	targetFolderPath: string
): Promise<void> {
	console.group("Extract vault zip");

	// Read the zip file as binary
	const zipData = await app.vault.adapter.readBinary(zipFilePath);

	// Load the zip data using JSZip
	const zip = await JSZip.loadAsync(zipData);

	// Iterate through each file in the zip
	const fileEntries = Object.entries(zip.files);
	console.info(`Extracting ${fileEntries.length} files to vault`);

	for (const [relativePath, zipEntry] of fileEntries) {
		if (!zipEntry.dir) {
			// Read the file content as Uint8Array
			const fileData = await zipEntry.async("arraybuffer");

			// Construct the full path in the vault
			const fullPath = normalizePath(
				`${targetFolderPath}/${relativePath}`
			);

			// Ensure the directory exists
			const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));
			try {
				await app.vault.adapter.mkdir(dirPath);
			} catch (e) {
				console.error(e);
				throw new Error(
					`Could not create directory ${dirPath} in vault: ${e}`
				);
			}

			// Write the file to the vault
			await app.vault.adapter.writeBinary(fullPath, fileData);
			console.info("Wrote file", fullPath);
		}
	}
	console.groupEnd();
}

export async function deleteAllVaultFiles(app: App): Promise<void> {
	console.group("Delete all vault files");

	// Get all files in the vault
	const files = app.vault.getFiles();
	console.info(`Deleting ${files.length} files from vault`);

	// Delete each file directly via adapter (bypasses vault events/listeners)
	let filesDeleted = 0;
	for (const file of files) {
		try {
			await app.vault.adapter.remove(file.path);
			filesDeleted++;
		} catch (e) {
			console.error(`Could not delete file ${file.path}:`, e);
			throw e;
		}
	}
	console.info(`Deleted ${filesDeleted} files from vault`);

	// After deleting files, check for remaining folders
	const folders = await getAllFolders(app);
	console.info(`Found ${folders.length} folders to delete from vault`);

	// Sort folders by depth (deepest first) to avoid deleting parent before children
	const sortedFolders = folders.sort(
		(a, b) => b.split("/").length - a.split("/").length
	);

	let foldersDeleted = 0;
	for (const folderPath of sortedFolders) {
		try {
			await app.vault.adapter.rmdir(folderPath, false);
			foldersDeleted++;
		} catch (e) {
			// Folder might not be empty or already deleted
			console.error(`Could not delete folder ${folderPath}:`, e);
			throw e;
		}
	}
	console.info(`Deleted ${foldersDeleted} folders from vault`);
	console.groupEnd();
}

async function getAllFolders(app: App): Promise<string[]> {
	const folders: string[] = [];
	app.vault.getAllFolders().forEach((folder) => {
		folders.push(folder.path);
	});

	return folders;
}
