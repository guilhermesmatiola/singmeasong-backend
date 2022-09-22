import app from "../src/app";
import {prisma} from "../src/database"
import supertest from "supertest";
import * as recommendationFactory from "./factories/recommendFactory"
import * as scenarioFactory from "./factories/scenarioFactory"

beforeEach(async () =>{
    await scenarioFactory.deleteData();
})

describe("Testing route post /recommendations", ()=>{

    it("return 201 - success create recommendation", async () =>{

        const postRecommendation = await recommendationFactory.CreateRecommendationFactory();
        const result = await supertest(app).post("/recommendations").send(postRecommendation);

        const verifyCreate = await prisma.recommendation.findUnique({
            where: {name: postRecommendation.name}
        });

        expect(result.status).toBe(201);
        expect(verifyCreate).not.toBeNull();

    });

    it("return 422 - wrong input: null invalid name", async () =>{

        const postRecommendation = await recommendationFactory.CreateRecommendationFactory();
        const result = await supertest(app).post("/recommendations").send({...postRecommendation, name:null});

        expect(result.status).toBe(422);

    });

    it("return 422 - wrong input: null invalid youtube link", async () =>{

        const postRecommendation = await recommendationFactory.CreateRecommendationFactory();
        const result = await supertest(app).post("/recommendations").send({...postRecommendation, youtubeLink:null});

        expect(result.status).toBe(422);

    });

    it("return 422 - wrong input: invalid youtube link", async () =>{

        const postRecommendation = await recommendationFactory.CreateRecommendationFactory();
        const result = await supertest(app).post("/recommendations").send({...postRecommendation, youtubeLink: "https://github.com/guilhermesmatiola/projeto21-singmeasong-back"});

        expect(result.status).toBe(422);

    });

    it("return 422 - wrong input: empty body", async () =>{

        const postRecommendation = await recommendationFactory.CreateRecommendationFactory();
        const result = await supertest(app).post("/recommendations").send({});

        expect(result.status).toBe(422);

    });

    it("return 409 - already has a recommendations with this name", async () => {

		const postRecommendation = await recommendationFactory.CreateRecommendationFactory();

		await supertest(app).post("/recommendations").send(postRecommendation);
		const result = await supertest(app).post("/recommendations").send(postRecommendation);

		expect(result.status).toBe(409);
	});

});

describe("Testing route get /recommendations", () => {

	it("return 200 - Posted twenty recommendations, but need to get just ten", async () => {

		await scenarioFactory.createScenario20Recommendations();

		const result = await supertest(app).get("/recommendations/").send();

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Array);
		expect(result.body.length).not.toBeGreaterThan(10);
	});

});

describe("Test in route get /recommendations/:id", () => {

	it("return 200 - need to get the correct recommendations with valid id", async () => {

		const recommendationById = await scenarioFactory.createScenarioToReturnOneRecommendation();

		const result = await supertest(app).get(`/recommendations/${recommendationById.id}`).send();

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Object);
		expect(result.body).toEqual(recommendationById);
	});

	it("return 404 - nonexistent id", async () => {
		const result = await supertest(app).get("/recommendations/123456789").send();

		expect(result.status).toBe(404);
	}); 

});

describe("Test in route post /recommendations/:id/upvote", () => {

	it("return 200 - if have a valid id && score greater than 0", async () => {

		const recommendationById = await scenarioFactory.createScenarioToReturnOneRecommendation();

		const result = await supertest(app).post(`/recommendations/${recommendationById.id}/upvote`).send();
		const recommendationUpvoted = await prisma.recommendation.findUnique({
			where: { id: recommendationById.id },
		});

		expect(result.status).toBe(200);
		expect(recommendationUpvoted.score).toBeGreaterThan(0);
	});

    it("return 404 - if have a invalid id", async () => {

		const result = await supertest(app).post("/recommendations/123456789/upvote").send();

		expect(result.status).toBe(404);
		expect(result.text).toBe("");
	});

});

describe("Test in route post /recommendations/:id/downvote", () => {

	it("return 200 - valid id and negative votes", async () => {

		const recommendationById = await scenarioFactory.createScenarioToReturnOneRecommendation();

		const result = await supertest(app).post(`/recommendations/${recommendationById.id}/downvote`).send();

		const recommendationDownvoted = await prisma.recommendation.findUnique({
			where: { id: recommendationById.id },
		});

		expect(result.status).toBe(200);
		expect(recommendationDownvoted.score).toBeLessThan(0);
	});

    it("return 200 - valid id and delete recommendation with -5 score", async () => {

		const recommendationById = await scenarioFactory.createScenarioToDeleteWithDownvote();

		const result = await supertest(app).post(`/recommendations/${recommendationById.id}/downvote`).send();
		const RecommendationDeleted = await prisma.recommendation.findUnique({
			where: { id: recommendationById.id }
		});

		expect(result.status).toBe(200);
		expect(RecommendationDeleted).toBeNull();
	});
});


afterAll(async () => {
	await prisma.$disconnect();
});
