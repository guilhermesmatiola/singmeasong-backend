import { prisma } from "../../src/database";
import * as recommendationFactory from "./recommendFactory"
import { faker } from "@faker-js/faker";

export async function deleteData() {

	await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}

export async function createScenario20Recommendations() {

    let createManyRecomendation = [];

    for (let i = 0; i < 19; i++) {
        const create20recomendations = await recommendationFactory.CreateRecommendationFactory();
        createManyRecomendation.push(create20recomendations)
      }

    await prisma.recommendation.createMany({ data: createManyRecomendation });
}

export async function createScenarioToReturnOneRecommendation() {

	const newRecommendation = await recommendationFactory.CreateRecommendationFactory();

	const result = await prisma.recommendation.create({
		data: newRecommendation,
	});

	return result;
}

export async function createScenarioToDeleteWithDownvote() {
	const recommendation = await recommendationFactory.CreateRecommendationFactory();

	const result = await prisma.recommendation.create({
		data: { ...recommendation, score: -5 },
	});

	return result;
}

export async function createScenarioForGetRandomRecommendation() {
	const recommendationHighScore = await recommendationFactory.CreateRecommendationFactory();
	const recommendationLowScore = await recommendationFactory.CreateRecommendationFactory();

	await prisma.recommendation.create({
		data: { ...recommendationHighScore, score: 200 },
	});

	await prisma.recommendation.create({
		data: { ...recommendationLowScore, score: 5 },
	});
}