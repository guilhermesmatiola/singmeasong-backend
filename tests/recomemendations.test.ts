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


})