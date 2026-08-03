import { execFileSync } from "node:child_process";
import path from "node:path";
import type { CollectionEntry } from "astro:content";

const modifiedDateCache = new Map<string, Date | undefined>();

/**
 * Gets the date of the latest commit that changed a post, following its file
 * across renames. Builds without a Git checkout (for example, source archives)
 * remain functional and simply omit the generated update date.
 */
export function getGitModifiedDate(
	post: Pick<CollectionEntry<"posts">, "id">,
): Date | undefined {
	const cached = modifiedDateCache.get(post.id);
	if (cached || modifiedDateCache.has(post.id)) return cached;

	try {
		const file = path.join("src", "content", "posts", post.id);
		const value = execFileSync(
			"git",
			["log", "-1", "--follow", "--format=%cI", "--", file],
			{ cwd: process.cwd(), encoding: "utf8" },
		).trim();
		const date = value ? new Date(value) : undefined;
		const result = date && !Number.isNaN(date.getTime()) ? date : undefined;
		modifiedDateCache.set(post.id, result);
		return result;
	} catch {
		modifiedDateCache.set(post.id, undefined);
		return undefined;
	}
}
