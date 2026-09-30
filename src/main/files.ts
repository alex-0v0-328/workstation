import { chmod, readFile, unlink, writeFile } from 'node:fs/promises'

// MSI installs resource files read-only, and fs.copyFile carries that attribute into the profile,
// after which Windows refuses to overwrite or delete the copy (EPERM). Profile files are therefore
// written from content, and the read-only bit is cleared before any replace or delete.
async function makeWritable(path: string): Promise<void> {
  try { await chmod(path, 0o666) } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e }
}

export async function writeReplacing(path: string, data: string | Uint8Array): Promise<void> {
  await makeWritable(path)
  await writeFile(path, data)
}

export async function copyContent(from: string, to: string): Promise<void> {
  await writeReplacing(to, await readFile(from))
}

export async function removeFile(path: string): Promise<void> {
  await makeWritable(path)
  await unlink(path)
}
