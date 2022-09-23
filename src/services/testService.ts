import * as testRepository from "../repositories/testRepository.js";

export async function truncate() {
	await testRepository.truncate();
}